import { Star, Edit, Trash, Clock, BookOpen, Shield, UserCheck, XCircle, CheckCircle, LayoutGrid, Users } from 'lucide-react';

const ManagementCourseCard = ({ 
  course, 
  variant = 'tutor', 
  onEdit, 
  onDelete, 
  onManage 
}) => {
  const statusConfig = {
    Approved: { icon: <CheckCircle size={16} />, color: 'bg-green-100 text-green-800' },
    Pending: { icon: <Clock size={16} />, color: 'bg-yellow-100 text-yellow-800' },
    Declined: { icon: <XCircle size={16} />, color: 'bg-red-100 text-red-800' }
  };

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col group`}
    >
      {/* Thumbnail Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img
          src={course.thumbnail || "/api/placeholder/400/250"}
          alt={course.title}
          className="w-full aspect-video object-cover"
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full z-20">
          <div className={`flex items-center text-sm ${statusConfig[course.status].color}`}>
            {statusConfig[course.status].icon}
            <span className="ml-1 capitalize">{course.status}</span>
          </div>
        </div>

        {variant === 'tutor' && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-secondary/90 text-white text-xs font-medium rounded-full z-20">
            {course.skill_level}
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5 pt-8 flex-1 flex flex-col">
        {/* Category */}
        <div className="flex items-center gap-2 text-secondary text-sm font-medium mb-2">
          <LayoutGrid className="w-4 h-4" />
          <span>{course.category_details?.name || "Uncategorized"}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-3 text-text line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm text-text-400 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.total_purchases || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.total_duration || 0}min</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.total_modules || 0}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= (course.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-sm font-medium ml-1">{course.rating || 0}</span>
          <span className="text-xs text-text-400 ml-1">({course.total_reviews || 0})</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {variant === 'tutor' ? (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(course.id)}
                className="flex-1 flex items-center justify-center bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-600 transition-colors"
              >
                <Edit size={18} className="mr-2" />
                <span>Edit</span>
              </button>
              
            </div>
          ) : (
            <button
              onClick={() => onManage(course.id)}
              className="w-full flex items-center justify-center bg-text-500 text-white px-4 py-2 rounded-full hover:bg-text-700 transition-colors"
            >
              <Shield size={18} className="mr-2" />
              <span>Manage Course</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementCourseCard;