"use client";
import { useState, useEffect } from "react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  questionCount: number;
  timeLimit: number;
  completed: boolean;
  bestScore?: number;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockQuizzes: Quiz[] = [
      {
        id: "1",
        title: "Mathematics Basics",
        description: "Test your fundamental math skills",
        difficulty: "easy",
        category: "Mathematics",
        questionCount: 10,
        timeLimit: 15,
        completed: true,
        bestScore: 85,
      },
      {
        id: "2",
        title: "Advanced Algebra",
        description: "Challenge yourself with algebraic equations",
        difficulty: "medium",
        category: "Mathematics",
        questionCount: 15,
        timeLimit: 20,
        completed: false,
      },
      {
        id: "3",
        title: "Science Fundamentals",
        description: "Explore basic scientific concepts",
        difficulty: "easy",
        category: "Science",
        questionCount: 12,
        timeLimit: 18,
        completed: true,
        bestScore: 92,
      },
      {
        id: "4",
        title: "Physics Challenge",
        description: "Test your physics knowledge",
        difficulty: "hard",
        category: "Science",
        questionCount: 20,
        timeLimit: 30,
        completed: false,
      },
      {
        id: "5",
        title: "History Trivia",
        description: "Journey through historical events",
        difficulty: "medium",
        category: "History",
        questionCount: 15,
        timeLimit: 25,
        completed: false,
      },
      {
        id: "6",
        title: "Geography Expert",
        description: "Explore world geography",
        difficulty: "medium",
        category: "Geography",
        questionCount: 18,
        timeLimit: 22,
        completed: true,
        bestScore: 78,
      },
    ];

    setTimeout(() => {
      setQuizzes(mockQuizzes);
      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = ["all", ...new Set(quizzes.map((q) => q.category))];
  const difficulties = ["all", "easy", "medium", "hard"];

  const filteredQuizzes = quizzes.filter((quiz) => {
    const categoryMatch =
      selectedCategory === "all" || quiz.category === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startQuiz = (quizId: string) => {
    alert(`Starting quiz: ${quizId}`);
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funlearn8 focus:border-transparent"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === "all"
                    ? "All Difficulties"
                    : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {quiz.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                    quiz.difficulty
                  )}`}
                >
                  {quiz.difficulty}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>📝 {quiz.questionCount} questions</span>
                <span>⏱️ {quiz.timeLimit} min</span>
              </div>

              {quiz.completed && quiz.bestScore && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Best Score</span>
                    <span className="font-semibold text-funlearn7">
                      {quiz.bestScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-funlearn6 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${quiz.bestScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={() => startQuiz(quiz.id)}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  quiz.completed
                    ? "bg-funlearn8 text-white hover:bg-funlearn3"
                    : "bg-funlearn8 text-white hover:bg-funlearn3"
                }`}
              >
                {quiz.completed ? "Try Again" : "Start Quiz"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-funlearn2 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to find more quizzes.
          </p>
        </div>
      )}
    </div>
  );
}
