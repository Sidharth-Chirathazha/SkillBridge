import React, { useState } from 'react';
import { Heart, Users, Clock, Star } from 'lucide-react';
import developer_img from '../../assets/images/developer_img.jpg';
import tutor from '../../assets/images/tutor.jpg';

const courses = [
  {
    id: 1,
    title: "Build Responsive Websites with HTML",
    category: "Personalized Learning",
    image: developer_img,
    tutorAvatar: tutor,
    students: 450,
    duration: "6hr 30min",
    price: 2000,
    originalPrice: 4500,
  },
  {
    id: 2,
    title: "The Complete Web Developer PHP Course",
    category: "Python Development",
    image: developer_img,
    tutorAvatar: tutor,
    students: 500,
    duration: "6hr 30min",
    price: 3000,
    originalPrice: 4000,
  },
  {
    id: 3,
    title: "The Complete Business Management Course",
    category: "Business Management",
    image: developer_img,
    tutorAvatar: tutor,
    students: 400,
    duration: "6hr 30min",
    price: 1500,
    originalPrice: 3500,
  },
  {
    id: 4,
    title: "Build Creative Arts & media Course Completed",
    category: "Creative Arts & media",
    image: developer_img,
    tutorAvatar: tutor,
    students: 250,
    duration: "6hr 30min",
    price: 1000,
    originalPrice: 3000,
  },
];

const categories = ['All', 'Most popular', 'Business', 'Design', 'Music', 'Programming', 'Database'];

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-text mb-3">Popular Courses</h2>
          <p className="text-lg text-text-400">
            Explore our most popular courses and enhance your skills
          </p>
        </div>

        {/* Categories Filter */}
        {/* <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'text-text-400 hover:text-text'
              }`}
            >
              {category}
            </button>
          ))}
        </div> */}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transform hover:scale-105  transition-trasnform duration-500 flex flex-col"
            >
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
                {/* <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button> */}
                <div className="absolute bottom-0 translate-y-1/2 left-4">
                  <img
                    src={course.tutorAvatar}
                    alt="Tutor"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                </div>
              </div>

              <div className="p-4 pt-8 flex-1 flex flex-col">
                <div className="text-secondary text-sm font-medium mb-2">
                  {course.category}
                </div>
                <h3 className="font-semibold text-base mb-2 text-text line-clamp-2">
                  {course.title}
                </h3>
                
                <div className="flex items-center gap-3 text-sm text-text-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-secondary">
                      ₹{course.price}
                    </span>
                    <span className="text-sm text-text-400 line-through">
                      ₹{course.originalPrice}
                    </span>
                  </div>
                  <button className="px-3 py-1.5 bg-primary text-white text-sm rounded-full hover:bg-secondary transition-colors duration-300">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;