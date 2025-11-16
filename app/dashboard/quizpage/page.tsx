"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface QuestionSet {
  _id: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  userScore: number;
  inviteToken: string;
  totalQuestions: number;
  easyQuestionsCount: number;
  hardQuestionsCount: number;
}

export default function QuizPage() {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoiningQuiz, setIsJoiningQuiz] = useState(false);
  const [joinToken, setJoinToken] = useState("");
  const router = useRouter();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  // Create Axios instance with default config
  const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
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
    fetchQuestionSets();
  }, []);

  const fetchQuestionSets = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/questions");
      setQuestionSets(response.data.questionSets || []);
    } catch (error) {
      console.error("Error fetching question sets:", error);
      setQuestionSets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    try {
      setIsGenerating(true);
      const response = await api.post("/api/ai/questions", {
        quizTopic: topicInput.trim(),
      });

      // Refresh the question sets list to include the newly generated one
      await fetchQuestionSets();
      setTopicInput("");
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = (questionSetId: string) => {
    router.push(`quizpage/quiz/${questionSetId}`);
  };

  const copyInviteToken = async (questionSet: QuestionSet) => {
    try {
      await navigator.clipboard.writeText(questionSet.inviteToken);
      alert("Invite token copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy invite token:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = questionSet.inviteToken;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Invite token copied to clipboard!");
    }
  };

  const joinQuizByToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinToken.trim()) return;

    try {
      const response = await api.post("/api/questions/questionSet", {
        questionSetId: joinToken.trim(),
      });

      const joinedQuestionSet = response.data;

      // Refresh the question sets list to include the newly joined one
      await fetchQuestionSets();

      setJoinToken("");
      setIsJoiningQuiz(false);

      alert("Successfully joined the quiz!");

      // Optionally, redirect to the joined quiz
      // startQuiz(joinedQuestionSet._id);
    } catch (error: any) {
      console.error("Error joining quiz:", error);
      alert(
        error.response?.data?.message ||
          "Failed to join quiz. Please check the invite token."
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 24) return "bg-green-100 text-green-800"; // 80% of 30
    if (score >= 18) return "bg-yellow-100 text-yellow-800"; // 60% of 30
    if (score > 0) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getScorePercentage = (score: number) => {
    return Math.round((score / 30) * 100);
  };

  const getDifficultyDistribution = (easy: number, hard: number) => {
    const total = easy + hard;
    if (total === 0) return { easyWidth: "0%", hardWidth: "0%" };

    const easyWidth = `${(easy / total) * 100}%`;
    const hardWidth = `${(hard / total) * 100}%`;
    return { easyWidth, hardWidth };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-funlearn8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Take a Quiz 🎯</h1>
        <p className="text-gray-600 mt-2">
          Test your knowledge and earn points!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setIsJoiningQuiz(true)}
          className="bg-white text-funlearn8 border-2 border-funlearn8 px-6 py-2 rounded-lg font-medium hover:bg-funlearn1 transition-colors"
        >
          Join Quiz
        </button>
      </div>

      {/* Join Quiz Modal */}
      {isJoiningQuiz && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Join Quiz
            </h3>
            <form onSubmit={joinQuizByToken}>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-funlearn8 transition-colors text-gray-900 placeholder-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get the invite token from the quiz creator
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsJoiningQuiz(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-funlearn8 text-white rounded-lg font-medium hover:bg-funlearn3 transition-colors"
                >
                  Join Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Generate New Quiz
        </h2>
        <form
          onSubmit={generateQuestions}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <label
              htmlFor="quizTopic"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Topic
            </label>
            <input
              type="text"
              id="quizTopic"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter a topic to generate questions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!topicInput.trim() || isGenerating}
              className="w-full sm:w-auto px-6 py-2 bg-funlearn8 text-white rounded-lg font-semibold hover:bg-funlearn3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </span>
              ) : (
                "Generate Questions"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Question Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionSets.map((questionSet) => {
          const { easyWidth, hardWidth } = getDifficultyDistribution(
            questionSet.easyQuestionsCount,
            questionSet.hardQuestionsCount
          );
          const scorePercentage = getScorePercentage(questionSet.userScore);

          return (
            <div
              key={questionSet._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {questionSet.topic}
                  </h3>
                  {questionSet.userScore > 0 && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(
                        questionSet.userScore
                      )}`}
                    >
                      {scorePercentage}%
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {/* Score Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">
                        Your Score
                      </span>
                      <span className="font-semibold text-funlearn7">
                        {questionSet.userScore}/30
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-funlearn6 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${scorePercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>📝 {questionSet.totalQuestions} questions</span>
                    <span>
                      🕒 {new Date(questionSet.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Difficulty Distribution */}
                  <div className="text-sm">
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Easy: {questionSet.easyQuestionsCount}</span>
                      <span>Hard: {questionSet.hardQuestionsCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
                      {questionSet.easyQuestionsCount > 0 && (
                        <div
                          className="bg-green-500 h-2 transition-all duration-500"
                          style={{ width: easyWidth }}
                          title={`${questionSet.easyQuestionsCount} easy questions`}
                        ></div>
                      )}
                      {questionSet.hardQuestionsCount > 0 && (
                        <div
                          className="bg-red-500 h-2 transition-all duration-500"
                          style={{ width: hardWidth }}
                          title={`${questionSet.hardQuestionsCount} hard questions`}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyInviteToken(questionSet)}
                    className="flex-1 p-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
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
                    onClick={() => startQuiz(questionSet._id)}
                    className="flex-1 py-2 px-4 bg-funlearn8 text-white rounded-lg font-semibold hover:bg-funlearn3 transition-colors"
                  >
                    {questionSet.userScore > 0 ? "Try Again" : "Start Quiz"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {questionSets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-funlearn2 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 mb-4">
            Generate your first quiz by entering a topic above or join an
            existing quiz!
          </p>
        </div>
      )}
    </div>
  );
}