import Navbar from '@/components/LandingPage/Navbar';
import Hero from '@/components/LandingPage/Hero';
import Features from '@/components/LandingPage/Features';
import HowItWorks from '@/components/LandingPage/HowItWorks';
import Testimonials from '@/components/LandingPage/Testimonials';
import CTA from '@/components/LandingPage/CTA';
import Footer from '@/components/LandingPage/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}