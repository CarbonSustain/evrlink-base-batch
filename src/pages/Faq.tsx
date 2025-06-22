import React, { useState } from 'react';

const Faq = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 md:p-12 max-w-3xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-2 text-gray-900 mt-6 text-left">FAQs (Frequently Asked Questions)</h2>
      <p className="text-gray-500 mb-8 text-left">We're here to help answer any questions you might have.</p>
      <div className="space-y-4">
        <FAQItem question="What is this app for?">
          This app lets you create and personalize digital greeting cards and send them to friends and loved ones — all onchain! Think of it as mixing creativity, crypto, and heartfelt messages.
        </FAQItem>
        <FAQItem question="How do I pay for a Meep?">
          You can pay for a Meep using your connected wallet. Supported payment methods include ETH and other tokens on Base.
        </FAQItem>
        <FAQItem question="What is a Base Smart Wallet?">
          A Base Smart Wallet is a secure, onchain wallet that allows you to send, receive, and manage your Meeps and other digital assets easily.
        </FAQItem>
        <FAQItem question="What is a Base name?">
          A Base name is your unique onchain identity, making it easy for friends to find and send you Meeps.
        </FAQItem>
        <FAQItem question="What are key features of Basenames?">
          Basenames offer unique, memorable identities, easy wallet management, and enhanced security for your onchain activities.
        </FAQItem>
        <FAQItem question="How do Basenames work?">
          Basenames are registered onchain and linked to your wallet, allowing seamless interaction with Meeps and other features.
        </FAQItem>
      </div>
    </div>
  );
};

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

function FAQItem({ question, children }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-[#f9fafb] rounded-xl ${open ? 'shadow-md' : ''} transition-all`}>
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 text-lg">{question}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg width="28" height="28" fill="none" stroke="#00B2C7" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 text-base animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default Faq;