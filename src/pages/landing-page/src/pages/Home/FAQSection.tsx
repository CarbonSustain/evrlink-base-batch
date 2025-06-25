import React from 'react';
import Accordion from '../../components/ui/Accordion';
import { AccordionItem } from '../../components/ui/Accordion';;

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "What is a Base Smart Wallet?",
      answer: "A Base Smart Wallet is a secure, user-friendly wallet built on the Base blockchain that allows you to manage your digital assets and interact with decentralized applications seamlessly."
    },
    {
      question: "What is a Base name?",
      answer: "A Base name is a human-readable address (like yourname.base.eth) that makes it easier to send and receive transactions instead of using long wallet addresses."
    },
    {
      question: "How do I pay for a Meep?",
      answer: "You can pay for Meeps using cryptocurrency through your connected smart wallet. We accept various tokens on the Base network for convenient and fast transactions."
    },
    {
      question: "Where are my Meeps stored?",
      answer: "Your Meeps are stored on the Base blockchain, ensuring they are permanent, secure, and accessible forever. This decentralized storage means your greeting cards will never be lost."
    },
    {
      question: "How do I send a Meep to someone without a Smart Wallet?",
      answer: "You can send Meeps to anyone using their email address. We will help them set up a simple wallet to receive and view their Meep, making the process accessible to everyone."
    }
  ];

  return (
    <section id="faq-section" className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-medium text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Got questions? We have got answers.
          </p>
        </div>
        
        <Accordion className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} title={faq.question}>
              <p className=" font-regular text-gray-700 leading-relaxed">{faq.answer}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;