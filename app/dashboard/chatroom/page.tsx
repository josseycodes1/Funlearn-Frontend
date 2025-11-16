"use client";
import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

interface ChatMessage {
  _id: string;
  chatroom: string;
  sender: {
    _id: string;
    userName: string;
    avatar?: {
      public_id: string;
      url: string;
    };
  };
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
  isOwn?: boolean;
  tempId?: string;
}

interface ChatRoom {
  _id: string;
  name: string;
  creator: string;
  members: string[];
  inviteLink: string;
  createdAt: string;
}

interface User {
  _id: string;
  userName: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

interface UploadingFile {
  tempId: string;
  fileName: string;
  progress: number;
  fileType: string;
  fileSize: number;
  status: "uploading" | "error" | "success";
  error?: string;
}

export default function ChatRoom() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinToken, setJoinToken] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const currentUserRef = useRef<User | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  // Create Axios instance with default config
  const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000, // 30 second timeout for file uploads
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle responses and errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    initializeSocket();
    fetchCurrentUser();
    fetchUserChatrooms();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket && activeRoom) {
      // Leave previous room if any
      socket.emit("leaveRoom", activeRoom);

      // Join new room
      socket.emit("joinRoom", activeRoom);

      // Fetch messages for the room
      fetchRoomMessages(activeRoom);
    }
  }, [activeRoom, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, uploadingFiles]);

  const initializeSocket = () => {
    const newSocket = io(BACKEND_URL as string, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
    });

    newSocket.on(
      "receiveMessage",
      (message: ChatMessage & { tempId?: string }) => {
        setMessages((prev) => {
          // 1) If server returns a tempId, replace the temp message with the server message
          if (message.tempId) {
            const found = prev.find((m) => m._id === message.tempId);
            if (found) {
              console.log("🔄 Replacing temp message with server message");
              return prev.map((m) =>
                m._id === message.tempId
                  ? {
                      ...message,
                      isOwn: message.sender._id === currentUserRef.current?._id,
                    }
                  : m
              );
            }
          }

          // 2) If message already exists by real _id, do nothing
          if (prev.find((m) => m._id === message._id)) {
            console.log("⚠️ Message already exists, skipping");
            return prev;
          }

          // 3) Else append the server message
          console.log("➕ Adding new message to chat");
          const messageWithOwnStatus = {
            ...message,
            isOwn: message.sender._id === currentUserRef.current?._id,
          };

          return [...prev, messageWithOwnStatus];
        });

        // Remove the uploading file when server confirms the message
        if (message.tempId) {
          setUploadingFiles((prev) =>
            prev.filter((file) => file.tempId !== message.tempId)
          );
        }
      }
    );

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      setCurrentUser(response.data.user);
      currentUserRef.current = response.data.user;
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUserChatrooms = async () => {
    try {
      const response = await api.get("/api/chatroom");
      setChatRooms(response.data);
    } catch (error: any) {
      console.error("Error fetching chatrooms:", error);
      alert(error.response?.data?.message || "Failed to load chat rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomMessages = async (roomId: string) => {
    try {
      const response = await api.get(`/api/chatroom/messages/${roomId}`);
      const messagesData: ChatMessage[] = response.data.messages || [];
      const messagesWithOwnStatus = messagesData.map((message) => ({
        ...message,
        isOwn: message.sender._id === currentUser?._id,
      }));
      setMessages(messagesWithOwnStatus);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createChatroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await api.post("/api/chatroom", {
        name: newRoomName,
      });

      const newRoom = response.data;
      setChatRooms((prev) => [newRoom, ...prev]);
      setNewRoomName("");
      setIsCreatingRoom(false);
      joinRoom(newRoom._id);
    } catch (error: any) {
      console.error("Error creating chatroom:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create chatroom. Please try again."
      );
    }
  };

  const joinChatroomByToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinToken.trim()) return;

    try {
      const response = await api.post(`/api/chatroom/join/${joinToken}`);
      const joinedRoom = response.data;

      // Refetch all chat rooms to get updated list
      await fetchUserChatrooms();

      setJoinToken("");
      setIsJoiningRoom(false);
      joinRoom(joinedRoom._id);
      alert("Successfully joined the chat room!");
    } catch (error: any) {
      console.error("Error joining chatroom:", error);
      alert(
        error.response?.data?.message ||
          "Failed to join chatroom. Please check the invite link."
      );
    }
  };

  const joinRoom = async (roomId: string) => {
    console.log("🚪 Joining room:", roomId);
    setActiveRoom(roomId);
    setMessages([]);
    setUploadingFiles([]);
  };

  const leaveRoom = () => {
    console.log("🚪 Leaving room:", activeRoom);
    if (socket && activeRoom) {
      socket.emit("leaveRoom", activeRoom);
    }
    setActiveRoom(null);
    setMessages([]);
    setUploadingFiles([]);
  };

  // NEW FUNCTION: Exit chatroom
  const exitChatroom = async (roomId: string) => {
    if (!confirm("Are you sure you want to exit this chat room?")) {
      return;
    }

    try {
      await api.post("/api/chatroom/exit", {
        roomId: roomId,
      });

      // If exiting the active room, leave it first
      if (activeRoom === roomId) {
        leaveRoom();
      }

      // Refresh the chat rooms list
      await fetchUserChatrooms();

      alert("Successfully exited the chat room!");
    } catch (error: any) {
      console.error("Error exiting chatroom:", error);
      alert(
        error.response?.data?.message ||
          "Failed to exit chatroom. Please try again."
      );
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !socket || !currentUser) return;

    // Generate a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;

    const messageData = {
      chatroomId: activeRoom,
      senderId: currentUser._id,
      content: newMessage,
      fileUrl: undefined,
      fileType: undefined,
      tempId, // attach tempId so server can echo it back
    };

    // Emit the message via socket
    socket.emit("sendMessage", messageData);

    // Optimistically add the message to the UI
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      chatroom: activeRoom,
      sender: {
        _id: currentUser._id,
        userName: currentUser.userName,
        avatar: currentUser.avatar,
      },
      content: newMessage,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
  };

  const copyInviteLink = async (room: ChatRoom) => {
    const inviteLink = `${room.inviteLink}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("Invite code copied to clipboard!");
    } catch (err) {
      console.error("Failed to code invite link:", err);
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Invite link copied to clipboard!");
    }
  };

  const uploadFile = async (file: File) => {
    const tempId = `file-${Date.now()}-${file.name}`;

    // Add to uploading files list immediately
    const uploadingFile: UploadingFile = {
      tempId,
      fileName: file.name,
      progress: 0,
      fileType: file.type,
      fileSize: file.size,
      status: "uploading",
    };

    setUploadingFiles((prev) => [...prev, uploadingFile]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/chatroom/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Update progress for this specific file
            setUploadingFiles((prev) =>
              prev.map((f) => (f.tempId === tempId ? { ...f, progress } : f))
            );
          }
        },
      });

      const data = response.data;

      // Mark as success temporarily
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.tempId === tempId ? { ...f, status: "success", progress: 100 } : f
        )
      );

      if (socket && activeRoom && currentUser) {
        const messageData = {
          chatroomId: activeRoom,
          senderId: currentUser._id,
          content: `File: ${file.name}`,
          fileUrl: data.url,
          fileType: file.type,
          tempId, // Include tempId so we can match it on the server response
        };

        socket.emit("sendMessage", messageData);
      }

      return data.url;
    } catch (error: any) {
      console.error("❌ Error uploading file:", error);
      console.error("Error response:", error.response?.data);

      // Mark as error
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.tempId === tempId
            ? {
                ...f,
                status: "error",
                error: error.response?.data?.message || "Upload failed",
              }
            : f
        )
      );

      // Auto-remove error after 5 seconds
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.tempId !== tempId));
      }, 5000);

      alert(
        error.response?.data?.message ||
          "Failed to upload file. Please try again."
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size too large. Please select a file smaller than 10MB.");
        return;
      }

      // Reset the input to allow uploading the same file again
      event.target.value = "";
      uploadFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎥";
    if (fileType.startsWith("audio/")) return "🎵";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
    return "📎";
  };

  const renderUploadingFiles = () => {
    return uploadingFiles.map((file) => (
      <div key={file.tempId} className="flex justify-end mb-4">
        <div
          className={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 ${
            file.status === "error"
              ? "bg-red-50 border border-red-200"
              : file.status === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-lg">{getFileIcon(file.fileType)}</span>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  file.status === "error"
                    ? "text-red-900"
                    : file.status === "success"
                    ? "text-green-900"
                    : "text-blue-900"
                }`}
              >
                {file.fileName}
              </p>
              <p
                className={`text-xs ${
                  file.status === "error"
                    ? "text-red-700"
                    : file.status === "success"
                    ? "text-green-700"
                    : "text-blue-700"
                }`}
              >
                {formatFileSize(file.fileSize)} • {file.progress}%
                {file.status === "error" && ` • ${file.error}`}
              </p>
            </div>
          </div>

          {file.status === "uploading" && (
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
          )}

          {file.status === "success" && (
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
          )}

          {file.status === "error" && (
            <div className="w-full bg-red-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1">
              {file.status === "uploading" && (
                <>
                  <svg
                    className="w-3 h-3 text-blue-600 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-xs text-blue-600">Uploading...</p>
                </>
              )}
              {file.status === "success" && (
                <>
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-xs text-green-600">Upload complete</p>
                </>
              )}
              {file.status === "error" && (
                <>
                  <svg
                    className="w-3 h-3 text-red-600"
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
                  <p className="text-xs text-red-600">Upload failed</p>
                </>
              )}
            </div>
            {file.status === "error" && (
              <button
                onClick={() =>
                  setUploadingFiles((prev) =>
                    prev.filter((f) => f.tempId !== file.tempId)
                  )
                }
                className="text-xs text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    ));
  };

  const renderFileMessage = (message: ChatMessage) => {
    if (!message.fileUrl) {
      console.log("❌ No fileUrl in message:", message);
      return null;
    }

    const isImage = message.fileType?.startsWith("image/");
    const isVideo = message.fileType?.startsWith("video/");
    const isAudio = message.fileType?.startsWith("audio/");

    console.log("🖼️ Rendering file message:", {
      fileUrl: message.fileUrl,
      fileType: message.fileType,
      isImage,
      isVideo,
      isAudio,
    });

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={message.fileUrl}
              alt={message.content}
              className="max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, "_blank")}
              onError={(e) => {
                console.error("❌ Failed to load image:", message.fileUrl);
                e.currentTarget.style.display = "none";
              }}
              onLoad={() =>
                console.log("✅ Image loaded successfully:", message.fileUrl)
              }
            />
          </div>
        ) : isVideo ? (
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <video
              controls
              className="max-w-full h-auto max-h-64"
              preload="metadata"
            >
              <source src={message.fileUrl} type={message.fileType} />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : isAudio ? (
          <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
            <audio controls className="w-full">
              <source src={message.fileUrl} type={message.fileType} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        ) : (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
          >
            <span className="text-lg">
              {getFileIcon(message.fileType || "")}
            </span>
            <span className="text-sm font-medium">
              {message.content.replace("File: ", "")}
            </span>
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-funlearn6"></div>
      </div>
    );
  }

  if (activeRoom) {
    const currentRoom = chatRooms.find((room) => room._id === activeRoom);

    return (
      <div className="max-w-6xl mx-auto h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-funlearn6 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={leaveRoom}
                className="p-2 hover:bg-funlearn7 rounded-lg transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-semibold">{currentRoom?.name}</h2>
                <p className="text-funlearn3 text-sm">
                  {currentRoom?.members?.length || 1} members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => currentRoom && copyInviteLink(currentRoom)}
                className="p-2 hover:bg-funlearn7 rounded-lg transition-colors"
                title="Copy invite code"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && uploadingFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg
                className="w-12 h-12 mb-4 opacity-50"
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
              <p className="text-lg font-medium text-gray-900">
                No messages yet
              </p>
              <p className="text-sm">
                Start the conversation by sending a message!
              </p>
            </div>
          ) : (
            <>
              {/* Render existing messages first */}
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
                      message.isOwn
                        ? "bg-funlearn6 text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {!message.isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender.avatar?.url && (
                          <img
                            src={message.sender.avatar.url}
                            alt={message.sender.userName}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <p className="text-xs font-medium text-funlearn7">
                          {message.sender.userName}
                        </p>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    {message.fileUrl && renderFileMessage(message)}
                    <p
                      className={`text-xs mt-1 ${
                        message.isOwn ? "text-funlearn3" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Then render uploading files at the bottom */}
              {renderUploadingFiles()}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="p-4 border-t border-gray-200 bg-white"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-funlearn6 transition-colors text-gray-900 placeholder-gray-500"
            />
            <label className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
            </label>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-funlearn6 text-white rounded-lg font-medium hover:bg-funlearn7 focus:ring-2 focus:ring-funlearn6 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat Rooms 💬</h1>
        <p className="text-gray-600 mt-2">
          Join study groups and collaborate with other students
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setIsCreatingRoom(true)}
          className="bg-funlearn6 text-white px-6 py-2 rounded-lg font-medium hover:bg-funlearn7 transition-colors"
        >
          Create Room
        </button>
        <button
          onClick={() => setIsJoiningRoom(true)}
          className="bg-white text-funlearn6 border-2 border-funlearn6 px-6 py-2 rounded-lg font-medium hover:bg-funlearn1 transition-colors"
        >
          Join Room
        </button>
      </div>

      {/* Create Room Modal */}
      {isCreatingRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Chat Room
            </h3>
            <form onSubmit={createChatroom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-funlearn6 transition-colors text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreatingRoom(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-funlearn6 text-white rounded-lg font-medium hover:bg-funlearn7 transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {isJoiningRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Join Chat Room
            </h3>
            <form onSubmit={joinChatroomByToken}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Invite Token *
                  </label>
                  <input
                    type="text"
                    value={joinToken}
                    onChange={(e) => setJoinToken(e.target.value)}
                    placeholder="Enter invite token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-funlearn6 transition-colors text-gray-900 placeholder-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The token is usually copied from the invite token icon
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsJoiningRoom(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-funlearn6 text-white rounded-lg font-medium hover:bg-funlearn7 transition-colors"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatRooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No chat rooms yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create or join a chat room to start collaborating!
            </p>
          </div>
        ) : (
          chatRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {room.name}
                  </h3>

                  <div>
                    {/* NEW: Exit Room Button */}
                    <button
                      onClick={() => exitChatroom(room._id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Exit chat room"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>

                    <span className="px-2 py-1 bg-funlearn2 text-funlearn8 text-xs font-medium rounded-full">
                      Chat Room
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  Created on {new Date(room.createdAt).toLocaleDateString()}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>👥</span>
                    <span>{room.members?.length || 1} members</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyInviteLink(room)}
                      className="p-2 text-gray-500 hover:text-funlearn6 transition-colors"
                      title="Copy invite token"
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => joinRoom(room._id)}
                      className="bg-funlearn6 text-white px-4 py-2 rounded-lg font-medium hover:bg-funlearn7 transition-colors"
                    >
                      Enter Room
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}