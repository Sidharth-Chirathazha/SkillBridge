import React, { useRef } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import business_img from '../../assets/images/business_img.jpg';
import communication_img from '../../assets/images/communication_img.jpg';
import design_img from '../../assets/images/design_img.jpg';
import health_img from '../../assets/images/health_img.jpeg';
import developer_img from '../../assets/images/developer_img.jpg';

const categories = [
  {
    icon: "📚",
    title: "Development",
    description: "Learn coding and more.",
    image: developer_img
  },
  {
    icon: "🎨",
    title: "Design",
    description: "Creative design skills.",
    image: design_img
  },
  {
    icon: "📈",
    title: "Business",
    description: "Master business strategies.",
    image: business_img
  },
  {
    icon: "🧘‍♀️",
    title: "Health & Wellness",
    description: "Improve your health.",
    image: health_img
  },
  {
    icon: "🎧",
    title: "Music",
    description: "Learn musical skills.",
    image: business_img
  },
  {
    icon: "💼",
    title: "Career",
    description: "Advance your career.",
    image: communication_img
  },
];

const TopCategories = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section id="categories" className="py-16 bg-background">
      <div className="container mx-auto px-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-3 text-text">Top Categories</h2>
          <p className="text-lg text-text-400">
            Explore our diverse range of categories to find what inspires you.
          </p>
        </div>

        <div className="relative px-4">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-8 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <IoIosArrowBack size={24} className="text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide no-scrollbar p-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <div
                key={index}
                className="min-w-[300px] h-[400px] flex-shrink-0 snap-start rounded-xl  overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white group flex flex-col"
              >
                <div className="relative w-full h-[200px]">
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-secondary transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-8 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full  hover:bg-gray-100   transition-colors duration-200"
          >
            <IoIosArrowForward size={24} className="text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopCategories;



