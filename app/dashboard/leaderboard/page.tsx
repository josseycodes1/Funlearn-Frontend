"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface User {
  _id: string;
  userName: string;
  fullName?: string;
  profilePhoto?: {
    publicId: string;
    url: string;
  };
}

interface LeaderboardEntry {
  position: number;
  user: User;
  weeklyScore: number;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
}

export default function Leaderboard() {
  const [overallLeaderboard, setOverallLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [activeTab, setActiveTab] = useState<"overall" | "friends">("overall");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLeaderboard =
    activeTab === "overall" ? overallLeaderboard : friendsLeaderboard;

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  // Get axios instance with authorization header
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      setError(null);

      const authAxios = getAuthAxios();

      const [overallResponse, friendsResponse] = await Promise.all([
        authAxios.get<LeaderboardResponse>("/api/leaderboard"),
        authAxios.get<LeaderboardResponse>("/api/leaderboard/friends"),
      ]);

      if (overallResponse.data.success) {
        setOverallLeaderboard(overallResponse.data.leaderboard);
      }
      if (friendsResponse.data.success) {
        setFriendsLeaderboard(friendsResponse.data.leaderboard);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load leaderboards"
        );
      } else {
        setError("Failed to load leaderboards");
      }
      console.error("Error fetching leaderboards:", err);
    } finally {
      setLoading(false);
    }
  };

  // Find current user in friends leaderboard (assuming the user is included in friends leaderboard)
  const currentUserRank = friendsLeaderboard.find(
    (entry) =>
      // You might want to replace this with actual user ID from your auth context
      entry.user._id === "current-user-id"
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchLeaderboards}
            className="px-4 py-2 bg-funlearn6 text-white rounded-lg hover:bg-funlearn7 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Leaderboard 🏆
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === "overall"
                  ? "See how you rank among all students"
                  : "Compete with your friends"}
              </p>
            </div>
            <div className="flex space-x-2">
              {(
                [
                  { key: "overall", label: "Overall" },
                  { key: "friends", label: "Friends" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === key
                      ? "bg-funlearn6 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="p-6">
          {currentLeaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === "friends"
                ? "No friends data available. Add some friends to see their scores!"
                : "No leaderboard data available."}
            </div>
          ) : (
            <div className="space-y-3">
              {currentLeaderboard.map((entry) => (
                <div
                  key={entry.position}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    entry.position <= 3
                      ? "bg-funlearn2 border-funlearn8"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.position === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : entry.position === 2
                          ? "bg-gray-100 text-gray-800"
                          : entry.position === 3
                          ? "bg-orange-100 text-orange-800"
                          : "bg-funlearn2 text-funlearn8"
                      }`}
                    >
                      {entry.position}
                    </div>
                    <div className="flex items-center space-x-3">
                      {entry.user.profilePhoto && (
                        <img
                          src={entry.user.profilePhoto.url}
                          alt={entry.user.userName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {entry.user.userName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {entry.user.fullName || entry.user.userName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-funlearn8">
                      {entry.weeklyScore.toLocaleString()} pts
                    </p>
                    {entry.position <= 3 && (
                      <p className="text-sm text-gray-600 capitalize">
                        {entry.position === 1
                          ? "🥇 Gold"
                          : entry.position === 2
                          ? "🥈 Silver"
                          : "🥉 Bronze"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Your Rank Card - Only show if user is in friends leaderboard */}
      {currentUserRank && (
        <div className="mt-6 bg-funlearn8 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Current Rank</h3>
              <p className="text-funlearn2 mt-1">
                {currentUserRank.position <= 3
                  ? "Congratulations! You're in the top 3! 🎉"
                  : "Keep learning to climb the leaderboard!"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">#{currentUserRank.position}</p>
              <p className="text-funlearn2">
                {currentUserRank.weeklyScore} points
              </p>
            </div>
          </div>
          {currentUserRank.position > 1 && (
            <>
              <div className="mt-4 w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((friendsLeaderboard.length - currentUserRank.position) /
                        (friendsLeaderboard.length - 1)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-white text-sm mt-2">
                {currentUserRank.position > 1 &&
                  `${
                    friendsLeaderboard[currentUserRank.position - 2]
                      .weeklyScore - currentUserRank.weeklyScore
                  } points to reach #${currentUserRank.position - 1}`}
              </p>
            </>
          )}
        </div>
      )}

      {/* Add Friends Prompt */}
      {activeTab === "friends" && friendsLeaderboard.length === 0 && (
        <div className="mt-6 bg-funlearn2 border border-funlearn8 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Friends Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add friends to compete and see who's on top!
          </p>
          <button className="px-6 py-2 bg-funlearn6 text-white rounded-lg hover:bg-funlearn7 transition-colors">
            Add Friends
          </button>
        </div>
      )}
    </div>
  );
}
