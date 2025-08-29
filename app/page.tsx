import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import CTA from '@/components/home/CTA';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}