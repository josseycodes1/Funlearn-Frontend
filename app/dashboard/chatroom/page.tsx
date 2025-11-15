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

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  // Create Axios instance with default config
  const api = axios.create({
    baseURL: BACKEND_URL,
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
  }, [messages]);

  const initializeSocket = () => {
    const newSocket = io(BACKEND_URL as string, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("receiveMessage", (message: ChatMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((msg) => msg._id === message._id)) {
          return prev;
        }

        const messageWithOwnStatus = {
          ...message,
          isOwn: message.sender._id === currentUser?._id,
        };

        return [...prev, messageWithOwnStatus];
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    setSocket(newSocket);
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      setCurrentUser(response.data.user);
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
      const messagesData: ChatMessage[] = response.data;
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
      setChatRooms((prev) => [joinedRoom, ...prev]);
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
    setActiveRoom(roomId);
    setMessages([]);
  };

  const leaveRoom = () => {
    if (socket && activeRoom) {
      socket.emit("leaveRoom", activeRoom);
    }
    setActiveRoom(null);
    setMessages([]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !socket || !currentUser) return;

    const messageData = {
      chatroomId: activeRoom,
      senderId: currentUser._id,
      content: newMessage,
      fileUrl: undefined,
      fileType: undefined,
    };

    // Emit the message via socket
    socket.emit("sendMessage", messageData);

    // Optimistically add the message to the UI
    const optimisticMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
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
    const inviteLink = `${window.location.origin}/chatroom/${room.inviteLink}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("Invite link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy invite link:", err);
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
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/chatroom/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      if (socket && activeRoom && currentUser) {
        const messageData = {
          chatroomId: activeRoom,
          senderId: currentUser._id,
          content: `File: ${file.name}`,
          fileUrl: data.url,
          fileType: file.type,
        };

        socket.emit("sendMessage", messageData);
      }

      return data.url;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(
        error.response?.data?.message ||
          "Failed to upload file. Please try again."
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const savePushSubscription = async (subscription: any) => {
    try {
      await api.post("/api/chatroom/subscribe", { subscription });
      console.log("Push subscription saved successfully");
    } catch (error) {
      console.error("Error saving push subscription:", error);
    }
  };

  const requestNotificationPermission = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");

          // Register service worker and get subscription
          const registration = await navigator.serviceWorker.register("/sw.js");
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

          // Save subscription to backend
          await savePushSubscription(subscription);
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
                title="Copy invite link"
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
          {messages.length === 0 ? (
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
            messages.map((message) => (
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
            ))
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
                    The token is usually found in the invite link: /join/TOKEN
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
                  <span className="px-2 py-1 bg-funlearn2 text-funlearn8 text-xs font-medium rounded-full">
                    Chat Room
                  </span>
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
                      title="Copy invite link"
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
                      Join Room
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
