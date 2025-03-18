import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi, { object } from 'joi';
import { Upload, PlusCircle, Loader } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addCourse, addModule, fetchCategories, fetchModules, 
  fetchSingleCourse, updateCourse, updateModule, deleteModule, 
  fetchTutorCourses} from '../../redux/slices/courseSlice';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ui/ConfirmDialog';
import TutorVerificationMessage from '../../components/tutor/TutorVerificationMessage';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TASK_SIZE = 5 * 1024 * 1024; // 5MB

const CourseCreation = () => {
  const {courseId: urlCourseId} = useParams();
  const isEditMode = !!urlCourseId;
  const [tabIndex, setTabIndex] = useState(0);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [isEditing, setIsEditing] = useState(!isEditMode); // Enabled by default in create mode
  const [isEditingModule, setIsEditingModule] = useState(false);
  const { categoriesData, singleCourse, modulesData, isCourseLoading, isModuleLoading } = useSelector((state) => state.course);
  const {userData} = useSelector((state)=>state.auth);
  const tutorId = userData?.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("Categories in course creation", categoriesData);
  
  const courseSchema = Joi.object({
    title: Joi.string().min(1).required().messages({
      'string.empty': 'Title is required',
    }),
    description: Joi.string().min(1).required().messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 1 character'
    }),
    thumbnail: isEditMode 
    ? Joi.any().optional()
      : Joi.any().required()
      .custom((value, helpers) => {
        if (value.size > MAX_FILE_SIZE) return helpers.error('file.size');
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(value.type)) {
          return helpers.error('file.type');
        }
        return value;
      })
      .messages({
        'file.size': 'Thumbnail must be less than 2MB',
        'file.type': 'Invalid image format (allowed: jpg, png, webp)',
        'any.required': 'Thumbnail is required'
      }),
    skill_level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required().messages({
      'any.only': 'Select a valid skill level',
      'any.required': 'Skill level is required'
    }),
    price: Joi.number().min(1).required().messages({
      'number.min': 'Price must be at least 1',
      'number.base': 'Price must be a number',
      'any.required': 'Price is required'
    }),
    category: Joi.string().required().messages({
      'string.empty': 'Category is required'
    })
  });
  
  const moduleSchema = Joi.object({
    title: Joi.string().min(1).required().messages({
      'string.empty': 'Module title is required',
      'string.min': 'Module title must be at least 1 character'
    }),
    description: Joi.string().min(1).required().messages({
      'string.empty': 'Module description is required',
      'string.min': 'Module description must be at least 1 character'
    }),
    video: editingModuleId ?
      Joi.any().optional()
      : Joi.any().required()
      .custom((value, helpers) => {
        if (value.size > MAX_VIDEO_SIZE) return helpers.error('file.size');
        if (!['video/mp4', 'video/webm', 'video/ogg'].includes(value.type)) {
          return helpers.error('file.type');
        }
        return value;
      })
      .messages({
        'file.size': 'Video must be less than 10MB',
        'file.type': 'Invalid video format (allowed: mp4, webm, ogg)',
        'any.required': 'Video is required'
      }),
    duration:editingModuleId ?
    Joi.any().optional() : Joi.any().required().messages({
      'string.empty': 'Duration is required'
    }),
    tasks:  editingModuleId ?
    Joi.any().optional()
    : Joi.any()
      .required()
      .custom((value, helpers) => {
        if (value.size > MAX_TASK_SIZE) return helpers.error('file.size');
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(value.type)) {
          return helpers.error('file.type');
        }
        return value;
      })
      .messages({
        'file.size': 'Task document must be less than 5MB',
        'file.type': 'Invalid document format (allowed: pdf, doc, docx)',
        'any.required': 'Tasks document is required'
      })
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(()=>{
    
    if(urlCourseId){
      dispatch(fetchSingleCourse({id:urlCourseId, user:true}));
      
      dispatch(fetchModules(urlCourseId));
    }
  },[urlCourseId])


  const { 
    control: courseControl,
    handleSubmit: handleCourseSubmit,
    formState: { errors: courseErrors },
    watch: watchCourse,
    setValue: setCourseValue
  } = useForm({
    resolver: joiResolver(courseSchema)
  });

  const { 
    control: moduleControl,
    handleSubmit: handleModuleSubmit,
    formState: { errors: moduleErrors },
    reset: resetModuleForm,
    setValue: setModuleValue,
    watch: watchModule
  } = useForm({
    resolver: joiResolver(moduleSchema)
  });

  useEffect(()=>{
    if (isEditMode && singleCourse){
      setCourseValue('title', singleCourse.title);
      setCourseValue('description', singleCourse.description);
      setCourseValue('skill_level', singleCourse.skill_level);
      setCourseValue('price', singleCourse.price);
      setCourseValue('category', singleCourse.category?.id);
    }
  }, [singleCourse, isEditMode, setCourseValue]);

  // const handleEditModule = (module) => {
  //   setEditingModuleId(module.id);
  //   setModuleValue('title', module.title);
  //   setModuleValue('description', module.description);
  //   setModuleValue('duration', module.duration);
  //   // Note: Files can't be set programmatically
  // };

  const handleTabChange = (newValue) => {
    if (newValue === 1 && !urlCourseId) return;
    setTabIndex(newValue);
  };

  const submitCourse = async (data) => {
    try{
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) =>{
        if (key === 'thumbnail' && value instanceof File){
          formData.append(key, value);
        }else if (key !== 'thumbnail'){
          formData.append(key, value)
        }
      });

      console.log("Inside the course creation submit course, formData:");

      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
    
      if(isEditMode){
        console.log(urlCourseId);
        
        await dispatch(updateCourse({id: urlCourseId, updateData: formData})).unwrap();
        setIsEditing(false);
        await dispatch(fetchTutorCourses({tutorId,page:1, pageSize:8}));
        toast.success('Course updated successfully!');
      }else{
        const response = await dispatch(addCourse(formData)).unwrap();
        console.log("Inside course createtion tesing response:", response);
        
        navigate(`/tutor/teaching/edit/${response.id}`)
        await dispatch(fetchTutorCourses({tutorId, page:1, pageSize:8}));
        toast.success('Course created successfully!');
      }
    }catch(error){
      toast.error(error.message || 'Operation failed');
    }
  };

  const submitModule = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) =>{
        if (key !== 'video' && key !== 'tasks') formData.append(key, value);
      });

      if(data.video instanceof File){
        formData.append('video', data.video);
      }

      if(data.tasks instanceof File){
        formData.append('tasks', data.tasks);
      }

      formData.append('course', urlCourseId);

      if (editingModuleId){
        await dispatch(updateModule({
          id : editingModuleId,
          updateData : formData
        })).unwrap();
      }else{
        await dispatch(addModule(formData)).unwrap();
      }

      dispatch(fetchModules(urlCourseId));
      resetModuleForm();
      setEditingModuleId(null);
      toast.success(`Module ${editingModuleId ? 'updated' : 'added'}!`);
    }catch(error){
      toast.error(error.message || 'Module operation failed');
    }
  };

  // const handleDeleteModule = async(moduleId) =>{
  //   try{
  //     await dispatch(deleteModule(moduleId)).unwrap();
  //     dispatch(fetchModules(urlCourseId));
  //     setEditingModuleId(null);
  //     toast.success("Module deleted successfully")
  //   }catch(error){
  //     toast.error("Error while deleting module")
  //   }
  // }


  const FormInput = ({ label, name, control, error, type = 'text', className = '', as = 'input' }) => (
    <div className={`relative ${className}`}>
      <label className={`text-xs text-gray-600 ${error ? 'text-red-500' : ''}`}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          as === 'textarea' ? (
            <textarea
              {...field}
              disabled={!isEditing}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                error ? 'border-red-500' : 'border-text-200'
              } focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                !isEditing ? 'bg-text-50' : ''
              }`}
              rows={3}
            />
          ) : (
            <input
              {...field}
              type={type}
              disabled={!isEditing}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                error ? 'border-red-500' : 'border-text-200'
              } focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                !isEditing ? 'bg-text-50' : ''
              }`}
            />
          )
        )}
      />
      {error && (
        <span className="text-red-500 text-xs mt-1">{error.message}</span>
      )}
    </div>
  );

  return (
    <>
    {userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) :(
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div className="mb-2 sm:mb-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              {isEditMode ? 'Edit Course' : 'Create Course'}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    {isEditMode ? 'Update your course details' : 'Create a new course'}
                </p>
          </div>
          {isEditMode && (
            <button
              onClick={()=> setIsEditing(!isEditing)}
              className={`w-full sm:w-auto px-4 py-2 text-sm rounded-lg border-2 transition-colors ${
                isEditing 
                  ? 'bg-text-50 text-text-600 hover:bg-text-100'
                  : 'bg-secondary-500 text-white hover:bg-secondary-600'
              }`}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Course'}
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-1 mb-4 sm:border-b sm:border-gray-200">
            <button
              onClick={() => handleTabChange(0)}
              className={`py-2 px-3 text-xs sm:text-sm text-center ${
                tabIndex === 0 
                  ? 'border-b-2 border-secondary-500 text-secondary-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 sm:border-b-0'
              }`}
            >
              Course Details
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`py-2 px-3 text-xs sm:text-sm text-center ${
                tabIndex === 1 
                  ? 'border-b-2 border-secondary-500 text-secondary-600 font-semibold'
                  : `text-gray-500 ${!urlCourseId ? 'cursor-not-allowed' : 'hover:text-gray-700 sm:border-b-0'}`
              }`}
              disabled={!urlCourseId}
            >
              Modules
            </button>
          </div>

          {tabIndex === 0 && (
            <form onSubmit={handleCourseSubmit(submitCourse)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-4">
                  <FormInput
                    label="Course Title"
                    name="title"
                    control={courseControl}
                    error={courseErrors.title}
                    className="col-span-full"
                  />

                  <FormInput
                    label="Course Description"
                    name="description"
                    control={courseControl}
                    error={courseErrors.description}
                    as="textarea"
                    className="col-span-full"
                  />

                  <div className="relative">
                    <label className="text-xs text-gray-600">Category</label>
                    <Controller
                      name="category"
                      control={courseControl}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 rounded-lg border border-text-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                          disabled={!isEditing}
                        >
                          <option value="">Select Category</option>
                          {categoriesData.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {courseErrors.category && (
                      <span className="text-red-500 text-xs mt-1">{courseErrors.category.message}</span>
                    )}
                  </div>
                </div>
                
                <div className='space-y-4'>
                  <div className="relative">
                    <label className="text-xs text-gray-600">Skill Level</label>
                    <Controller
                      name="skill_level"
                      control={courseControl}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 rounded-lg border border-text-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                          disabled={!isEditing}
                        >
                          <option value="">Select Skill Level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      )}
                    />
                    {courseErrors.skill_level && (
                      <span className="text-red-500 text-xs mt-1">{courseErrors.skill_level.message}</span>
                    )}
                  </div>
            

                  <FormInput
                    label="Price"
                    name="price"
                    control={courseControl}
                    error={courseErrors.price}
                    type="number"
                  />

                  <div className="relative">
                    <label className="text-xs text-gray-600">Thumbnail</label>
                    <Controller
                      name="thumbnail"
                      control={courseControl}
                      render={({ field }) => (
                        <label className={`w-full flex flex-col items-center px-4 py-4 bg-white rounded-lg border-2 border-dashed ${
                          isEditing ? 'border-text-200 cursor-pointer hover:border-secondary-500' : 'border-text-100'
                        } transition-colors`}>
                          {field.value ? (
                            <img 
                              src={typeof field.value === 'string' 
                                ? field.value 
                                : URL.createObjectURL(field.value)
                              } 
                              className="preview-image" 
                            />
                          ) : (
                            <div className="upload-placeholder">
                              <Upload />
                              <span>Upload Thumbnail</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={!isEditing}
                            onChange={(e) => {
                              field.onChange(e.target.files[0]);
                            }}
                          />
                        </label>
                      )}
                    />
                    {courseErrors.thumbnail && (
                      <span className="text-red-500 text-xs mt-1">{courseErrors.thumbnail.message}</span>
                    )}
                  </div>
                </div>
              </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm"
                  >
                    {isCourseLoading ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                      </>
                    ) : (
                      isEditing ? 'Save Changes' : 'Create Course'
                    )}
                  </button>
                </div>
                )}
            </form>
          )}

          {tabIndex === 1 && (
            <div className="space-y-4">
              <form onSubmit={handleModuleSubmit(submitModule)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Module Title"
                    name="title"
                    control={moduleControl}
                    error={moduleErrors.title}
                  />

                  <FormInput
                    label="Module Description"
                    name="description"
                    control={moduleControl}
                    error={moduleErrors.description}
                    as="textarea"
                  />

                  <FormInput
                    label="Duration"
                    name="duration"
                    control={moduleControl}
                    error={moduleErrors.duration}
                  />
                  <div className='space-y-4'>
                    <div className="relative">
                      <label className="text-xs text-gray-600">Video</label>
                      <Controller
                        name="video"
                        control={moduleControl}
                        render={({ field }) => (
                          <label className={`w-full flex flex-col items-center px-4 py-4 bg-white rounded-lg border-2 border-dashed ${
                            isEditing ? 'border-text-200 cursor-pointer hover:border-secondary-500' : 'border-text-100'
                          } transition-colors`}>
                            <Upload className="w-5 h-5 mb-2 text-gray-600" />
                            <span className="text-xs truncate max-w-[200px]">
                              {watchModule('video')?.name || 'Upload Video'}
                            </span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              disabled={!isEditing}
                              onChange={(e) => {
                                field.onChange(e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                      />
                      {moduleErrors.video && (
                        <span className="text-red-500 text-xs mt-1">{moduleErrors.video.message}</span>
                      )}
                    </div>

                    <div className="relative">
                      <label className="text-xs text-gray-600">Tasks Document</label>
                      <Controller
                        name="tasks"
                        control={moduleControl}
                        render={({ field }) => (
                          <label className={`w-full flex flex-col items-center px-4 py-4 bg-white rounded-lg border-2 border-dashed ${
                            isEditing ? 'border-text-200 cursor-pointer hover:border-secondary-500' : 'border-text-100'
                          } transition-colors`}>
                            <Upload className="w-5 h-5 mb-2 text-gray-600" />
                            <span className="text-xs truncate max-w-[200px]">
                              {watchModule('tasks')?.name || 'Upload Tasks Document'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              disabled={!isEditing}
                              onChange={(e) => {
                                field.onChange(e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                      />
                      {moduleErrors.tasks && (
                        <span className="text-red-500 text-xs mt-1">{moduleErrors.tasks.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* {isEditing && ( */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm"
                    disabled={isModuleLoading || !isEditing}
                  >
                    {isModuleLoading ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                      </>
                    ) : (
                      isEditingModule ? "Update Module" : "Add Module"
                    )}
                  </button>
                </div>
                {/* )} */}
            </form>

              {/* Module List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modulesData?.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                    No modules added yet
                  </div>
                ) : (
                  modulesData?.map((module) => (
                    <div
                      key={module.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-secondary-300 transition-all"
                    >
                      {/* Module Title */}
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {module.title}
                      </h3>

                      {/* Module Description */}
                      <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                        {module.description}
                      </p>

                      {/* Module Duration */}
                      <p className="text-xs text-gray-500 mt-2">
                        Duration: {module.duration} mins
                      </p>

                      {/* Video Preview */}
                      {module.video && (
                        <div className="mt-2">
                          <video
                            src={module.video instanceof File ? URL.createObjectURL(module.video) : module.video}
                            controls
                            className="w-full rounded-lg"
                          />
                        </div>
                      )}


                      {/* Tasks Document Preview */}
                      {module.tasks && (
                        <div className="mt-2">
                          {module.tasks.type === 'application/pdf' ? (
                            <iframe
                              src={module.tasks instanceof File ? URL.createObjectURL(module.tasks) : module.tasks}
                              className="w-full h-40 rounded-lg border border-gray-200"
                              title="Tasks Document"
                            />
                          ) : (
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-gray-600">
                                {module.tasks instanceof File ? module.tasks.name : 'Tasks Document'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Edit/Cancel Actions (Visible in Edit Mode) */}
                      {isEditMode && (
                        <div className="flex gap-2 mt-3 justify-end">
                          <button
                           disabled={!isEditing}
                            onClick={() => {
                              if (isEditingModule && editingModuleId === module.id) {
                                // Cancel editing
                                setIsEditingModule(false);
                                setEditingModuleId(null);
                                resetModuleForm();
                              } else {
                                // Start editing
                                setIsEditingModule(true);
                                setEditingModuleId(module.id);
                                setModuleValue('title', module.title);
                                setModuleValue('description', module.description);
                                setModuleValue('duration', module.duration);
                                setModuleValue('video', module.video);
                                setModuleValue('tasks', module.tasks);
                              }
                            }}
                            className={`text-xs ${
                              isEditingModule && editingModuleId === module.id
                                ? 'text-secondary-600 hover:text-secondary-700'
                                : 'text-primary-600 hover:text-primary-700'
                            }`}
                          >
                            {isEditingModule && editingModuleId === module.id ? 'Cancel' : 'Edit'}
                          </button>
                          {/* <ConfirmDialog
                            trigger={(open) => (
                              <button
                                onClick={open}
                                className="text-secondary-600 hover:text-secondary-700 text-xs"
                              >
                                Delete
                              </button>
                            )}
                            title="Delete Module"
                            description={`Are you sure you want to delete the module "${module.title}"? This action cannot be undone.`}
                            confirmText="Delete"
                            destructive
                            onConfirm={() => handleDeleteModule(module.id)}
                            variant="user"
                          /> */}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default CourseCreation;