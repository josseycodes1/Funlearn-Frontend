import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-funlearn1 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Learning Made{' '}
            <span className="text-funlearn8">Fun & Engaging</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered summaries, interactive quizzes, and collaborative chat rooms - all designed to make learning enjoyable for students of all levels
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup"
              className="bg-funlearn8 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-funlearn8 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Learning Free
            </Link>
            <Link 
              href="/signup"
              className="border-2 border-funlearn8 text-funlearn8 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-funlearn2 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}