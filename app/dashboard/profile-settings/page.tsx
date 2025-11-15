"use client";
import { useState } from "react";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "achievements" | "activity"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    bio: "Passionate learner exploring new topics every day!",
    school: "University of Example",
    gradeLevel: "College",
    interests: ["Mathematics", "Science", "Programming"],
  });

  const achievements = [
    {
      id: 1,
      name: "First Quiz",
      description: "Complete your first quiz",
      icon: "🎯",
      earned: true,
      date: "2024-01-15",
    },
    {
      id: 2,
      name: "Quick Learner",
      description: "Complete 10 quizzes",
      icon: "⚡",
      earned: true,
      date: "2024-01-20",
    },
    {
      id: 3,
      name: "Knowledge Master",
      description: "Score 90%+ on any quiz",
      icon: "🏆",
      earned: false,
      date: null,
    },
    {
      id: 4,
      name: "Social Butterfly",
      description: "Join 5 chat rooms",
      icon: "💬",
      earned: false,
      date: null,
    },
    {
      id: 5,
      name: "Consistent Learner",
      description: "Active for 7 consecutive days",
      icon: "📚",
      earned: true,
      date: "2024-01-25",
    },
    {
      id: 6,
      name: "Top Performer",
      description: "Reach top 10 on leaderboard",
      icon: "⭐",
      earned: false,
      date: null,
    },
  ];

  const activityLog = [
    {
      id: 1,
      action: "Completed quiz: Mathematics Basics",
      score: "85%",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      action: "Joined chat room: Science Club",
      score: null,
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      action: "Earned achievement: Quick Learner",
      score: null,
      timestamp: "1 day ago",
    },
    {
      id: 4,
      action: "Completed quiz: History Trivia",
      score: "78%",
      timestamp: "2 days ago",
    },
    {
      id: 5,
      action: "Updated profile information",
      score: null,
      timestamp: "3 days ago",
    },
  ];

  const handleSave = () => {
    // Save profile data to backend
    setIsEditing(false);
    // API call to update user profile
    console.log("Saving profile:", profileData);
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !profileData.interests.includes(interest)) {
      setProfileData((prev) => ({
        ...prev,
        interests: [...prev.interests, interest.trim()],
      }));
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-funlearn4 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-funlearn8">
                {profileData.userName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-funlearn6 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
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
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profileData.userName}
            </h1>
            <p className="text-gray-600 mt-1">{profileData.email}</p>
            <p className="text-gray-500 text-sm mt-2">{profileData.bio}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-funlearn6 text-white px-4 py-2 rounded-lg font-semibold hover:bg-funlearn7 transition-colors"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "profile", label: "Profile Info", icon: "👤" },
              { id: "achievements", label: "Achievements", icon: "🏆" },
              { id: "activity", label: "Activity Log", icon: "📊" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-funlearn6 text-funlearn7"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.userName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          userName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School
                    </label>
                    <input
                      type="text"
                      value={profileData.school}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          school: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Level
                    </label>
                    <select
                      value={profileData.gradeLevel}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          gradeLevel: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent"
                    >
                      <option>Elementary</option>
                      <option>Middle School</option>
                      <option>High School</option>
                      <option>College</option>
                      <option>Graduate</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profileData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-3 py-1 bg-funlearn2 text-funlearn8 rounded-full text-sm"
                        >
                          {interest}
                          <button
                            onClick={() => removeInterest(interest)}
                            className="ml-2 text-funlearn7 hover:text-funlearn8"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add an interest..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addInterest((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector(
                            'input[placeholder="Add an interest..."]'
                          ) as HTMLInputElement;
                          if (input) {
                            addInterest(input.value);
                            input.value = "";
                          }
                        }}
                        className="px-4 py-2 bg-funlearn6 text-white rounded-lg hover:bg-funlearn7 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={handleSave}
                      className="bg-funlearn6 text-white px-6 py-3 rounded-lg font-semibold hover:bg-funlearn7 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <p className="text-gray-900">{profileData.userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900">{profileData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School
                    </label>
                    <p className="text-gray-900">{profileData.school}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Level
                    </label>
                    <p className="text-gray-900">{profileData.gradeLevel}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <p className="text-gray-900">{profileData.bio}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-3 py-1 bg-funlearn2 text-funlearn8 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? "bg-funlearn1 to-funlearn2 border-funlearn4"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {achievement.earned ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-funlearn7 font-medium">
                        Earned!
                      </span>
                      <span className="text-gray-500">{achievement.date}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Not earned yet</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-funlearn4 rounded-full flex items-center justify-center">
                      <span className="text-funlearn8 text-sm">📝</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.action}
                      </p>
                      {activity.score && (
                        <p className="text-sm text-funlearn7">
                          Score: {activity.score}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {activity.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
