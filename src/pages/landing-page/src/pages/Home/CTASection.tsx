import React from 'react';
import Button from '../../components/ui/Button';

const CTASection: React.FC = () => {
  const handleGetSmartWallet = () => {
    window.open('https://www.coinbase.com/en-in/wallet', '_blank');
  };

  const handleLearnBase = () => {
    window.open('https://www.base.org/', '_blank');
  };

  return (
    <section className="w-full flex justify-center bg-white py-16">
      <div className="w-[80%] bg-[#1D1554] rounded-[24px] p-8 md:p-16 relative text-center">
        {/* Top Left Icon */}
        <img
          src="/images/img_basesymbolwhite_2.png"
          alt=""
          className="absolute top-6 left-6 w-12 h-12 opacity-60"
        />

        {/* Top Text */}
        <p className="text-gray-300 text-sm mb-4">(Base interlude...)</p>

        {/* Title */}
        <h2 className="text-white text-2xl md:text-4xl font-bold mb-4">
          Join the new global economy.
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-10">
          Get your Smart Wallet and Basename and unlock increased economic freedom,
          innovation and creativity.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGetSmartWallet}
            className="bg-white text-black text-base font-medium py-2 px-6 rounded-lg transition hover:bg-gray-100"
          >
            Get a Smart Wallet
          </button>
          <button
            onClick={handleLearnBase}
            className="text-white text-base font-medium py-2 px-6 border border-white rounded-lg hover:bg-white hover:text-black transition"
          >
            Learn about Base
          </button>
        </div>

        {/* Bottom Right Icon */}
        <img
          src="/images/img_basesymbolwhite_2.png"
          alt=""
          className="absolute bottom-6 right-6 w-20 h-20 opacity-40"
        />
      </div>
    </section>
  );
};

export default CTASection;
