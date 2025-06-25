import React from 'react';

const TestimonialSection: React.FC = () => {
  return (
    <section className="flex justify-center px-4 py-16 bg-white">
      <div className="w-[80%] text-center">
        <h2 className="font-satoshi text-2xl md:text-3xl font-medium mb-10">
          From Us, to You!
        </h2>

        <div className="relative flex justify-center">
          <img
            src="/images/testimonial-card.jpg"
            alt="Meep Welcome Card"
            className="max-w-[320px] sm:max-w-[400px]"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
