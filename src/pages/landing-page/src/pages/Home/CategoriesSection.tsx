import React from 'react';

const CategoriesSection: React.FC = () => {
  const categories = [
    {
      icon: "/images/img_happy_birthday_1.svg",
      title: "Birthday",
      description: "A Person\'s Birthday",
      bgColor: "bg-orange-100"
    },
    {
      icon: "/images/img_congratulations_1.svg",
      title: "Congrats",
      description: "Wins in life or hitting milestones",
      bgColor: "bg-cyan-100"
    },
    {
      icon: "/images/img_love_1.svg",
      title: "Love",
      description: "Love, flirty, low stakes affection, cards for a crush",
      bgColor: "bg-red-100"
    },
    {
      icon: "/images/img_work_1.svg",
      title: "Work",
      description: "Grinding hard, take a break, card for coworker",
      bgColor: "bg-lime-100"
    },
    {
      icon: "/images/img_thank_you_1.svg",
      title: "Thank You",
      description: "Appreciation, you are amazing, legend cards",
      bgColor: "bg-green-100"
    },
    {
      icon: "/images/img_sorry_1.svg",
      title: "Sorry",
      description: "Apology cards",
      bgColor: "bg-purple-100"
    },
    {
      icon: "/images/img_irl_1.svg",
      title: "IRL",
      description: "Nice meeting you IRL",
      bgColor: "bg-yellow-100"
    },
    {
      icon: "/images/img_situationship_1.png",
      title: "Situationship",
      description: "It\'s complicated, almost worked, toxic love declaration, breakups",
      bgColor: "bg-orange-200"
    },
    {
      icon: "/images/img_degen_1.svg",
      title: "Degen",
      description: "Gaming, Stop FUD, It\'s FUD, WAGMI cards",
      bgColor: "bg-green-200"
    },
    {
      icon: "/images/img_fortune_1.svg",
      title: "Fortune",
      description: "Send a random greeting card with a happy daily fortune",
      bgColor: "bg-yellow-100"
    },
    {
      icon: "/images/img_motivation_1.svg",
      title: "Motivational",
      description: "Inspirational messages to uplift others",
      bgColor: "bg-red-200"
    },
    {
      icon: "/images/img_base_1.svg",
      title: "Exclusive Base",
      description: "Base projects offer greeting cards",
      bgColor: "bg-indigo-200"
    }
  ];

  return (
    <section className=" ">
    
      
       

<div className="flex flex-col items-center text-center bg-gradient-to-br from-slate-800 to-cyan-500 py-6 px-20 rounded-lg shadow-lg">
  <div>
    <span className="text-3xl font-medium text-white">Greeting Cards </span>
    <span className="text-4xl font-normal text-white" style={{ fontFamily: 'Patrick Hand' }}>
        (Meeps) 
    </span>
    <span className="text-3xl font-medium text-white">  Categories</span>
  </div>
  <p className="text-xl text-white mt-4 mb-4">
    Explore a category and send a Meep
  </p>
</div>

       
         
        <div className="max-w-6xl mx-auto text-center">
        <div className="py-16 px-4 bg-gradient-to-br">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="text-center">
              <div className={`${category.bgColor} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <img 
                  src={category.icon} 
                  alt={category.title} 
                  className="w-10 h-12"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {category.title}
              </h3>
              <p className="text-lg text-slate-800">
                {category.description}
              </p>
            </div>
          ))}
        </div>
        </div>
      </div>
      
    </section>
  );
};

export default CategoriesSection;