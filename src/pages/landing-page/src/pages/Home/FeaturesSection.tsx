import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="min-h-screen py-16 px-4 bg-white flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-medium text-cyan-500 mb-6">
              Traditional Greeting Cards are Broken
            </h2>
            <div className="text-lg text-slate-800 leading-relaxed">
              <span>Enter </span>
              <span className="text-xl" style={{ fontFamily: 'Patrick Hand' }}>
                Meeps, 
              </span>
              <span>a better greeting card. Save time and money. Never lost in cluttered emails, No envelopes. Just Onchain Magic</span>
            </div>
          </div>
          <div className="relative w-80 mx-auto">
            <img 
              src="/images/birthday-card.jpg" 
              alt="Birthday Card" 
              className="w-80 h-auto rounded-md shadow-sm"
              onError={(e) => {
                // Fallback if image doesn't load
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x300?text=Birthday+Card';
              }}
            />
            <img 
              src="/images/img_vector_4.svg" 
              alt="" 
              className="absolute top-20 -left-10 w-20 h-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;