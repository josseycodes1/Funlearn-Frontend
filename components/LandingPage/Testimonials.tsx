const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'College Student',
    content: 'Funlearn made studying for my finals actually enjoyable! The quizzes are addictive.',
    avatar: '👩‍🎓'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'High School Student',
    content: 'The AI summaries save me hours of reading. Plus, studying with friends in chat rooms is amazing!',
    avatar: '👨‍🎓'
  },
  {
    name: 'Emily Thompson',
    role: 'Graduate Student',
    content: 'Finally, a platform that understands how students actually want to learn. The gamification works!',
    avatar: '👩‍💼'
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by{' '}
            <span className="text-funlearn8">Students</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of students who are transforming their learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-funlearn1 rounded-2xl p-6 border border-funlearn2 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{testimonial.avatar}</div>
              <p className="text-gray-700 mb-4 italic">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-funlearn7 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}