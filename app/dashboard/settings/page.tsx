"use client";
import { useState } from "react";

interface SettingsProps {
  user: any;
}

export default function Settings({ user }: SettingsProps) {
  const [activeSection, setActiveSection] = useState<
    "account" | "notifications" | "privacy" | "appearance"
  >("account");
  const [settings, setSettings] = useState({
    // Account settings
    emailNotifications: true,
    pushNotifications: false,
    quizReminders: true,
    chatNotifications: true,

    // Privacy settings
    profileVisibility: "public",
    showActivity: true,
    allowMessages: true,

    // Appearance
    theme: "light",
    fontSize: "medium",
  });

  const handleSaveSettings = () => {
    // Save settings to backend
    console.log("Saving settings:", settings);
    // API call to update user settings
  };

  const sections = [
    { id: "account", label: "Account Settings", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Settings
              </h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-funlearn8 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeSection === "account" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Account Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.userName || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      id: "emailNotifications",
                      label: "Email Notifications",
                      description: "Receive updates via email",
                    },
                    {
                      id: "pushNotifications",
                      label: "Push Notifications",
                      description: "Receive browser notifications",
                    },
                    {
                      id: "quizReminders",
                      label: "Quiz Reminders",
                      description: "Get reminded about unfinished quizzes",
                    },
                    {
                      id: "chatNotifications",
                      label: "Chat Notifications",
                      description: "Notify about new chat messages",
                    },
                  ].map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {setting.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {setting.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            settings[
                              setting.id as keyof typeof settings
                            ] as boolean
                          }
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              [setting.id]: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full 
                        peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                        after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                        peer-checked:bg-funlearn6"
                        ></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Privacy Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          profileVisibility: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: "showActivity",
                        label: "Show Activity Status",
                        description: "Allow others to see when you are active",
                      },
                      {
                        id: "allowMessages",
                        label: "Allow Direct Messages",
                        description:
                          "Allow other users to send you direct messages",
                      },
                    ].map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {setting.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            {setting.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              settings[
                                setting.id as keyof typeof settings
                              ] as boolean
                            }
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                [setting.id]: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full
                           peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                           after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                           peer-checked:bg-funlearn6"
                          ></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Appearance
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="flex space-x-4">
                      {[
                        { id: "light", label: "Light", icon: "☀️" },
                        { id: "dark", label: "Dark", icon: "🌙" },
                        { id: "auto", label: "Auto", icon: "⚙️" },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              theme: theme.id,
                            }))
                          }
                          className={`flex flex-col items-center space-y-2 p-4 border-2 rounded-lg transition-all ${
                            settings.theme === theme.id
                              ? "border-funlearn6 bg-funlearn2"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-2xl">{theme.icon}</span>
                          <span className="font-medium text-gray-900">
                            {theme.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          fontSize: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={handleSaveSettings}
                className="bg-funlearn8 text-white px-6 py-3 rounded-lg font-semibold hover:bg-funlearn9 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
