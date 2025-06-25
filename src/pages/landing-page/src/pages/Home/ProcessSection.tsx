import React from 'react';
import Card from '../../components/ui/Card';

const ProcessSection: React.FC = () => {
  const handleLearnMore = () => {
    window.open('https://www.base.org/', '_blank');
  };

  return (
    <section className="py-16 px-4 bg-gray-50 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium text-slate-800 mb-4">
            How to send a Greeting Card
          </h2>

          <div className="text-lg text-slate-800 max-w-lg mx-auto">
            <span>Creating and sending </span>
            <span className="text-xl" style={{ fontFamily: 'Patrick Hand' }}>
              Meeps,
            </span>
            <span> is easy and fun. Follow these simple steps to send your first Meep.</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <Card background="bg-indigo-100" padding="lg" rounded="xl">
            <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <img 
                src="/images/img_vector_white_a700.svg" 
                alt="Wallet icon" 
                className="w-5 h-5"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Get a Smart Wallet or Basename
            </h3>
            <p className="text-lg text-gray-900 mb-6">
              If you already have these, skip to next step
            </p>
            <button 
              onClick={handleLearnMore}
              className="text-indigo-600 text-lg font-medium flex items-center hover:text-indigo-700 transition-colors"
            >
              Learn more
              <img 
                src="/images/img_evaexternallinkoutline.svg" 
                alt="External link" 
                className="w-5 h-5 ml-2"
              />
            </button>
          </Card>
          
          {/* Step 2 */}
          <Card background="bg-cyan-50" padding="lg" rounded="xl">
            <div className="bg-cyan-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <img 
                src="/images/img_vector_white_a700_31x22.svg" 
                alt="Card icon" 
                className="w-8 h-6"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              <span>Choose a </span>
              <span className="text-3xl" style={{ fontFamily: 'Patrick Hand' }}>Meep</span>
            </h3>
            <p className="text-lg text-gray-900">
              Include an optional note to personalize your greeting.
            </p>
          </Card>
          
          {/* Step 3 */}
          <Card background="bg-pink-100" padding="lg" rounded="xl">
            <div className="bg-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <img 
                src="/images/img_vector_white_a700_24x24.svg" 
                alt="Send icon" 
                className="w-6 h-6"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Generate and Send
            </h3>
            <div className="text-lg text-gray-900">
              <span>Send the </span>
              <span className="text-xl " style={{ fontFamily: 'Patrick Hand' }}>
                Meep 
              </span>
              <span>  to the receiver's email address, basename or smart wallet address.</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;