"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface Question {
  _id: string;
  question: string;
  options: {
    label: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
}

interface QuestionGroup {
  difficulty: "easy" | "hard";
  list: Question[];
}

interface QuestionSet {
  _id: string;
  topic: string;
  questions: {
    easyQuestions: QuestionGroup;
    hardQuestions: QuestionGroup;
  };
}

type QuizStage = "easy" | "easy-completed" | "hard" | "completed";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const questionSetId = params.id as string;

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState<QuizStage>("easy");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [easyScore, setEasyScore] = useState(0);
  const [hardScore, setHardScore] = useState(0);
  const [answeredEasyQuestions, setAnsweredEasyQuestions] = useState<
    Set<number>
  >(new Set());
  const [answeredHardQuestions, setAnsweredHardQuestions] = useState<
    Set<number>
  >(new Set());

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    fetchQuestionSet();
  }, [questionSetId]);

  const fetchQuestionSet = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/questions/${questionSetId}`);
      setQuestionSet(response.data.questionSet);
    } catch (error) {
      console.error("Error fetching question set:", error);
      alert("Failed to load quiz. Please try again.");
      router.push("/quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentQuestions = (): Question[] => {
    if (!questionSet) return [];

    if (currentStage === "easy") {
      return questionSet.questions.easyQuestions?.list || [];
    } else if (currentStage === "hard") {
      return questionSet.questions.hardQuestions?.list || [];
    }

    return [];
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (
      (currentStage === "easy" &&
        answeredEasyQuestions.has(currentQuestionIndex)) ||
      (currentStage === "hard" &&
        answeredHardQuestions.has(currentQuestionIndex))
    ) {
      return;
    }
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (currentStage === "easy" && isCorrect) {
      setEasyScore((prev) => prev + 1); // Easy questions worth 1 point
    } else if (currentStage === "hard" && isCorrect) {
      setHardScore((prev) => prev + 2); // Hard questions worth 2 points
    }

    if (currentStage === "easy") {
      setAnsweredEasyQuestions((prev) =>
        new Set(prev).add(currentQuestionIndex)
      );
    } else {
      setAnsweredHardQuestions((prev) =>
        new Set(prev).add(currentQuestionIndex)
      );
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Finished current stage
      if (currentStage === "easy") {
        setCurrentStage("easy-completed");
      } else if (currentStage === "hard") {
        setCurrentStage("completed");
        submitFinalScore();
      }
    }
  };

  const handleContinueToHardQuestions = () => {
    setCurrentStage("hard");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleEndQuizAfterEasy = async () => {
    // Submit only easy score and mark as completed
    try {
      await api.patch(`/api/questions/score`, {
        newScore: easyScore,
        topic: questionSet?.topic,
        questionSetId: questionSetId,
      });
      setCurrentStage("completed");
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  const submitFinalScore = async () => {
    try {
      const totalScore = easyScore + hardScore;

      await api.patch(`/api/questions/score`, {
        newScore: totalScore,
        topic: questionSet?.topic,
        questionSetId: questionSetId,
      });
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentStage("easy");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setEasyScore(0);
    setHardScore(0);
    setAnsweredEasyQuestions(new Set());
    setAnsweredHardQuestions(new Set());
  };

  const getProgressPercentage = () => {
    const totalEasyQuestions =
      questionSet?.questions.easyQuestions?.list.length || 0;
    const totalHardQuestions =
      questionSet?.questions.hardQuestions?.list.length || 0;

    if (currentStage === "easy") {
      return ((currentQuestionIndex + 1) / totalEasyQuestions) * 100;
    } else if (currentStage === "hard") {
      return ((currentQuestionIndex + 1) / totalHardQuestions) * 100;
    }

    return 100;
  };

  const getTotalQuestionsForCurrentStage = () => {
    if (currentStage === "easy") {
      return questionSet?.questions.easyQuestions?.list.length || 0;
    } else if (currentStage === "hard") {
      return questionSet?.questions.hardQuestions?.list.length || 0;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-funlearn8"></div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz Not Found
          </h1>
          <button
            onClick={() => router.push("/quizpage")}
            className="px-6 py-2 bg-funlearn8 text-white rounded-lg font-semibold hover:bg-funlearn3 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Stage: Easy Questions Completed - Show intermediate screen
  if (currentStage === "easy-completed") {
    const totalEasyQuestions =
      questionSet.questions.easyQuestions?.list.length || 0;
    const totalHardQuestions =
      questionSet.questions.hardQuestions?.list.length || 0;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎯</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Easy Questions Completed!
            </h1>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <div className="text-4xl font-bold text-funlearn8 mb-2">
                {easyScore} / {totalEasyQuestions}
              </div>
              <div className="text-lg text-gray-600">
                {Math.round((easyScore / totalEasyQuestions) * 100)}% Correct
              </div>
              <div className="text-sm text-gray-500 mt-2">
                You earned {easyScore} points
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-yellow-800 mb-3">
                Challenge Yourself! 🚀
              </h3>
              <p className="text-yellow-700 mb-4">
                You've completed the easy questions! There are{" "}
                <strong>{totalHardQuestions} more difficult questions</strong>{" "}
                available.
              </p>
              <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-semibold">
                  ⭐ Hard questions are worth <strong>2 points each</strong>!
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Double the points for double the challenge!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContinueToHardQuestions}
                className="px-8 py-3 bg-funlearn8 text-white rounded-lg font-semibold hover:bg-funlearn3 transition-colors"
              >
                Continue to Hard Questions
              </button>
              <button
                onClick={handleEndQuizAfterEasy}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                End Quiz Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stage: Quiz Fully Completed
  if (currentStage === "completed") {
    const totalEasyQuestions =
      questionSet.questions.easyQuestions?.list.length || 0;
    const totalHardQuestions =
      questionSet.questions.hardQuestions?.list.length || 0;
    const totalScore = easyScore + hardScore;
    const totalQuestions = totalEasyQuestions + totalHardQuestions;
    const maxPossibleScore = totalEasyQuestions + totalHardQuestions * 2;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎉</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Quiz Completed!
            </h1>
            <h2 className="text-xl text-gray-600 mb-2">
              Topic: {questionSet.topic}
            </h2>

            {/* Score Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <div className="text-4xl font-bold text-funlearn8 mb-2">
                {totalScore} / {maxPossibleScore}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                Total Points Earned
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="font-semibold text-gray-700">
                    Easy Questions:
                  </div>
                  <div>
                    {easyScore} / {totalEasyQuestions} points
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-700">
                    Hard Questions:
                  </div>
                  <div>
                    {hardScore} / {totalHardQuestions * 2} points
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-3 bg-funlearn8 text-white rounded-lg font-semibold hover:bg-funlearn3 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/dashboard/quizpage")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Quiz Interface (Easy or Hard stage)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {questionSet.topic}
              </h1>
              <p className="text-gray-600">
                {currentStage === "easy"
                  ? "Easy Questions - 1 point each"
                  : "Hard Questions - 2 points each"}
              </p>
            </div>
            <div className="mt-2 sm:mt-0 text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of{" "}
              {getTotalQuestionsForCurrentStage()}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                currentStage === "easy" ? "bg-funlearn6" : "bg-funlearn8"
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion?.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option) => {
                const isAnswered =
                  currentStage === "easy"
                    ? answeredEasyQuestions.has(currentQuestionIndex)
                    : answeredHardQuestions.has(currentQuestionIndex);

                const isCorrectAnswer =
                  option.label === currentQuestion.correctAnswer;
                const isSelected = selectedAnswer === option.label;

                return (
                  <button
                    key={option.label}
                    onClick={() => handleAnswerSelect(option.label)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      isSelected
                        ? isCorrectAnswer
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : isAnswered && isCorrectAnswer
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      isAnswered
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${
                          isSelected
                            ? isCorrectAnswer
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-red-500 bg-red-500 text-white"
                            : isAnswered && isCorrectAnswer
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {option.label}
                      </div>
                      <span className="text-gray-900">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && currentQuestion?.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push("/dashboard/quizpage")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Exit Quiz
            </button>

            {!(
              (currentStage === "easy" &&
                answeredEasyQuestions.has(currentQuestionIndex)) ||
              (currentStage === "hard" &&
                answeredHardQuestions.has(currentQuestionIndex))
            ) ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-funlearn8 text-white rounded-lg font-semibold hover:bg-funlearn3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                {currentQuestionIndex < currentQuestions.length - 1
                  ? "Next Question"
                  : currentStage === "easy"
                  ? "View Results"
                  : "Finish Quiz"}
              </button>
            )}
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Current Score:</span>
              <span className="ml-2 text-lg font-semibold text-funlearn8">
                {currentStage === "easy" ? easyScore : easyScore + hardScore}{" "}
                points
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {currentStage === "easy"
                ? "1 point per question"
                : "2 points per question"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}