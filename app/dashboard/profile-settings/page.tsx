"use client";
import { useState, useEffect } from "react";

interface ProfileProps {
  user: any;
}

interface UserProfile {
  _id: string;
  userName: string;
  email: string;
  bio?: string;
  school?: string;
  level?: string;
  interests?: string[];
  profilePhoto?: {
    publicId: string;
    url: string;
  };
  overallScore?: number;
  rank?: string;
}

interface RankInfo {
  level: number;
  title: string;
  desc: string;
  nextLevelMin: number | null;
  progress: number;
}

interface RankAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  level: number;
  scoreRequired: number;
}

export default function Profile({ user }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "achievements">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rankAchievements, setRankAchievements] = useState<RankAchievement[]>([]);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

 
  const backendRanks = [
    { name: "Brain Sprout 🌱", icon: "🌱", threshold: 0 },
    { name: "Curious Thinker 🔍", icon: "🔍", threshold: 20 },
    { name: "Knowledge Explorer 🧭", icon: "🧭", threshold: 50 },
    { name: "Idea Spark 💡", icon: "💡", threshold: 90 },
    { name: "Mind Mover 🌀", icon: "🌀", threshold: 140 },
    { name: "Quiz Challenger 🎯", icon: "🎯", threshold: 200 },
    { name: "Concept Crusher 💥", icon: "💥", threshold: 270 },
    { name: "Sharp Scholar 📘", icon: "📘", threshold: 350 },
    { name: "Logic Builder 🧩", icon: "🧩", threshold: 440 },
    { name: "Insight Seeker 🔮", icon: "🔮", threshold: 540 },
    { name: "Wisdom Warrior ⚔️", icon: "⚔️", threshold: 650 },
    { name: "Genius Guru 🧙‍♂️", icon: "🧙‍♂️", threshold: 770 },
    { name: "Study Strategist 🧠", icon: "🧠", threshold: 900 },
    { name: "Mind Master 👑", icon: "👑", threshold: 1040 },
    { name: "Genius Grove 🌳", icon: "🌳", threshold: 1190 },
    { name: "Brainstorm Pro ☁️", icon: "☁️", threshold: 1350 },
    { name: "Knowledge Commander 🚀", icon: "🚀", threshold: 1520 },
    { name: "Elite Intellect 🏆", icon: "🏆", threshold: 1700 },
    { name: "Legendary Luminary 🌟", icon: "🌟", threshold: 1890 },
    { name: "Sync Sage 🔱", icon: "🔱", threshold: 2090 }
  ];

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileData(data.user);
          setEditData(data.user);
          setRankInfo(data.rankInfo);
          generateRankAchievements(data.rankInfo);
        }
      } else {
        console.error("Failed to fetch user profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRankAchievements = (currentRankInfo: RankInfo | null) => {
    const achievements: RankAchievement[] = backendRanks.map((rank, index) => ({
      id: index + 1,
      name: rank.name,
      description: `Reach ${rank.threshold} points to unlock`,
      icon: rank.icon,
      earned: currentRankInfo ? currentRankInfo.level >= index + 1 : false,
      level: index + 1,
      scoreRequired: rank.threshold
    }));

    setRankAchievements(achievements);
  };

  const handleSave = async () => {
    if (!editData) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      
   
      const payload: any = {};
      
    
      if (editData.bio !== undefined) payload.bio = editData.bio;
      if (editData.school !== undefined) payload.school = editData.school;
      if (editData.level !== undefined) payload.level = editData.level;
      if (editData.userName !== undefined) payload.userName = editData.userName;
      if (editData.interests !== undefined) {
        const interestsArray = Array.isArray(editData.interests) 
          ? editData.interests 
          : [editData.interests].filter(Boolean);
        payload.interests = interestsArray;
      }

      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileData(data.user);
          setIsEditing(false);
          await fetchUserProfile();
        }
      } else {
        console.error("Failed to update profile:", response.status);
        const errorData = await response.json();
        alert(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Only image files are supported");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileData(data.user);
          setEditData(data.user);
          await fetchUserProfile();
        }
      } else {
        console.error("Failed to upload profile photo:", response.status);
        alert("Failed to upload profile photo");
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      alert("Error uploading profile photo");
    } finally {
      setIsSaving(false);
    }
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && editData) {
      const currentInterests = editData.interests || [];
      if (!currentInterests.includes(interest.trim())) {
        setEditData(prev => prev ? {
          ...prev,
          interests: [...currentInterests, interest.trim()]
        } : null);
      }
    }
  };

  const removeInterest = (interestToRemove: string) => {
    if (editData) {
      setEditData(prev => prev ? {
        ...prev,
        interests: (prev.interests || []).filter(interest => interest !== interestToRemove)
      } : null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-funlearn6 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <p className="text-gray-600">Unable to load user profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative shrink-0">
            {profileData.profilePhoto?.url ? (
              <img
                src={profileData.profilePhoto.url}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-funlearn4 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-funlearn8">
                  {profileData.userName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
              id="profilePhotoInput"
            />
            <label
              htmlFor="profilePhotoInput"
              className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-funlearn6 rounded-full flex items-center justify-center cursor-pointer hover:bg-funlearn7 transition-colors"
            >
              <svg
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
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
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {profileData.userName}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base truncate">{profileData.email}</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2 line-clamp-2">
              {profileData.bio || "No bio yet"}
            </p>
            {rankInfo && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-funlearn2 text-funlearn8 rounded-full text-xs sm:text-sm font-medium">
                  {rankInfo.title} • Level {rankInfo.level}
                </span>
              </div>
            )}
          </div>
          <div className="shrink-0">
            <button
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              disabled={isSaving}
              className="w-full sm:w-auto bg-funlearn6 text-white px-4 py-2 rounded-lg font-semibold hover:bg-funlearn7 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : isEditing ? (
                "Cancel"
              ) : (
                "Edit Profile"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {[
              { id: "profile", label: "Profile Info", icon: "👤" },
              { id: "achievements", label: "Rank Progress", icon: "🏆" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-funlearn6 text-funlearn7"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editData?.userName || ""}
                        onChange={(e) =>
                          setEditData(prev => prev ? {
                            ...prev,
                            userName: e.target.value
                          } : null)
                        }
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editData?.email || ""}
                        onChange={(e) =>
                          setEditData(prev => prev ? {
                            ...prev,
                            email: e.target.value
                          } : null)
                        }
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editData?.bio || ""}
                      onChange={(e) =>
                        setEditData(prev => prev ? {
                          ...prev,
                          bio: e.target.value
                        } : null)
                      }
                      rows={3}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School
                      </label>
                      <input
                        type="text"
                        value={editData?.school || ""}
                        onChange={(e) =>
                          setEditData(prev => prev ? {
                            ...prev,
                            school: e.target.value
                          } : null)
                        }
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Level
                      </label>
                      <select
                        value={editData?.level || ""}
                        onChange={(e) =>
                          setEditData(prev => prev ? {
                            ...prev,
                            level: e.target.value
                          } : null)
                        }
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black text-sm sm:text-base"
                      >
                        <option value="">Select Grade Level</option>
                        <option>Elementary</option>
                        <option>Middle School</option>
                        <option>High School</option>
                        <option>College</option>
                        <option>Graduate</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(editData?.interests || []).map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-funlearn2 text-funlearn8 rounded-full text-xs sm:text-sm"
                        >
                          {interest}
                          <button
                            onClick={() => removeInterest(interest)}
                            className="ml-1 sm:ml-2 text-funlearn7 hover:text-funlearn8 text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="text"
                        placeholder="Add an interest..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addInterest((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black text-sm sm:text-base"
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
                        className="px-4 py-2 bg-funlearn6 text-white rounded-lg hover:bg-funlearn7 transition-colors text-sm sm:text-base whitespace-nowrap"
                      >
                        Add Interest
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full sm:w-auto bg-funlearn6 text-white px-6 py-3 rounded-lg font-semibold hover:bg-funlearn7 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{profileData.userName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{profileData.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{profileData.school || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Level
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{profileData.level || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <p className="text-gray-900 text-sm sm:text-base">{profileData.bio || "No bio yet"}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(profileData.interests || []).map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-funlearn2 text-funlearn8 rounded-full text-xs sm:text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                      {(profileData.interests || []).length === 0 && (
                        <p className="text-gray-500 text-sm">No interests added yet</p>
                      )}
                    </div>
                  </div>
                  
                  {rankInfo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Rank Progress
                      </label>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                          <span className="font-medium text-gray-900 text-sm sm:text-base">{rankInfo.title}</span>
                          <span className="text-xs sm:text-sm text-gray-600">Level {rankInfo.level}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-funlearn6 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${rankInfo.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {rankInfo.desc}
                        </p>
                        {rankInfo.nextLevelMin && (
                          <p className="text-xs text-gray-500 mt-1">
                            {rankInfo.progress}% to next level ({rankInfo.nextLevelMin} points)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-6">
              {/* Current Rank Overview */}
              {rankInfo && (
                <div className="bg-funlearn2 rounded-xl p-4 sm:p-6 border border-funlearn4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-funlearn8 mb-2">
                        Your Current Rank: {rankInfo.title}
                      </h3>
                      <p className="text-funlearn7 text-sm sm:text-base">{rankInfo.desc}</p>
                      <p className="text-xs sm:text-sm text-funlearn8 mt-2">
                        Level {rankInfo.level} • {rankInfo.progress}% to next rank
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl shrink-0">
                      {rankInfo.level > 0 ? backendRanks[rankInfo.level - 1]?.icon : "🌱"}
                    </div>
                  </div>
                </div>
              )}

              {/* All Ranks */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">All Ranks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {rankAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        achievement.earned
                          ? "bg-funlearn1 border-funlearn4"
                          : achievement.level === (rankInfo?.level || 0)
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                        <span className="text-xl sm:text-2xl">{achievement.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {achievement.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Level {achievement.level}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {achievement.scoreRequired} points
                          </p>
                        </div>
                      </div>
                      {achievement.earned ? (
                        <div className="text-xs sm:text-sm text-funlearn7 font-medium">
                          ✓ Achieved
                        </div>
                      ) : achievement.level === (rankInfo?.level || 0) ? (
                        <div className="text-xs sm:text-sm text-yellow-700 font-medium">
                          🔥 Next Goal
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-500">Locked</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// "use client";
// import { useState, useEffect } from "react";

// interface ProfileProps {
//   user: any;
// }

// interface UserProfile {
//   _id: string;
//   userName: string;
//   email: string;
//   bio?: string;
//   school?: string;
//   level?: string;
//   interests?: string[];
//   profilePhoto?: {
//     publicId: string;
//     url: string;
//   };
//   overallScore?: number;
//   rank?: string;
// }

// interface RankInfo {
//   level: number;
//   title: string;
//   desc: string;
//   nextLevelMin: number | null;
//   progress: number;
// }

// interface RankAchievement {
//   id: number;
//   name: string;
//   description: string;
//   icon: string;
//   earned: boolean;
//   level: number;
//   scoreRequired: number;
// }

// export default function Profile({ user }: ProfileProps) {
//   const [activeTab, setActiveTab] = useState<"profile" | "achievements">("profile");
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState<UserProfile | null>(null);
//   const [editData, setEditData] = useState<UserProfile | null>(null);
//   const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [rankAchievements, setRankAchievements] = useState<RankAchievement[]>([]);

//   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

 
//   const backendRanks = [
//     { name: "Brain Sprout 🌱", icon: "🌱", threshold: 0 },
//     { name: "Curious Thinker 🔍", icon: "🔍", threshold: 20 },
//     { name: "Knowledge Explorer 🧭", icon: "🧭", threshold: 50 },
//     { name: "Idea Spark 💡", icon: "💡", threshold: 90 },
//     { name: "Mind Mover 🌀", icon: "🌀", threshold: 140 },
//     { name: "Quiz Challenger 🎯", icon: "🎯", threshold: 200 },
//     { name: "Concept Crusher 💥", icon: "💥", threshold: 270 },
//     { name: "Sharp Scholar 📘", icon: "📘", threshold: 350 },
//     { name: "Logic Builder 🧩", icon: "🧩", threshold: 440 },
//     { name: "Insight Seeker 🔮", icon: "🔮", threshold: 540 },
//     { name: "Wisdom Warrior ⚔️", icon: "⚔️", threshold: 650 },
//     { name: "Genius Guru 🧙‍♂️", icon: "🧙‍♂️", threshold: 770 },
//     { name: "Study Strategist 🧠", icon: "🧠", threshold: 900 },
//     { name: "Mind Master 👑", icon: "👑", threshold: 1040 },
//     { name: "Genius Grove 🌳", icon: "🌳", threshold: 1190 },
//     { name: "Brainstorm Pro ☁️", icon: "☁️", threshold: 1350 },
//     { name: "Knowledge Commander 🚀", icon: "🚀", threshold: 1520 },
//     { name: "Elite Intellect 🏆", icon: "🏆", threshold: 1700 },
//     { name: "Legendary Luminary 🌟", icon: "🌟", threshold: 1890 },
//     { name: "Sync Sage 🔱", icon: "🔱", threshold: 2090 }
//   ];

//   // Fetch user profile data
//   useEffect(() => {
//     fetchUserProfile();
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/profile`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setProfileData(data.user);
//           setEditData(data.user);
//           setRankInfo(data.rankInfo);
//           generateRankAchievements(data.rankInfo);
//         }
//       } else {
//         console.error("Failed to fetch user profile:", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const generateRankAchievements = (currentRankInfo: RankInfo | null) => {
//     const achievements: RankAchievement[] = backendRanks.map((rank, index) => ({
//       id: index + 1,
//       name: rank.name,
//       description: `Reach ${rank.threshold} points to unlock`,
//       icon: rank.icon,
//       earned: currentRankInfo ? currentRankInfo.level >= index + 1 : false,
//       level: index + 1,
//       scoreRequired: rank.threshold
//     }));

//     setRankAchievements(achievements);
//   };

//   const handleSave = async () => {
//     if (!editData) return;

//     setIsSaving(true);
//     try {
//       const token = localStorage.getItem("token");
      
   
//       const payload: any = {};
      
    
//       if (editData.bio !== undefined) payload.bio = editData.bio;
//       if (editData.school !== undefined) payload.school = editData.school;
//       if (editData.level !== undefined) payload.level = editData.level;
//       if (editData.userName !== undefined) payload.userName = editData.userName;
//       if (editData.interests !== undefined) {
//         const interestsArray = Array.isArray(editData.interests) 
//           ? editData.interests 
//           : [editData.interests].filter(Boolean);
//         payload.interests = interestsArray;
//       }

//       const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
//         method: "PATCH",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setProfileData(data.user);
//           setIsEditing(false);
//           await fetchUserProfile();
//         }
//       } else {
//         console.error("Failed to update profile:", response.status);
//         const errorData = await response.json();
//         alert(errorData.message || "Failed to update profile");
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       alert("Error updating profile");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleCancel = () => {
//     setEditData(profileData);
//     setIsEditing(false);
//   };

//   const handleFileUpload = async (file: File) => {
//     if (!file.type.startsWith('image/')) {
//       alert("Only image files are supported");
//       return;
//     }

//     setIsSaving(true);
//     try {
//       const token = localStorage.getItem("token");
//       const formData = new FormData();
//       formData.append("profilePhoto", file);

//       const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setProfileData(data.user);
//           setEditData(data.user);
//           await fetchUserProfile();
//         }
//       } else {
//         console.error("Failed to upload profile photo:", response.status);
//         alert("Failed to upload profile photo");
//       }
//     } catch (error) {
//       console.error("Error uploading profile photo:", error);
//       alert("Error uploading profile photo");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const addInterest = (interest: string) => {
//     if (interest.trim() && editData) {
//       const currentInterests = editData.interests || [];
//       if (!currentInterests.includes(interest.trim())) {
//         setEditData(prev => prev ? {
//           ...prev,
//           interests: [...currentInterests, interest.trim()]
//         } : null);
//       }
//     }
//   };

//   const removeInterest = (interestToRemove: string) => {
//     if (editData) {
//       setEditData(prev => prev ? {
//         ...prev,
//         interests: (prev.interests || []).filter(interest => interest !== interestToRemove)
//       } : null);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="w-8 h-8 border-4 border-funlearn6 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!profileData) {
//     return (
//       <div className="max-w-4xl mx-auto text-center py-12">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
//         <p className="text-gray-600">Unable to load user profile.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       {/* Header */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="flex items-center space-x-6">
//           <div className="relative">
//             {profileData.profilePhoto?.url ? (
//               <img
//                 src={profileData.profilePhoto.url}
//                 alt="Profile"
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-20 h-20 bg-funlearn4 rounded-full flex items-center justify-center">
//                 <span className="text-2xl font-bold text-funlearn8">
//                   {profileData.userName?.charAt(0).toUpperCase() || "U"}
//                 </span>
//               </div>
//             )}
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => {
//                 if (e.target.files?.[0]) {
//                   handleFileUpload(e.target.files[0]);
//                 }
//               }}
//               className="hidden"
//               id="profilePhotoInput"
//             />
//             <label
//               htmlFor="profilePhotoInput"
//               className="absolute bottom-0 right-0 w-6 h-6 bg-funlearn6 rounded-full flex items-center justify-center cursor-pointer hover:bg-funlearn7 transition-colors"
//             >
//               <svg
//                 className="w-3 h-3 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                 />
//               </svg>
//             </label>
//           </div>
//           <div className="flex-1">
//             <h1 className="text-2xl font-bold text-gray-900">
//               {profileData.userName}
//             </h1>
//             <p className="text-gray-600 mt-1">{profileData.email}</p>
//             <p className="text-gray-500 text-sm mt-2">
//               {profileData.bio || "No bio yet"}
//             </p>
//             {rankInfo && (
//               <div className="mt-2">
//                 <span className="inline-flex items-center px-3 py-1 bg-funlearn2 text-funlearn8 rounded-full text-sm font-medium">
//                   {rankInfo.title} • Level {rankInfo.level}
//                 </span>
//               </div>
//             )}
//           </div>
//           <button
//             onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
//             disabled={isSaving}
//             className="bg-funlearn6 text-white px-4 py-2 rounded-lg font-semibold hover:bg-funlearn7 transition-colors disabled:opacity-50"
//           >
//             {isSaving ? (
//               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//             ) : isEditing ? (
//               "Cancel"
//             ) : (
//               "Edit Profile"
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
//         <div className="border-b border-gray-200">
//           <nav className="flex space-x-8 px-6">
//             {[
//               { id: "profile", label: "Profile Info", icon: "👤" },
//               { id: "achievements", label: "Rank Progress", icon: "🏆" },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id as any)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
//                   activeTab === tab.id
//                     ? "border-funlearn6 text-funlearn7"
//                     : "border-transparent text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 <span>{tab.icon}</span>
//                 <span>{tab.label}</span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="p-6">
//           {activeTab === "profile" && (
//             <div className="space-y-6">
//               {isEditing ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       value={editData?.userName || ""}
//                       onChange={(e) =>
//                         setEditData(prev => prev ? {
//                           ...prev,
//                           userName: e.target.value
//                         } : null)
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       value={editData?.email || ""}
//                       onChange={(e) =>
//                         setEditData(prev => prev ? {
//                           ...prev,
//                           email: e.target.value
//                         } : null)
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
//                     />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bio
//                     </label>
//                     <textarea
//                       value={editData?.bio || ""}
//                       onChange={(e) =>
//                         setEditData(prev => prev ? {
//                           ...prev,
//                           bio: e.target.value
//                         } : null)
//                       }
//                       rows={3}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       School
//                     </label>
//                     <input
//                       type="text"
//                       value={editData?.school || ""}
//                       onChange={(e) =>
//                         setEditData(prev => prev ? {
//                           ...prev,
//                           school: e.target.value
//                         } : null)
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Grade Level
//                     </label>
//                     <select
//                       value={editData?.level || ""}
//                       onChange={(e) =>
//                         setEditData(prev => prev ? {
//                           ...prev,
//                           level: e.target.value
//                         } : null)
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
//                     >
//                       <option value="">Select Grade Level</option>
//                       <option>Elementary</option>
//                       <option>Middle School</option>
//                       <option>High School</option>
//                       <option>College</option>
//                       <option>Graduate</option>
//                     </select>
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Interests
//                     </label>
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       {(editData?.interests || []).map((interest) => (
//                         <span
//                           key={interest}
//                           className="inline-flex items-center px-3 py-1 bg-funlearn2 text-funlearn8 rounded-full text-sm"
//                         >
//                           {interest}
//                           <button
//                             onClick={() => removeInterest(interest)}
//                             className="ml-2 text-funlearn7 hover:text-funlearn8"
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                     </div>
//                     <div className="flex space-x-2">
//                       <input
//                         type="text"
//                         placeholder="Add an interest..."
//                         onKeyPress={(e) => {
//                           if (e.key === "Enter") {
//                             addInterest((e.target as HTMLInputElement).value);
//                             (e.target as HTMLInputElement).value = "";
//                           }
//                         }}
//                         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
//                       />
//                       <button
//                         onClick={() => {
//                           const input = document.querySelector(
//                             'input[placeholder="Add an interest..."]'
//                           ) as HTMLInputElement;
//                           if (input) {
//                             addInterest(input.value);
//                             input.value = "";
//                           }
//                         }}
//                         className="px-4 py-2 bg-funlearn6 text-white rounded-lg hover:bg-funlearn7 transition-colors"
//                       >
//                         Add
//                       </button>
//                     </div>
//                   </div>
//                   <div className="md:col-span-2">
//                     <button
//                       onClick={handleSave}
//                       disabled={isSaving}
//                       className="bg-funlearn6 text-white px-6 py-3 rounded-lg font-semibold hover:bg-funlearn7 transition-colors disabled:opacity-50"
//                     >
//                       {isSaving ? "Saving..." : "Save Changes"}
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Username
//                     </label>
//                     <p className="text-gray-900">{profileData.userName}</p>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email
//                     </label>
//                     <p className="text-gray-900">{profileData.email}</p>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       School
//                     </label>
//                     <p className="text-gray-900">{profileData.school || "Not specified"}</p>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Grade Level
//                     </label>
//                     <p className="text-gray-900">{profileData.level || "Not specified"}</p>
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bio
//                     </label>
//                     <p className="text-gray-900">{profileData.bio || "No bio yet"}</p>
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Interests
//                     </label>
//                     <div className="flex flex-wrap gap-2">
//                       {(profileData.interests || []).map((interest) => (
//                         <span
//                           key={interest}
//                           className="inline-flex items-center px-3 py-1 bg-funlearn2 text-funlearn8 rounded-full text-sm"
//                         >
//                           {interest}
//                         </span>
//                       ))}
//                       {(profileData.interests || []).length === 0 && (
//                         <p className="text-gray-500 text-sm">No interests added yet</p>
//                       )}
//                     </div>
//                   </div>
//                   {rankInfo && (
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Current Rank Progress
//                       </label>
//                       <div className="bg-gray-100 rounded-lg p-4">
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="font-medium text-gray-900">{rankInfo.title}</span>
//                           <span className="text-sm text-gray-600">Level {rankInfo.level}</span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-funlearn6 h-2 rounded-full transition-all duration-300"
//                             style={{ width: `${rankInfo.progress}%` }}
//                           ></div>
//                         </div>
//                         <p className="text-xs text-gray-600 mt-2">
//                           {rankInfo.desc}
//                         </p>
//                         {rankInfo.nextLevelMin && (
//                           <p className="text-xs text-gray-500 mt-1">
//                             {rankInfo.progress}% to next level ({rankInfo.nextLevelMin} points)
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "achievements" && (
//             <div className="space-y-6">
//               {/* Current Rank Overview */}
//               {rankInfo && (
//                 <div className="bg-funlearn2 rounded-xl p-6 border border-funlearn4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-xl font-bold text-funlearn8 mb-2">
//                         Your Current Rank: {rankInfo.title}
//                       </h3>
//                       <p className="text-funlearn7">{rankInfo.desc}</p>
//                       <p className="text-sm text-funlearn8 mt-2">
//                         Level {rankInfo.level} • {rankInfo.progress}% to next rank
//                       </p>
//                     </div>
//                     <div className="text-4xl">
//                       {rankInfo.level > 0 ? backendRanks[rankInfo.level - 1]?.icon : "🌱"}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* All Ranks */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">All Ranks</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {rankAchievements.map((achievement) => (
//                     <div
//                       key={achievement.id}
//                       className={`p-4 rounded-lg border-2 transition-all ${
//                         achievement.earned
//                           ? "bg-funlearn1 border-funlearn4"
//                           : achievement.level === (rankInfo?.level || 0)
//                           ? "bg-yellow-50 border-yellow-200"
//                           : "bg-gray-50 border-gray-200 opacity-60"
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3 mb-3">
//                         <span className="text-2xl">{achievement.icon}</span>
//                         <div>
//                           <h3 className="font-semibold text-gray-900">
//                             {achievement.name}
//                           </h3>
//                           <p className="text-sm text-gray-600">
//                             Level {achievement.level}
//                           </p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             {achievement.scoreRequired} points
//                           </p>
//                         </div>
//                       </div>
//                       {achievement.earned ? (
//                         <div className="text-sm text-funlearn7 font-medium">
//                           ✓ Achieved
//                         </div>
//                       ) : achievement.level === (rankInfo?.level || 0) ? (
//                         <div className="text-sm text-yellow-700 font-medium">
//                           🔥 Next Goal
//                         </div>
//                       ) : (
//                         <div className="text-sm text-gray-500">Locked</div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }