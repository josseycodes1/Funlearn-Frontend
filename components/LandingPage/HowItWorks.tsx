const steps = [
  {
    step: 1,
    title: 'Sign Up & Choose Your Subject',
    description: 'Create your free account and select from a wide range of subjects and topics.'
  },
  {
    step: 2,
    title: 'Upload & Analyze Materials',
    description: 'Upload your study materials and get instant AI-powered summaries and key points.'
  },
  {
    step: 3,
    title: 'Practice with Quizzes',
    description: 'Test your knowledge with gamified quizzes across three difficulty levels.'
  },
  {
    step: 4,
    title: 'Collaborate & Learn Together',
    description: 'Join chat rooms, invite friends, and learn collaboratively in real-time.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-funlearn1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How <span className="text-funlearn8">Funlearn</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in just 4 simple steps and transform your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="shrink-0 w-12 h-12 bg-lilac-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Placeholder */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-lilac-100">
            <div className="aspect-video bg-funlearn2 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-gray-600 font-medium">Interactive Learning Demo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}