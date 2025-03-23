import React, { useState } from 'react';
import { 
  BookOpen, Clock, User, Star, Heart, 
  ShoppingCart, Video, FileText, Lock, 
  Unlock, Award, ThumbsUp, Repeat
} from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import TradeModal from '../tutor/TradeModal';

const CourseDetail = ({ course, variant = 'student', onAction }) => {
  const isAdmin = variant === 'admin';
  const isTutor = variant === 'tutor';
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const StatusBadge = ({ status }) => (
    <span className={`px-4 py-1 rounded-full text-sm font-medium ${
      status === 'Approved' 
        ? 'bg-primary-100 text-primary-700' 
        : 'bg-secondary-100 text-secondary-700'
    }`}>
      {status}
    </span>
  );

  const StatItem = ({ icon: Icon, value, label }) => (
    <div className="flex items-center space-x-2 text-white/90">
      <div className="bg-white/20 p-2 rounded-full">
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">{value}</span>
        <span className="text-sm text-white/80">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-100">
      {/* Course Header Banner with gradient overlay */}
      <div className={`w-full ${isAdmin ? 'bg-gradient-to-r from-text-500 to-text-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Thumbnail with enhanced styling */}
            <div className="md:w-1/3">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full aspect-video rounded-xl shadow-lg object-cover border-4 border-white/30 hover:border-white/50 transition-all duration-300"
              />
            </div>

            {/* Course Info with improved typography and spacing */}
            <div className="md:w-2/3 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
                {isAdmin && <StatusBadge status={course.status} />}
              </div>

              {/* Tutor Info with improved styling */}
              <div className="flex items-center space-x-4 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <img
                  src={course.tutor.profile_pic}
                  alt={course.tutor.first_name}
                  className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-medium text-lg">
                    {course.tutor.first_name} {course.tutor.last_name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Award size={14} />
                    <span>Course Instructor</span>
                  </div>
                </div>
              </div>

              {/* Course Stats with improved layout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                <StatItem icon={Star} value={course.rating} label="Rating" />
                <StatItem icon={User} value={course.total_purchases} label="Students" />
                <StatItem icon={Clock} value={`${course.total_duration}`} label="Minutes" />
                <StatItem icon={BookOpen} value={course.total_modules} label="Modules" />
              </div>

              {/* Price or Admin Actions with improved button styling */}
              <div className="pt-6">
                {isAdmin ? (
                  <div className="flex flex-wrap gap-3">
                    <ConfirmDialog
                      trigger={(open) => (
                        <button
                          onClick={open}
                          className={`bg-primary-100 text-primary-700 px-6 py-3 rounded-lg font-medium hover:bg-primary-200 transition-colors shadow-sm ${
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
                      trigger={(open) => (
                        <button
                          onClick={open}
                          className={`bg-secondary-100 text-secondary-700 px-6 py-3 rounded-lg font-medium hover:bg-secondary-200 transition-colors shadow-sm ${
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
                      trigger={(open) => (
                        <button
                          onClick={open}
                          className="bg-background-200 text-text-700 px-6 py-3 rounded-lg font-medium hover:bg-background-300 transition-colors shadow-sm flex items-center gap-2"
                        >
                          {course.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                          {course.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      title={course.is_active ? "Deactivate" : "Activate"}
                      description={course.is_active ? 
                        `Are you sure you want to deactivate the course "${course.title}?"` :
                        `Are you sure you want to activate the course "${course.title}?"`}
                      confirmText={course.is_active ? "Deactivate" : "Activate"}
                      destructive={course.is_active}
                      onConfirm={() => onAction(course.is_active ? 'deactivate' : 'activate')}
                      variant='admin' 
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-2xl font-bold bg-white/20 px-4 py-2 rounded-lg">₹{course.price}</span>
                    {course.is_under_trade ? (
                      <button
                        disabled
                        className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed flex items-center gap-2 font-medium"
                      >
                        <Repeat size={18} />
                        Under Trade
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onAction('enroll')}
                          className="bg-secondary-500 text-white px-6 py-3 rounded-lg hover:bg-secondary-600 transition-colors flex items-center gap-2 font-medium shadow-md"
                        >
                          <ShoppingCart size={18} />
                          Enroll Now
                        </button>
                        {isTutor && (
                          <button
                            onClick={() => setIsTradeModalOpen(true)}
                            className="bg-secondary-500 text-white px-6 py-3 rounded-lg hover:bg-secondary-600 transition-colors flex items-center gap-2 font-medium shadow-md"
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

      {/* Main Content with improved card styling */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Course Details Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="md:col-span-2 space-y-10">
            {/* Description card */}
            <section className="bg-white rounded-xl shadow-sm p-6 border border-background-300 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-primary-600 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary-500" />
                About This Course
              </h2>
              <p className="text-text-600 leading-relaxed">{course.description}</p>
            </section>

            {/* Modules with improved cards */}
            <section className="bg-white rounded-xl shadow-sm p-6 border border-background-300 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-primary-600 mb-6 flex items-center gap-2">
                <BookOpen size={20} className="text-primary-500" />
                Course Content
              </h2>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <div 
                    key={module.id} 
                    className="border border-background-300 rounded-lg p-5 hover:shadow-md transition-all duration-300 bg-background-100 hover:bg-background-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                            {index + 1}
                          </span>
                          <h3 className="font-medium text-lg text-text-700">
                            {module.title}
                          </h3>
                        </div>
                        {isAdmin && (
                          <p className="text-text-500 text-sm pl-8">{module.description}</p>
                        )}
                      </div>
                      <span className="text-text-500 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Clock size={16} className="text-primary-500" />
                        {module.duration}min
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="mt-4 flex gap-4 pl-8">
                        <a 
                          href={module.video} 
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Video size={16} />
                          View Video
                        </a>
                        <a 
                          href={`${module.tasks}?response-content-disposition=attachment`} 
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <FileText size={16} />
                          Download Tasks
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Additional Info with improved card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-background-300 sticky top-6">
              <h3 className="text-lg font-semibold text-primary-600 mb-4 pb-2 border-b border-background-300">
                Course Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-600 p-3 bg-background-100 rounded-lg">
                  <Award size={18} className="text-primary-500" />
                  <span>Skill Level: <span className="font-medium">{course.skill_level}</span></span>
                </div>
                {/* Additional details could be displayed here */}
                <div className="bg-primary-50 rounded-lg p-4 mt-4 border-l-4 border-primary-500">
                  <h4 className="font-medium text-primary-700 mb-2">What You'll Learn</h4>
                  <p className="text-sm text-text-600">Complete, hands-on training with practical exercises and real-world applications.</p>
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