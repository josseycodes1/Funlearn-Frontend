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
}

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileData(data.user);
          setEditData(data.user);
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

  const handleSave = async () => {
    if (!editData) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      // Create a clean payload with only the fields we want to update
      const payload: any = {};
      
      // Only include fields that are defined
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
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-funlearn6 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <p className="text-gray-600">Unable to load user profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileData.profilePhoto?.url ? (
              <img
                src={profileData.profilePhoto.url}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-funlearn4 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-funlearn8">
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
              className="absolute bottom-0 right-0 w-6 h-6 bg-funlearn6 rounded-full flex items-center justify-center cursor-pointer hover:bg-funlearn7 transition-colors"
            >
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
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profileData.userName}
            </h1>
            <p className="text-gray-600 mt-1">{profileData.email}</p>
            <p className="text-gray-500 text-sm mt-2">
              {profileData.bio || "No bio yet"}
            </p>
          </div>
          <button
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            disabled={isSaving}
            className="bg-funlearn6 text-white px-4 py-2 rounded-lg font-semibold hover:bg-funlearn7 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isEditing ? (
              "Cancel"
            ) : (
              "Edit Profile"
            )}
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
                />
              </div>
              <div className="md:col-span-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
                />
              </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
                >
                  <option value="">Select Grade Level</option>
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
                  {(editData?.interests || []).map((interest) => (
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent text-black"
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
                  disabled={isSaving}
                  className="bg-funlearn6 text-white px-6 py-3 rounded-lg font-semibold hover:bg-funlearn7 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
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
                <p className="text-gray-900">{profileData.school || "Not specified"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <p className="text-gray-900">{profileData.level || "Not specified"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <p className="text-gray-900">{profileData.bio || "No bio yet"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {(profileData.interests || []).map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 bg-funlearn2 text-funlearn8 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                  {(profileData.interests || []).length === 0 && (
                    <p className="text-gray-500 text-sm">No interests added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}