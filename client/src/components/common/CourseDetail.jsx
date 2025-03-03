import React, { useState } from 'react';
import { 
  BookOpen, Clock, User, Star, Heart, 
  ShoppingCart, Video, FileText, Lock, 
  Unlock, Award, ThumbsUp , Repeat
} from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import TradeModal from '../tutor/TradeModal';


const CourseDetail = ({ course, variant = 'student', onAction }) => {
  const isAdmin = variant === 'admin';
  const isTutor = variant === 'tutor';

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // console.log("Course data in course detail:", course);
  

  const StatusBadge = ({ status }) => (
    <span className={`px-3 py-1 rounded-full text-sm ${
      status === 'Approved' 
        ? 'bg-primary-100 text-primary-700' 
        : 'bg-secondary-100 text-secondary-700'
    }`}>
      {status}
    </span>
  );

  const StatItem = ({ icon: Icon, value, label }) => (
    <div className="flex items-center space-x-2 text-text-200">
      <Icon size={18} className="text-text-100" />
      <span>{value} {label}</span>
    </div>
  );

  

  return (
    <div className="min-h-screen bg-background-100">
      {/* Course Header Banner */}
      <div className={`w-full ${isAdmin ? 'bg-text-500' : 'bg-primary-500'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Thumbnail */}
            <div className="md:w-1/3">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full aspect-video rounded-xl shadow-lg object-cover"
              />
            </div>

            {/* Course Info */}
            <div className="md:w-2/3 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-3xl font-bold">{course.title}</h1>
                {isAdmin && <StatusBadge status={course.status} />}
              </div>

              {/* Tutor Info */}
              <div className="flex items-center space-x-3">
                <img
                  src={course.tutor.profile_pic}
                  alt={course.tutor.first_name}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div>
                  <p className="font-medium">
                    {course.tutor.first_name} {course.tutor.last_name}
                  </p>
                  <p className="text-sm text-white/80">Course Instructor</p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <StatItem icon={Star} value={course.rating} label="Rating" />
                <StatItem icon={User} value={course.total_purchases} label="Students" />
                <StatItem icon={Clock} value={`${course.total_duration}min`} label="Duration" />
                <StatItem icon={BookOpen} value={course.total_modules} label="Modules" />
              </div>

              {/* Price or Admin Actions */}
              <div className="pt-4">
                {isAdmin ? (
                  <div className="flex flex-wrap gap-3">
                    <ConfirmDialog
                          trigger={(open) =>(
                            <button
                              onClick={open}
                              className={`bg-primary-100 text-primary-700 px-4 py-2 rounded hover:bg-primary-200 ${
                                course.status === "Approved" ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              disabled={course.status === "Approved"}
                            >
                              Approve
                            </button>
                          )}
                          title="Approve Course"
                          description={`Are you sure you want to approve the course "${course.title}?"`}
                          confirmText='Approve'
                          onConfirm={() => onAction('Approve')}
                          variant='admin' 
                    />
                   <ConfirmDialog
                          trigger={(open) =>(
                            <button
                              onClick={open}
                              className={`bg-secondary-100 text-secondary-700 px-4 py-2 rounded hover:bg-secondary-200 ${
                                course.status === "Approved" ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              disabled={course.status === "Approved"}
                            >
                              Decline
                            </button>
                          )}
                          title="Decline Course"
                          description={`Are you sure you want to decline the course "${course.title}?"`}
                          confirmText='Decline'
                          destructive
                          onConfirm={() => onAction('Decline')}
                          variant='admin' 
                    />
                    <ConfirmDialog
                        trigger={(open) =>(
                          <button
                            onClick={open}
                            className="bg-background-200 text-text-700 px-4 py-2 rounded hover:bg-background-300 flex items-center gap-2"
                          >
                            {course.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                            {course.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        title={course.is_active ? "Deactivate" : "Activate"}
                        description={course.is_active? `Are you sure you want to deactivate the course "${course.title}?"`
                        :`Are you sure you want to activate the course "${course.title}?"`}
                        confirmText={course.is_active?"Deactivate":"Activate"}
                        destructive={course.is_active}
                        onConfirm={() => onAction(course.is_active ? 'deactivate' : 'activate')}
                        variant='admin' 
                  />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                  <span className="text-xl font-bold">₹{course.price}</span>
                  {course.is_under_trade ? (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded cursor-not-allowed flex items-center gap-2"
                    >
                      <Repeat size={18} />
                      Under Trade
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onAction('enroll')}
                        className="bg-secondary-500 text-white px-6 py-2 rounded hover:bg-secondary-600 flex items-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Enroll Now
                      </button>
                      {isTutor && (
                        <button
                          onClick={() => setIsTradeModalOpen(true)}
                          className="bg-secondary-500 text-white px-6 py-2 rounded hover:bg-secondary-600 flex items-center gap-2"
                        >
                          <Repeat size={18} />
                          Trade
                        </button>
                      )}
                    </>
                  )}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Details Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-text-700 mb-4">About This Course</h2>
              <p className="text-text-600 leading-relaxed">{course.description}</p>
            </section>

            {/* Modules */}
            <section>
              <h2 className="text-xl font-semibold text-text-700 mb-4">Course Content</h2>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <div key={module.id} 
                    className="border border-background-300 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-medium text-lg text-text-700">
                          {index + 1}. {module.title}
                        </h3>
                        {isAdmin && (
                          <p className="text-text-500 text-sm">{module.description}</p>
                        )}
                      </div>
                      <span className="text-text-500 flex items-center gap-2">
                        <Clock size={16} />
                        {module.duration}min
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="mt-4 flex gap-4">
                        <a href={module.video} 
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                          <Video size={16} />
                          Video
                        </a>
                        <a href={`${module.tasks}?response-content-disposition=attachment`} 
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                          <FileText size={16} />
                          Tasks
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-background-300">
              <h3 className="text-lg font-semibold text-text-700 mb-4">Course Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-600">
                  <Award size={18} className="text-primary-500" />
                  <span>Skill Level: {course.skill_level}</span>
                </div>
                <div className="flex items-center gap-3 text-text-600">
                  <ThumbsUp size={18} className="text-primary-500" />
                  <span>Total Likes: {course.modules.reduce((sum, module) => sum + module.likes_count, 0)}</span>
                </div>
                <div className="flex items-center gap-3 text-text-600">
                  <Heart size={18} className="text-primary-500" />
                  <span>Engagement Rate: {((course.rating / 5) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        closeModal={() => setIsTradeModalOpen(false)}
        requestedCourseData={course}
      />
    </div>
  );
};

export default CourseDetail;