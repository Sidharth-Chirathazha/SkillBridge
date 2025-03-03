import { Star, Edit, Trash, Clock, BookOpen, Shield, UserCheck, XCircle, CheckCircle } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

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
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden">
      {/* Thumbnail Section */}
      <div className="relative">
        <img
          src={course.thumbnail || '/default-thumbnail.jpg'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {variant === 'tutor' && (
          <div className="absolute top-2 left-2 bg-primary-400 text-white px-3 py-1 rounded-full text-xs font-medium">
            {course.skill_level}
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className={`flex items-center text-sm px-2 py-1 rounded ${statusConfig[course.status].color}`}>
            {statusConfig[course.status].icon}
            <span className="ml-1 capitalize">{course.status}</span>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-bold text-text-900 text-lg mb-2 truncate">
          {course.title}
        </h3>

        {/* Tutor/Admin Info */}
        <div className="flex items-center mb-4">
          {variant === 'admin' ? (
            <>
              <UserCheck size={20} className="text-gray-600 mr-2" />
              <span className="text-sm text-text-400 truncate">
              {course.tutor?.first_name && course.tutor?.last_name 
              ? `${course.tutor.first_name} ${course.tutor.last_name}`
              : 'Unknown Tutor'}
              </span>
            </>
          ) : (
            <div className="flex items-center">
              <Shield size={20} className="text-gray-600 mr-2" />
              <span className="text-sm text-text-400">
                ₹{course.price || '0'}
              </span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
            <Star size={16} className="text-yellow-500 mr-1" />
            <span className="text-sm font-medium text-text-500">
              {course.rating || '4.5'}
            </span>
          </div>
          <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
            <BookOpen size={16} className="text-text-500 mr-1" />
            <span className="text-sm">{course.total_modules || '0'}</span>
          </div>
          <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
            <Clock size={16} className="text-text-500 mr-1" />
            <span className="text-sm">{course.total_duration || '0'}min</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          {variant === 'tutor' ? (
            <>
              <button
                onClick={() => onEdit(course.id)}
                className="flex-1 flex items-center justify-center bg-primary-100 text-primary-500 hover:bg-primary-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Edit size={18} className="mr-2" />
                <span>Edit</span>
              </button>
              {/* <ConfirmDialog
                    trigger={(open) =>(
                      <button
                        onClick={open}
                        className="flex-1 flex items-center justify-center bg-secondary-100 text-secondary-600 hover:bg-secondary-200 px-4 py-2 rounded-lg transition-colors"
                        >
                       <Trash size={18} className="mr-2" />
                       <span>Delete</span>
                      </button>
                    )}
                    title="Delete Course"
                    description={`Are you sure you want to delete the course "${course.title}?
                    This action cannot be undone."`}
                    confirmText='Delete'
                    destructive
                    onConfirm={()=> onDelete(course.id)}
                    variant='user' 
              /> */}
            </>
          ) : (
            <button
              onClick={() => onManage(course.id)}
              className="w-full flex items-center justify-center bg-text-100 text-text-600 hover:bg-text-200 px-4 py-2 rounded-lg transition-colors"
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