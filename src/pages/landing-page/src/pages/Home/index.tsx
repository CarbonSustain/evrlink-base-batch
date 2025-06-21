import React from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import HeroSection from '../../components/common/HeroSection';
import FeaturesSection from './FeaturesSection';
import ProcessSection from './ProcessSection';
import CategoriesSection from './CategoriesSection';
import TestimonialSection from './TestimonialSection';
import MissionSection from './MissionSection';
import CTASection from './CTASection';
import FAQSection from './FAQSection';

const HomePage: React.FC = () => {
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProcessSection />
        <CategoriesSection />
        <TestimonialSection />
        <MissionSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;