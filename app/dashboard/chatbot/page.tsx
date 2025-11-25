
"use client";
import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  chatId: string;
  title: string;
  createdAt: string;
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setShowGeneralSidebar, setSidebarCollapsed } = useSidebar();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  // Hide general sidebar when component mounts
  useEffect(() => {
    setShowGeneralSidebar(false);
    setSidebarCollapsed(true); // Collapse the main sidebar

    return () => {
      setShowGeneralSidebar(true);
      setSidebarCollapsed(false); // Expand the main sidebar
    };
  }, [setShowGeneralSidebar, setSidebarCollapsed]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      } else {
        console.error("Failed to fetch conversations:", response.status);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchChatHistory = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/ai/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.conversation) {
          const formattedMessages: Message[] = data.data.conversation.map(
            (msg: any) => ({
              id: `${msg._id || Date.now()}`,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(),
            })
          );
          setMessages(formattedMessages);
        }
      } else {
        console.error("Failed to fetch chat history:", response.status);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInputMessage("");
    setUploadedFileName(null);
    setUploadedFile(null);
    // Focus input after new chat
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentChatId(conversation.chatId);
    await fetchChatHistory(conversation.chatId);
    setUploadedFileName(null);
    setUploadedFile(null);
    // Focus input after selecting conversation
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Generate Quiz function
  const handleGenerateQuiz = async () => {
    if (!currentChatId) {
      alert("Please select a conversation first to generate a quiz.");
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/ai/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: currentChatId,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add success message to chat
        const successMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Quiz generated successfully! 🎉\n\nHead to the Quiz page to attempt the questions based on this conversation. The quiz has been created with questions from our discussion.`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, successMessage]);

        // Optional: You could also show a toast notification here
        console.log("Quiz generated successfully:", data);
      } else {
        console.error("Failed to generate quiz:", response.status);
        const errorData = await response.text();

        // Add error message to chat
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Sorry, I couldn't generate a quiz at the moment. Please try again later.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);

      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while generating the quiz. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Extract text from PDF using unpdf
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamically import unpdf to avoid SSR issues
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdfBuffer = await file.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error(
        "Failed to extract text from PDF. Please try another file."
      );
    }
  };

  // Detect action based on message and file
  const detectAction = (message: string, hasFile: boolean): string => {
    const text = message.toLowerCase().trim();

    // Case 1: File only (new or existing chat)
    if (hasFile && !message) return "summarize";

    // Case 2: File + message (in new or existing chat)
    if (hasFile && message) {
      if (
        text.includes("summarize") ||
        text.includes("analyze") ||
        text.length > 100
      )
        return "summarize";
      if (
        text.includes("resource") ||
        text.includes("learn more") ||
        text.includes("study")
      )
        return "resources";
      return "question";
    }

    // Case 3: Text only (existing or new chat)
    if (message) {
      if (text.includes("resource") || text.includes("learn more"))
        return "resources";
      if (text.includes("summarize") || text.length > 200) return "summarize";
      return "question";
    }

    return "question";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !uploadedFile) || isLoading) return;

    const currentInput = inputMessage.trim();
    const currentFile = uploadedFile;

    // Create display message for UI
    let displayContent = "";
    if (currentFile && currentInput) {
      displayContent = `${currentInput}\n\n[Attached: ${uploadedFileName}]`;
    } else if (currentFile && !currentInput) {
      displayContent = `[Uploaded document: ${uploadedFileName}]`;
    } else {
      displayContent = currentInput;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setUploadedFileName(null);
    setUploadedFile(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      let extractedText = "";

      // Extract text from PDF if file is present
      if (currentFile) {
        try {
          extractedText = await extractTextFromPDF(currentFile);
          if (!extractedText) {
            throw new Error("No text could be extracted from the PDF");
          }
        } catch (error) {
          console.error("PDF extraction error:", error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Sorry, I couldn't read that PDF file. Please try another file or check if the PDF contains text.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
      }

      // Determine action type
      const action = detectAction(currentInput, !!currentFile);

      // Construct payload according to your specification
      const payload: any = {
        action: action,
      };

      // Add fileText only if file is present
      if (currentFile) {
        payload.fileText = extractedText;
      }

      // Add message only if user typed something
      if (currentInput) {
        payload.message = currentInput;
      }

      // Include chatId if it exists
      if (currentChatId) {
        payload.chatId = currentChatId;
      }

      console.log("Sending request to:", `${BACKEND_URL}/api/ai/chat`);
      console.log("Final payload:", payload);

      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (!currentChatId && data.data.chatId) {
          setCurrentChatId(data.data.chatId);
          await fetchConversations();
        }
      } else {
        console.error("Failed to send message:", response.status);
        const errorData = await response.text();
        console.error("Error response:", errorData);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Focus input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported");
      return;
    }

    setUploadedFileName(file.name);
    setUploadedFile(file);

    // DON'T create a message here - just show the file indicator
    // The message will be created when the user actually sends
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const removeFile = () => {
    setUploadedFileName(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Chat History Sidebar */}
      <div
        className={`
        w-80 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300
        ${showChatSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        fixed md:relative h-full z-30
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Chat History
            </h2>
            <button
              onClick={() => setShowChatSidebar(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-funlearn6 text-white rounded-lg font-medium hover:bg-funlearn7 transition-colors mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.chatId}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    currentChatId === conversation.chatId
                      ? "bg-funlearn2 text-funlearn8 border border-funlearn4"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversation.title || "New Conversation"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Generate Quiz Button */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <button
            onClick={handleGenerateQuiz}
            disabled={!currentChatId || isGeneratingQuiz}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-funlearn8 text-white rounded-lg font-medium hover:bg-funlearn7 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingQuiz ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Generate Quiz</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Create a quiz based on the current conversation
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white mb-4">
          <div className="flex items-center space-x-4">
            {!showChatSidebar && (
              <button
                onClick={() => setShowChatSidebar(true)}
                className="p-2 hover:bg-funlearn2 rounded-lg transition-colors text-funlearn8"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {currentChatId ? "AI Chat Assistant" : "New Chat"}
              </h2>
              <p className="text-sm text-gray-600">
                {currentChatId
                  ? "Continue your conversation"
                  : "Start a new conversation with AI"}
              </p>
            </div>
          </div>

          {currentChatId && (
            <button
              onClick={handleNewChat}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors shrink-0"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Chat</span>
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4 md:p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-funlearn2 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-funlearn8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  How can I help you today?
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  I'm here to assist you with learning, answer questions,
                  analyze documents, and provide educational resources.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900">
                      Ask questions
                    </div>
                    <div className="text-gray-600">
                      Get detailed explanations
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900">Upload PDFs</div>
                    <div className="text-gray-600">Analyze documents</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md md:max-w-2xl rounded-2xl px-4 py-3 md:px-6 md:py-4 ${
                      message.role === "user"
                        ? "bg-funlearn6 text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <div
                      className={`whitespace-pre-wrap text-sm leading-relaxed ${
                        message.role === "assistant"
                          ? "text-gray-900"
                          : "text-white"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-funlearn3"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 md:px-6 md:py-4 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4 md:p-6 mb-4">
          {/* File Upload Indicator */}
          {uploadedFileName && (
            <div className="mb-4 flex items-center justify-between p-3 bg-funlearn2 rounded-lg">
              <div className="flex items-center space-x-2 min-w-0">
                <svg
                  className="w-5 h-5 text-funlearn8 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-sm font-medium text-funlearn8 truncate">
                  {uploadedFileName}
                </span>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-funlearn4 rounded transition-colors shrink-0 ml-2"
              >
                <svg
                  className="w-4 h-4 text-funlearn8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex space-x-2 md:space-x-4">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center justify-center px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-gray-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </button>

            {/* Message Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                uploadedFileName
                  ? "Type your message about the document..."
                  : "Type your message here..."
              }
              className="flex-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-funlearn6 transition-colors text-gray-900 placeholder-gray-500 text-sm md:text-base"
              disabled={isLoading}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={
                (!inputMessage.trim() && !uploadedFileName) || isLoading
              }
              className="px-4 py-2 md:px-6 md:py-3 bg-funlearn6 text-white rounded-lg font-medium hover:bg-funlearn7 focus:ring-2 focus:ring-funlearn6 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
              ) : (
                "Send"
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Upload PDF files for analysis
          </p>
        </div>
      </div>
    </div>
  );
}


// // components/Dashboard/ChatBot.tsx
// "use client";
// import { useState, useRef, useEffect } from "react";
// import { useSidebar } from "@/contexts/SidebarContext";

// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   timestamp: Date;
// }

// interface Conversation {
//   chatId: string;
//   title: string;
//   createdAt: string;
// }

// export default function ChatBotPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   const [currentChatId, setCurrentChatId] = useState<string | null>(null);
//   const [showChatSidebar, setShowChatSidebar] = useState(true);
//   const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const { setShowGeneralSidebar, setSidebarCollapsed } = useSidebar();

//   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

//   // Hide general sidebar when component mounts
//   useEffect(() => {
//     setShowGeneralSidebar(false);
//     setSidebarCollapsed(true); // Collapse the main sidebar

//     return () => {
//       setShowGeneralSidebar(true);
//       setSidebarCollapsed(false); // Expand the main sidebar
//     };
//   }, [setShowGeneralSidebar, setSidebarCollapsed]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     fetchConversations();
//   }, []);

//   // Focus input on mount
//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, []);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const fetchConversations = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setConversations(data.data || []);
//       } else {
//         console.error("Failed to fetch conversations:", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching conversations:", error);
//     }
//   };

//   const fetchChatHistory = async (chatId: string) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${BACKEND_URL}/api/ai/chat/${chatId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.data && data.data.conversation) {
//           const formattedMessages: Message[] = data.data.conversation.map(
//             (msg: any) => ({
//               id: `${msg._id || Date.now()}`,
//               role: msg.role,
//               content: msg.content,
//               timestamp: new Date(),
//             })
//           );
//           setMessages(formattedMessages);
//         }
//       } else {
//         console.error("Failed to fetch chat history:", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching chat history:", error);
//     }
//   };

//   const handleNewChat = () => {
//     setMessages([]);
//     setCurrentChatId(null);
//     setInputMessage("");
//     setUploadedFileName(null);
//     setUploadedFile(null);
//     // Focus input after new chat
//     setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.focus();
//       }
//     }, 100);
//   };

//   const handleSelectConversation = async (conversation: Conversation) => {
//     setCurrentChatId(conversation.chatId);
//     await fetchChatHistory(conversation.chatId);
//     setUploadedFileName(null);
//     setUploadedFile(null);
//     // Focus input after selecting conversation
//     setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.focus();
//       }
//     }, 100);
//   };

//   // Generate Quiz function
//   const handleGenerateQuiz = async () => {
//     if (!currentChatId) {
//       alert("Please select a conversation first to generate a quiz.");
//       return;
//     }

//     setIsGeneratingQuiz(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${BACKEND_URL}/api/ai/questions`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           chatId: currentChatId,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();

//         // Add success message to chat
//         const successMessage: Message = {
//           id: Date.now().toString(),
//           role: "assistant",
//           content: `Quiz generated successfully! 🎉\n\nHead to the Quiz page to attempt the questions based on this conversation. The quiz has been created with questions from our discussion.`,
//           timestamp: new Date(),
//         };

//         setMessages((prev) => [...prev, successMessage]);

//         // Optional: You could also show a toast notification here
//         console.log("Quiz generated successfully:", data);
//       } else {
//         console.error("Failed to generate quiz:", response.status);
//         const errorData = await response.text();

//         // Add error message to chat
//         const errorMessage: Message = {
//           id: Date.now().toString(),
//           role: "assistant",
//           content:
//             "Sorry, I couldn't generate a quiz at the moment. Please try again later.",
//           timestamp: new Date(),
//         };

//         setMessages((prev) => [...prev, errorMessage]);
//       }
//     } catch (error) {
//       console.error("Error generating quiz:", error);

//       // Add error message to chat
//       const errorMessage: Message = {
//         id: Date.now().toString(),
//         role: "assistant",
//         content:
//           "Sorry, I encountered an error while generating the quiz. Please try again.",
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsGeneratingQuiz(false);
//     }
//   };

//   // Extract text from PDF using unpdf
//   const extractTextFromPDF = async (file: File): Promise<string> => {
//     try {
//       // Dynamically import unpdf to avoid SSR issues
//       const { extractText, getDocumentProxy } = await import("unpdf");
//       const pdfBuffer = await file.arrayBuffer();
//       const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
//       const { text } = await extractText(pdf, { mergePages: true });
//       return text.trim();
//     } catch (error) {
//       console.error("Error extracting text from PDF:", error);
//       throw new Error(
//         "Failed to extract text from PDF. Please try another file."
//       );
//     }
//   };

//   // Detect action based on message and file
//   const detectAction = (message: string, hasFile: boolean): string => {
//     const text = message.toLowerCase().trim();

//     // Case 1: File only (new or existing chat)
//     if (hasFile && !message) return "summarize";

//     // Case 2: File + message (in new or existing chat)
//     if (hasFile && message) {
//       if (
//         text.includes("summarize") ||
//         text.includes("analyze") ||
//         text.length > 100
//       )
//         return "summarize";
//       if (
//         text.includes("resource") ||
//         text.includes("learn more") ||
//         text.includes("study")
//       )
//         return "resources";
//       return "question";
//     }

//     // Case 3: Text only (existing or new chat)
//     if (message) {
//       if (text.includes("resource") || text.includes("learn more"))
//         return "resources";
//       if (text.includes("summarize") || text.length > 200) return "summarize";
//       return "question";
//     }

//     return "question";
//   };

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if ((!inputMessage.trim() && !uploadedFile) || isLoading) return;

//     const currentInput = inputMessage.trim();
//     const currentFile = uploadedFile;

//     // Create display message for UI
//     let displayContent = "";
//     if (currentFile && currentInput) {
//       displayContent = `${currentInput}\n\n[Attached: ${uploadedFileName}]`;
//     } else if (currentFile && !currentInput) {
//       displayContent = `[Uploaded document: ${uploadedFileName}]`;
//     } else {
//       displayContent = currentInput;
//     }

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: "user",
//       content: displayContent,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setUploadedFileName(null);
//     setUploadedFile(null);
//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       let extractedText = "";

//       // Extract text from PDF if file is present
//       if (currentFile) {
//         try {
//           extractedText = await extractTextFromPDF(currentFile);
//           if (!extractedText) {
//             throw new Error("No text could be extracted from the PDF");
//           }
//         } catch (error) {
//           console.error("PDF extraction error:", error);
//           const errorMessage: Message = {
//             id: (Date.now() + 1).toString(),
//             role: "assistant",
//             content:
//               "Sorry, I couldn't read that PDF file. Please try another file or check if the PDF contains text.",
//             timestamp: new Date(),
//           };
//           setMessages((prev) => [...prev, errorMessage]);
//           setIsLoading(false);
//           return;
//         }
//       }

//       // Determine action type
//       const action = detectAction(currentInput, !!currentFile);

//       // Construct payload according to your specification
//       const payload: any = {
//         action: action,
//       };

//       // Add fileText only if file is present
//       if (currentFile) {
//         payload.fileText = extractedText;
//       }

//       // Add message only if user typed something
//       if (currentInput) {
//         payload.message = currentInput;
//       }

//       // Include chatId if it exists
//       if (currentChatId) {
//         payload.chatId = currentChatId;
//       }

//       console.log("Sending request to:", `${BACKEND_URL}/api/ai/chat`);
//       console.log("Final payload:", payload);

//       const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const aiMessage: Message = {
//           id: (Date.now() + 1).toString(),
//           role: "assistant",
//           content: data.data.response,
//           timestamp: new Date(),
//         };

//         setMessages((prev) => [...prev, aiMessage]);

//         if (!currentChatId && data.data.chatId) {
//           setCurrentChatId(data.data.chatId);
//           await fetchConversations();
//         }
//       } else {
//         console.error("Failed to send message:", response.status);
//         const errorData = await response.text();
//         console.error("Error response:", errorData);
//         const errorMessage: Message = {
//           id: (Date.now() + 1).toString(),
//           role: "assistant",
//           content: "Sorry, I encountered an error. Please try again.",
//           timestamp: new Date(),
//         };
//         setMessages((prev) => [...prev, errorMessage]);
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       const errorMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant",
//         content: "Sorry, I encountered an error. Please try again.",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//       // Clear file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//       // Focus input after sending
//       setTimeout(() => {
//         if (inputRef.current) {
//           inputRef.current.focus();
//         }
//       }, 100);
//     }
//   };

//   const handleFileUpload = (file: File) => {
//     if (file.type !== "application/pdf") {
//       alert("Only PDF files are supported");
//       return;
//     }

//     setUploadedFileName(file.name);
//     setUploadedFile(file);

//     // DON'T create a message here - just show the file indicator
//     // The message will be created when the user actually sends
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage(e);
//     }
//   };

//   const removeFile = () => {
//     setUploadedFileName(null);
//     setUploadedFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   return (
//     <div className="flex h-full bg-white">
//       {/* Chat History Sidebar */}
//       <div
//         className={`
//         w-80 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300
//         ${showChatSidebar ? "translate-x-0" : "-translate-x-full absolute"}
//       `}
//       >
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-white">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Chat History
//             </h2>
//             <button
//               onClick={() => setShowChatSidebar(false)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>
//           <button
//             onClick={handleNewChat}
//             className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-funlearn6 text-white rounded-lg font-medium hover:bg-funlearn7 transition-colors"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 4v16m8-8H4"
//               />
//             </svg>
//             <span>New Chat</span>
//           </button>
//         </div>

//         {/* Conversations List */}
//         <div className="flex-1 overflow-y-auto">
//           {conversations.length === 0 ? (
//             <div className="p-6 text-center text-gray-500">
//               <svg
//                 className="w-12 h-12 mx-auto mb-3 opacity-50"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                 />
//               </svg>
//               <p className="text-sm">No conversations yet</p>
//             </div>
//           ) : (
//             <div className="p-2">
//               {conversations.map((conversation) => (
//                 <button
//                   key={conversation.chatId}
//                   onClick={() => handleSelectConversation(conversation)}
//                   className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
//                     currentChatId === conversation.chatId
//                       ? "bg-funlearn2 text-funlearn8 border border-funlearn4"
//                       : "hover:bg-gray-100 text-gray-700"
//                   }`}
//                 >
//                   <div className="flex items-start space-x-3">
//                     <svg
//                       className="w-4 h-4 mt-0.5 shrink-0"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                       />
//                     </svg>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium truncate">
//                         {conversation.title || "New Conversation"}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {new Date(conversation.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Generate Quiz Button */}
//         <div className="p-6 border-t border-gray-200 bg-white">
//           <button
//             onClick={handleGenerateQuiz}
//             disabled={!currentChatId || isGeneratingQuiz}
//             className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-funlearn8 text-white rounded-lg font-medium hover:bg-funlearn7 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isGeneratingQuiz ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 <span>Generating Quiz...</span>
//               </>
//             ) : (
//               <>
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                   />
//                 </svg>
//                 <span>Generate Quiz</span>
//               </>
//             )}
//           </button>
//           <p className="text-xs text-gray-500 mt-2 text-center">
//             Create a quiz based on the current conversation
//           </p>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Chat Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             {!showChatSidebar && (
//               <button
//                 onClick={() => setShowChatSidebar(true)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 6h16M4 12h16M4 18h16"
//                   />
//                 </svg>
//               </button>
//             )}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">
//                 {currentChatId ? "AI Chat Assistant" : "New Chat"}
//               </h2>
//               <p className="text-sm text-gray-600">
//                 {currentChatId
//                   ? "Continue your conversation"
//                   : "Start a new conversation with AI"}
//               </p>
//             </div>
//           </div>

//           {currentChatId && (
//             <button
//               onClick={handleNewChat}
//               className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors shrink-0"
//             >
//               <svg
//                 className="w-4 h-4 shrink-0"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 4v16m8-8H4"
//                 />
//               </svg>
//               <span>New Chat</span>
//             </button>
//           )}
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 overflow-y-auto bg-gray-50">
//           {messages.length === 0 ? (
//             <div className="h-full flex items-center justify-center p-8">
//               <div className="text-center max-w-md">
//                 <div className="w-20 h-20 bg-funlearn2 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <svg
//                     className="w-10 h-10 text-funlearn8"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                   How can I help you today?
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   I'm here to assist you with learning, answer questions,
//                   analyze documents, and provide educational resources.
//                 </p>
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div className="p-3 bg-white rounded-lg border border-gray-200">
//                     <div className="font-medium text-gray-900">
//                       Ask questions
//                     </div>
//                     <div className="text-gray-600">
//                       Get detailed explanations
//                     </div>
//                   </div>
//                   <div className="p-3 bg-white rounded-lg border border-gray-200">
//                     <div className="font-medium text-gray-900">Upload PDFs</div>
//                     <div className="text-gray-600">Analyze documents</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="p-6 space-y-6">
//               {messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex ${
//                     message.role === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-2xl rounded-2xl px-6 py-4 ${
//                       message.role === "user"
//                         ? "bg-funlearn6 text-white rounded-br-none"
//                         : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
//                     }`}
//                   >
//                     <div
//                       className={`whitespace-pre-wrap text-sm leading-relaxed ${
//                         message.role === "assistant"
//                           ? "text-gray-900"
//                           : "text-white"
//                       }`}
//                     >
//                       {message.content}
//                     </div>
//                     <div
//                       className={`text-xs mt-2 ${
//                         message.role === "user"
//                           ? "text-funlearn3"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {message.timestamp.toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               {isLoading && (
//                 <div className="flex justify-start">
//                   <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm">
//                     <div className="flex space-x-1">
//                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                       <div
//                         className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                         style={{ animationDelay: "0.1s" }}
//                       ></div>
//                       <div
//                         className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                         style={{ animationDelay: "0.2s" }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>
//           )}
//         </div>

//         {/* Input Area */}
//         <div className="border-t border-gray-200 bg-white p-6">
//           {/* File Upload Indicator */}
//           {uploadedFileName && (
//             <div className="mb-4 flex items-center justify-between p-3 bg-funlearn2 rounded-lg">
//               <div className="flex items-center space-x-2">
//                 <svg
//                   className="w-5 h-5 text-funlearn8"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
//                   />
//                 </svg>
//                 <span className="text-sm font-medium text-funlearn8">
//                   {uploadedFileName}
//                 </span>
//               </div>
//               <button
//                 onClick={removeFile}
//                 className="p-1 hover:bg-funlearn4 rounded transition-colors"
//               >
//                 <svg
//                   className="w-4 h-4 text-funlearn8"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//           )}

//           <form onSubmit={handleSendMessage} className="flex space-x-4">
//             {/* File Upload Button */}
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               disabled={isLoading}
//               className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
//             >
//               <svg
//                 className="w-5 h-5 text-gray-600 shrink-0"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
//                 />
//               </svg>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 accept=".pdf"
//                 onChange={(e) => {
//                   if (e.target.files?.[0]) {
//                     handleFileUpload(e.target.files[0]);
//                   }
//                 }}
//                 className="hidden"
//               />
//             </button>

//             {/* Message Input */}
//             <input
//               ref={inputRef}
//               type="text"
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyDown={handleKeyPress}
//               placeholder={
//                 uploadedFileName
//                   ? "Type your message about the document..."
//                   : "Type your message here..."
//               }
//               className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-funlearn6 transition-colors text-gray-900 placeholder-gray-500"
//               disabled={isLoading}
//             />

//             {/* Send Button */}
//             <button
//               type="submit"
//               disabled={
//                 (!inputMessage.trim() && !uploadedFileName) || isLoading
//               }
//               className="px-6 py-3 bg-funlearn6 text-white rounded-lg font-medium hover:bg-funlearn7 focus:ring-2 focus:ring-funlearn6 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
//             >
//               {isLoading ? (
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
//               ) : (
//                 "Send"
//               )}
//             </button>
//           </form>
//           <p className="text-xs text-gray-500 mt-2 text-center">
//             Press Enter to send • Upload PDF files for analysis
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
