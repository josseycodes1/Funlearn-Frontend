const features = [
  {
    title: 'AI-Powered Analysis',
    description: 'Upload any material and get instant summaries, key points, and recommended learning resources.',
    icon: '📚'
  },
  {
    title: 'Gamified Quizzes',
    description: 'Three difficulty levels with points, badges, and leaderboards to make learning competitive and fun.',
    icon: '🎮'
  },
  {
    title: 'Collaborative Chat Rooms',
    description: 'Invite friends, form study groups, and learn together in real-time chat rooms.',
    icon: '💬'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="text-funlearn8">Excel</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed to transform your learning experience from boring to brilliant
          </p>
        </div>

        {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-funlearn8">10K+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-funlearn8">95%</div>
              <div className="text-gray-600">Better Retention</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-funlearn8">24/7</div>
              <div className="text-gray-600">Learning Support</div>
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-funlearn1 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-lilac-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}