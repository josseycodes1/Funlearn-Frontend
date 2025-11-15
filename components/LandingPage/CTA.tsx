import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20 bg-funlearn1">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of students who are making learning fun and effective. Start your journey today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/signup"
            className="bg-funlearn8 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-funlearn7 transition-colors shadow-sm"
          >
            Get Started Free
          </Link>
          <Link 
            href="/signup"
            className="border-2 border-funlearn8 text-funlearn8 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-funlearn2 transition-colors"
          >
            Learn More
          </Link>
        </div>
        <p className="text-gray-500 mt-4 text-sm">
          No credit card required • Free forever plan
        </p>
      </div>
    </section>
  );
}