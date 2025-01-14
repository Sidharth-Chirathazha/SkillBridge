import React from 'react';
import { Star, Users } from 'lucide-react';
import tutor from '../../assets/images/tutor.jpg';


const tutors = [
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
  { avatar: tutor, name: 'Jane Doe', expertise: 'UI/UX Design', rating: 4.8, students: 120 },
];

const TopTutors = () => {
  return (
    <section id="tutors" className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-3 text-text">Top Rated Tutors</h2>
          <p className="text-lg text-text-400">
            Learn from the best instructors in their fields
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {tutors.map((tutor, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105  transition-trasnform duration-500 overflow-hidden group"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <img
                      src={tutor.avatar}
                      alt={tutor.name}
                      className="w-full h-full rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-secondary transition-colors duration-300">
                      {tutor.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{tutor.expertise}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{tutor.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{tutor.students} students</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopTutors;