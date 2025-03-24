import React, { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { Upload, PlusCircle, Trash2, FileText, Edit, ChevronLeft, ChevronRight, Loader2} from 'lucide-react';
import { fetchSkills, fetchUser, updateUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import FormInput from '../../components/common/ui/FormInput';
import avatar2 from '../../assets/images/avatar2.jpg'


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_RESUME_TYPES = ['application/pdf', 'application/msword'];

const schema = Joi.object({
    user: Joi.object({
      first_name: Joi.string().min(2).regex(/^[A-Za-z]+$/).required().messages({
        'string.min': 'First name must be at least 2 characters',
        'string.empty': 'First name is required',
        'string.pattern.base': 'First name should only contain alphabets'
      }),
      last_name: Joi.string().min(1).regex(/^[A-Za-z]+$/).required().messages({
        'string.min': 'Last name is required',
        'string.empty': 'Last name is required',
        'string.pattern.base': 'First name should only contain alphabets'
      }),
      phone: Joi.string().regex(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Invalid phone number'
      }),
      linkedin_url: Joi.string().uri().regex(/linkedin.com/).optional().messages({
        'string.uri': 'Invalid LinkedIn URL',
        'string.pattern.base': 'URL must be from LinkedIn'
      }),
      bio: Joi.string().min(50).required().messages({
        'string.min': 'Bio must be at least 50 characters',
        'string.empty': 'Bio is required'
      }),
      country: Joi.string().required().messages({
        'string.empty': 'Country is required'
      }),
      city: Joi.string().required().messages({
        'string.empty': 'City is required'
      }),
      skills: Joi.array().items(Joi.number()).min(1).required().messages({
        'array.min': 'Select at least one skill'
      })
    }).unknown(true).required(),

    cur_job_role: Joi.string().required().messages({
      'string.empty': 'Current job role is required'
    }),
    educations: Joi.array().items(
      Joi.object({
        id: Joi.number().allow(null).optional(),
        university: Joi.string().required(),
        degree: Joi.string().required(),
        year_of_passing: Joi.number().integer()
        .min(1900)
        .max(new Date().getFullYear())
        .required()
        .messages({
          'number.base': 'Year must be a number',
          'number.integer': 'Year must be a whole number',
          'number.min': 'Year must be 1900 or later',
          'number.max': `Year cannot be in the future`,
          'any.required': 'Year of passing is required'
        })
      })
    ),
    work_experiences: Joi.array().items(
      Joi.object({
        id: Joi.number().allow(null).optional(),
        company: Joi.string().required(),
        job_role: Joi.string().required(),
        date_of_joining: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
          'string.pattern.base': 'Use YYYY-MM-DD format for date'
        }),
        date_of_leaving: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
          'string.pattern.base': 'Use YYYY-MM-DD format for date'
        })
      })
    ),
    profile_pic: Joi.any().optional(),
    resume: Joi.any().optional()
  });


const TutorProfile = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [filePreviews, setFilePreviews] = useState({ profile_pic: null, resume: null });
    const { userData, skillsData , isLoading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
  
    const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm({
      resolver: joiResolver(schema),
      defaultValues: {
        user: { ...userData?.user, skills: userData?.user?.skills || [] },
        cur_job_role: userData?.cur_job_role || '',
        educations: userData?.educations || [],
        work_experiences: userData?.work_experiences || []
      },
      shouldUnregister: false
    });
  
    const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
      control,
      name: 'educations'
    });
  
    const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
      control,
      name: 'work_experiences'
    });
  
    useEffect(() => {
      dispatch(fetchUser());
      dispatch(fetchSkills({ skillPage: 1, pageSize: 100 }));
    }, [dispatch]);
  
    useEffect(() => {
      if (userData && !isEditMode) {
        // Filter user object to only include schema-defined fields
        const filteredUser = {
          first_name: userData.user.first_name,
          last_name: userData.user.last_name,
          phone: userData.user.phone,
          linkedin_url: userData.user.linkedin_url,
          bio: userData.user.bio,
          country: userData.user.country,
          city: userData.user.city,
          skills: userData.user.skills
        };

        reset({
          user: filteredUser,
          cur_job_role: userData.cur_job_role,
          educations: userData.educations.map(edu =>({
            ...(edu.id ? { id: edu.id } : {}),
            university: edu.university,
            degree: edu.degree,
            year_of_passing: edu.year_of_passing

          })),
          work_experiences: userData.work_experiences.map(exp =>({
            ...(exp.id ? { id: exp.id } : {}),
            company: exp.company,
            job_role: exp.job_role,
            date_of_joining: exp.date_of_joining,
            date_of_leaving: exp.date_of_leaving
          }))
        });
      }
    }, [userData, reset, isEditMode]);

  const handleFile = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = field === 'profile_pic' ? ACCEPTED_IMAGE_TYPES : ACCEPTED_RESUME_TYPES;
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type for ${field.replace('_', ' ')}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB');
      return;
    }

    setValue(field, file);
    setFilePreviews(prev => ({
      ...prev,
      [field]: field === 'profile_pic' ? URL.createObjectURL(file) : file.name
    }));
  };

  const handleRemoveEducation = (index)=>{
    removeEducation(index);
  }

  const handleRemoveWork = (index)=>{
    removeWork(index);
  }

  const toggleEditMode = () => setIsEditMode(!isEditMode);


