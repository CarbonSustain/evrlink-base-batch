import React from 'react';
import Button from '../ui/Button';
import "@fontsource/nunito"; // Defaults to weight 400

// or import specific weights if needed:
import "@fontsource/nunito/700.css";


interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  const handleCreateCard = () => {
    console.log('Create a Card clicked');
  };

  return (
    <section className={`relative bg-gradient-to-b from-cyan-100 to-white py-20 px-4 overflow-hidden ${className}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <img 
          src="/images/img_vector_2.svg" 
          alt="" 
          className="absolute top-16 right-80 w-20 h-16"
        />
        <img 
          src="/images/img_group_1650.svg" 
          alt="" 
          className="absolute top-24 right-96 w-6 h-6"
        />
        <img 
          src="/images/img_group_1672.svg" 
          alt="" 
          className="absolute top-8 right-60 w-30 h-30"
        />
        <img 
          src="/images/img_vector.svg" 
          alt="" 
          className="absolute bottom-32 right-96 w-8 h-8"
        />
        <img 
          src="/images/img_group_1651.svg" 
          alt="" 
          className="absolute bottom-16 left-1/2 w-4 h-4"
        />
        <img 
          src="/images/img_group_1654.svg" 
          alt="" 
          className="absolute top-16 left-72 w-10 h-11"
        />
        <img 
          src="/images/img_group_1655.svg" 
          alt="" 
          className="absolute bottom-32 left-60 w-11 h-12"
        />
        <img 
          src="/images/img_group_1656.svg" 
          alt="" 
          className="absolute top-32 right-80 w-11 h-12"
        />
        <img 
          src="/images/img_group_1677.svg" 
          alt="" 
          className="absolute top-4 left-1/2 w-5 h-6"
        />
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-normal text-slate-800 mb-6 leading-tight" style={{ fontFamily: 'Patrick Hand' }}>
          Meeps, Greeting Cards with more value
        </h1>
        
        <div className="text-4xl font-medium mb-6 leading-tight">
          <span className="text-cyan-500">Save </span>
          <span className="text-slate-800">Money. </span>
          <span className="text-pink-500">Send </span>
          <span className="text-slate-800">Instantly. </span>
          <span className="text-blue-600">Seal </span>
          <span className="text-slate-800">Your Greetings Forever.</span>
        </div>
        
        <p className="text-xl text-slate-800 mb-12 max-w-lg mx-auto leading-relaxed">
          Keepsakes you and your friends, family - anyone can revisit anytime!
        </p>
        
<Button
  onClick={handleCreateCard}
  className="bg-meepblue text-white px-10 py-4 text-lg rounded-full hover:bg-meepblue-hover shadow-md transition-all duration-300"
>
  Create a Card
</Button>

      </div>
    </section>
  );
};

export default HeroSection;