const PersonalSection = ({errors}) => (
  <div className="space-y-4">
      <div className="flex justify-center mb-4">
          <div className="relative">
              <img
                  src={filePreviews.profile_pic || userData?.user?.profile_pic_url || avatar2}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white"
                  alt="Profile"
              />
              {isEditMode && (
                  <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-1 rounded-full cursor-pointer hover:bg-primary-600">
                      <PlusCircle size={16} />
                      <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleFile(e, 'profile_pic')}
                      />
                  </label>
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <FormInput
              label="First Name"
              name="user.first_name"
              control={control}
              error={errors.user?.first_name}
              isEditMode={isEditMode}
          />
          <FormInput
              label="Last Name"
              name="user.last_name"
              control={control}
              error={errors.user?.last_name}
              isEditMode={isEditMode}
          />
          <FormInput
              label="Phone"
              name="user.phone"
              control={control}
              error={errors.user?.phone}
              isEditMode={isEditMode}
          />
          <FormInput
              label="Current Job Role"
              name="cur_job_role"
              control={control}
              error={errors.cur_job_role}
              isEditMode={isEditMode}
          />
          <FormInput
              label="Country"
              name="user.country"
              control={control}
              error={errors.user?.country}
              isEditMode={isEditMode}
          />
          <FormInput
              label="City"
              name="user.city"
              control={control}
              error={errors.user?.city}
              isEditMode={isEditMode}
          />

        <div className="col-span-full">
          <Controller
            name="user.bio"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="relative">
                <label className={`text-xs text-gray-600 ${error ? 'text-red-500' : ''}`}>
                  Bio
                </label>
                <textarea
                  {...field}
                  disabled={!isEditMode}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    error ? 'border-red-500' : 'border-text-200'
                  } focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                    !isEditMode ? 'bg-text-50 text-text-400' : ''
                  }`}
                  rows={3}
                  placeholder=" "
                />
                {error && (
                  <span className="text-red-500 text-xs mt-1">{error.message}</span>
                )}
              </div>
            )}
          />
        </div>
      </div>
      <div className='mt-4 col-span-full'>
        <h2 className="text-sm sm:text-base font-semibold">Linkedin Profile</h2>
        <FormInput
              label="Profile URL"
              name="user.linkedin_url"
              control={control}
              error={errors.user?.linkedin_url}
              isEditMode={isEditMode}
          />
      </div>
  </div>
);

  const EducationSection = ({errors, control}) => (
    <div className="space-y-4">
      {/* Education Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-sm sm:text-base font-semibold">Education</h2>
          {isEditMode && (
            <button
              type="button"
              onClick={() => appendEducation({ id: null, university: '', degree: '', year_of_passing: '' })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-xs sm:text-sm"
            >
              <PlusCircle size={16} />
              Add Education
            </button>
          )}
        </div>
  
        <div className="space-y-4">
          {educationFields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 relative">
               {/* Hidden input for ID */}
               <Controller
                  name={`educations.${index}.id`}
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="hidden" 
                      {...field} 
                    />
                  )}
                />
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              )}
              
              <FormInput
                label="University"
                name={`educations.${index}.university`}
                control={control}
                error={errors.educations?.[index]?.university}
                disabled={!isEditMode}
                isEditMode={isEditMode}
              />
              
              <FormInput
                label="Degree"
                name={`educations.${index}.degree`}
                control={control}
                error={errors.educations?.[index]?.degree}
                disabled={!isEditMode}
                isEditMode={isEditMode}
              />

            <div className="col-span-full">
                <Controller
                  name={`educations.${index}.year_of_passing`}
                  control={control}
                  render={({ field, fieldState:{error} }) => (
                  <div className="relative">
                    <label className={`text-xs text-gray-600 ${error ? 'text-red-500' : ''}`}>
                      Year of Passing
                    </label>
                    <input
                      {...field}
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      step="1"
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 rounded-lg border text-sm${
                        errors.educations?.[index]?.year_of_passing ? 'border-red-500' : 'border-text-200'
                      } focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                        !isEditMode ? 'bg-text-50 text-text-400' : ''
                      }`}
                      placeholder=" "
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        field.onChange(isNaN(year) ? '' : year);
                      }}
                    />
                  </div>
                  )}
                />
                {errors.educations?.[index]?.year_of_passing && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.educations[index].year_of_passing.message}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    // </div>
  );

  const ExperienceSection = ({errors, control}) => (
    <div className="space-y-4">
      {/* Work Experience Section */}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-sm sm:text-base font-semibold">Work Experience</h2>
          {isEditMode && (
            <button
              type="button"
              onClick={() => appendWork({ id: null, company: '', job_role: '', date_of_joining: '', date_of_leaving: '' })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 text-xs sm:text-sm"
            >
              <PlusCircle size={16} />
              Add Experience
            </button>
          )}
        </div>
  
        <div className="space-y-4">
          {workFields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 relative">
               {/* Hidden input for ID */}
               <Controller
                  name={`work_experiences.${index}.id`}
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="hidden" 
                      {...field} 
                    />
                  )}
                />
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleRemoveWork(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              )}
              
              <FormInput
                label="Company Name"
                name={`work_experiences.${index}.company`}
                control={control}
                error={errors.work_experiences?.[index]?.company}
                disabled={!isEditMode}
                isEditMode={isEditMode}
              />
              
              <FormInput
                label="Job Role"
                name={`work_experiences.${index}.job_role`}
                control={control}
                error={errors.work_experiences?.[index]?.job_role}
                disabled={!isEditMode}
                isEditMode={isEditMode}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                    <Controller
                      name={`work_experiences.${index}.date_of_joining`}
                      control={control}
                      render={({ field, fieldState:{error} }) => (
                      <div className="relative">
                        <label className={`text-xs text-gray-600 ${error ? 'text-red-500' : ''}`}>
                          Date of Joining
                        </label>
                        <input
                          {...field}
                          type="date"
                          disabled={!isEditMode}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            errors.work_experiences?.[index]?.date_of_joining ? 'border-red-500' : 'border-text-200'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            !isEditMode ? 'bg-text-50 text-text-400' : ''
                          }`}
                        />
                      </div>
                      )}
                    />
                    {errors.work_experiences?.[index]?.date_of_joining && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors.work_experiences[index].date_of_joining.message}
                      </span>
                    )}
                  </div>
                  
    
                  <div className="relative">
                    <Controller
                      name={`work_experiences.${index}.date_of_leaving`}
                      control={control}
                      render={({ field, fieldState:{error} }) => (
                        <div className='relative'>
                        <label className={`text-xs text-gray-600 ${error ? 'text-red-500' : ''}`}>
                          Date of Leaving
                        </label>
                        <input
                          {...field}
                          type="date"
                          disabled={!isEditMode}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            errors.work_experiences?.[index]?.date_of_leaving ? 'border-red-500' : 'border-text-200'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            !isEditMode ? 'bg-text-50 text-text-400' : ''
                          }`}
                        />
                        </div>
                      )}
                    />
                    {errors.work_experiences?.[index]?.date_of_leaving && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors.work_experiences[index].date_of_leaving.message}
                      </span>
                    )}
                  </div>
              </div>
            </div>
          ))}
        </div>
  
      {/* Skills Section */}
      <div className='mt-4'>
        <h2 className="text-sm sm:text-base font-semibold mb-2">Skills</h2>
        <Controller
          name="user.skills"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {skillsData.map(skill => (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => {
                    if (!isEditMode) return;
                    const newValue = field.value.includes(skill.id)
                      ? field.value.filter(id => id !== skill.id)
                      : [...field.value, skill.id];
                    field.onChange(newValue);
                  }}
                  className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                    field.value.includes(skill.id)
                    ? isEditMode
                      ? 'bg-primary-500 text-white hover:bg-primary-600' 
                      : 'bg-primary-500 text-white' 
                    : 'bg-text-100 text-primary-500 hover:bg-primary-600 hover:text-white' 
                  } ${
                    isEditMode ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {skill.skill_name}
                </button>
              ))}
              {errors.user?.skills && (
                <span className="text-red-500 text-xs mt-1 block">
                  {errors.user.skills.message}
                </span>
              )}
            </div>
           )}
         />
        </div>
  
      {/* Resume Upload Section */}
      <div className='mt-4'>
        <h2 className="text-sm sm:text-base font-semibold">Resume</h2>
        <div className='w-full'>
          <div className="flex justify-center">
            <div className="relative w-full max-w-xs">
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isEditMode ? 'border-primary-200 hover:border-primary-300' : 'border-gray-200'
              }`}>
                {filePreviews.resume || userData?.resume_url ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto text-primary-500" size={22} />
                    <a
                      href={userData?.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 text-sm sm:text-base hover:underline"
                    >
                      View Current Resume
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileText className="mx-auto text-gray-400" size={22} />
                    <p className="text-gray-500 text-sm sm:text-base">Upload your resume</p>
                  </div>
                )}
                
                {isEditMode && (
                  <label className="absolute inset-0 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFile(e, 'resume')}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const onError = (errors) => {
    toast.error('Please fix the errors in the form');
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    const { profile_pic, resume, ...jsonData } = data;

    
    const processedData = {
      ...jsonData,
      educations: jsonData.educations.map(edu => ({
        ...(edu.id ? {id:edu.id}:{}),
        university: edu.university,
        degree: edu.degree,
        year_of_passing: Number(edu.year_of_passing)
      })),
      work_experiences: jsonData.work_experiences.map(exp => ({
        ...(exp.id ? {id:exp.id}:{}),
        company: exp.company,
        job_role: exp.job_role,
        // Keep dates as strings in YYYY-MM-DD format
        date_of_joining: exp.date_of_joining,  
        date_of_leaving: exp.date_of_leaving   
      }))
    };
  
    formData.append('json_data', JSON.stringify({
      ...processedData,
      user: { 
        ...processedData.user, 
        skills: processedData.user.skills.map(Number) 
      }
    }));
    
    if (profile_pic instanceof File) {
      formData.append('profile_pic', profile_pic);
    }
    if (resume instanceof File) {
      formData.append('resume', resume);
    }

    try {
      await dispatch(updateUser(formData));
      setIsEditMode(false);
      setActiveTab(0)
      dispatch(fetchUser());
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <>
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Profile' : 'My Profile'}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {isEditMode ? 'Update your profile information' : 'View your profile information'}
                </p>
              </div>
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-300 ${
                  isEditMode 
                    ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' 
                    : 'bg-secondary-500 text-white border-secondary-500 hover:bg-secondary-600'
                }`}
              >
                {isEditMode ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>


            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
              <div className="grid grid-cols-3 gap-2 mb-4 sm:flex sm:gap-4 sm:border-b sm:border-gray-200">
                  {[0, 1, 2].map((tabIndex) => (
                      <button
                          key={tabIndex}
                          onClick={() => setActiveTab(tabIndex)}
                          className={`text-center py-2 px-1 sm:px-3 text-xs sm:text-sm ${
                              activeTab === tabIndex
                                  ? 'border-b-2 border-secondary-500 text-secondary-600 font-semibold'
                                  : 'text-gray-500 hover:text-gray-700 sm:border-b-0'
                          }`}
                      >
                          {['Personal', 'Education', 'Experience & Skills'][tabIndex]}
                      </button>
                  ))}
              </div>
            

            <form onSubmit={handleSubmit(onSubmit, onError)}>
                {activeTab === 0 && <PersonalSection errors={errors} />}
                {activeTab === 1 && <EducationSection errors={errors} control={control}/>}
                {activeTab === 2 && <ExperienceSection errors={errors} control={control}/>}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 mt-6">
                    <div className="w-full sm:w-auto">
                        {activeTab > 0 && (
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab - 1)}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 text-sm"
                            >
                                <ChevronLeft size={18} />
                                Previous
                            </button>
                        )}
                    </div>
                    
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                        {activeTab < 2 && (
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab + 1)}
                                className="w-full px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 flex items-center justify-center gap-2 text-sm"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        )}
                        
                        {activeTab === 2 && isEditMode && (
                            <button
                              type="submit"
                              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm transition-colors duration-200"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                              ) : (
                                "Save Profile"
                              )}
                          </button>
                        )}
                    </div>
                </div>
            </form>
            </div>
        </div>
    </>
);
};

export default TutorProfile;