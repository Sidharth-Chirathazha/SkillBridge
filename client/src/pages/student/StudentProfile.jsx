import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { Upload, PlusCircle, Linkedin } from 'lucide-react';
import { fetchUser, updateUser, fetchSkills } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import FormInput from '../../components/common/ui/FormInput';
import avatar2 from '../../assets/images/avatar2.jpg'
import { Loader } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
      'string.pattern.base': 'Last name should only contain alphabets'
    }),
    phone: Joi.string().regex(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Invalid phone number'
    }),
    linkedin_url: Joi.string().uri().optional().messages({
      'string.uri': 'Invalid LinkedIn URL'
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
  }).unknown(true),

  profile_pic: Joi.any()
    .optional()
    .meta({ type: 'file' })
    .custom((value, helpers) => {
      if (value && value.size > MAX_FILE_SIZE) {
        return helpers.error('file.size');
      }
      if (value && !ACCEPTED_IMAGE_TYPES.includes(value.type)) {
        return helpers.error('file.type');
      }
      return value;
    })
    .messages({
      'file.size': 'File size exceeds 5MB',
      'file.type': 'Invalid image format (allowed: jpg, png, webp)'
    })
});

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { userData, skillsData, isUpdateError, isLoading } = useSelector((state) => state.auth);
  const [filePreviews, setFilePreviews] = useState({ profile_pic: null });
  const [isEditMode, setIsEditMode] = useState(false);

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      user: { 
        ...userData?.user, 
        skills: userData?.user?.skills || [] 
      },
      profile_pic: null
    }
  });

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchSkills({ skillPage: 1, pageSize: 100 }));
  }, [dispatch]);


  useEffect(() => {
    if (userData) {
      reset({
        user: {
          first_name: userData.user?.first_name || '',
          last_name: userData.user?.last_name || '',
          phone: userData.user?.phone || '',
          linkedin_url: userData.user?.linkedin_url || '',
          bio: userData.user?.bio || '',
          country: userData.user?.country || '',
          city: userData.user?.city || '',
          skills: userData.user?.skills || []
        },
        profile_pic: null
      });
      setFilePreviews({
        profile_pic: userData?.user?.profile_pic_url || null
      });
    }
  }, [userData, reset]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setValue('profile_pic', file, {shouldValidate: true});
    setFilePreviews(prev => ({
      ...prev,
      profile_pic: URL.createObjectURL(file)
    }));
  };

  const toggleEditMode = () => setIsEditMode(!isEditMode);

  const onSubmit = async (data) => {
    const formData = new FormData();
    const { profile_pic, ...jsonData } = data;

    formData.append('json_data', JSON.stringify({
      ...jsonData,
      user: { 
        ...jsonData.user, 
        skills: jsonData.user.skills.map(Number) 
      }
    }));

    if (profile_pic instanceof File) {
      formData.append('profile_pic', profile_pic);
    }

    try {
      await dispatch(updateUser(formData));
      if(isUpdateError){
        toast.error("Failed to update profile");
      }
      else{
        dispatch(fetchUser());
        toast.success("Profile updated successfully!");
        setIsEditMode(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {isEditMode ? 'Edit Your Profile' : 'My Profile'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              {isEditMode ? 'Update your profile information' : 'View your profile details here'}
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-center mb-4">
                <div className="relative">
                  <img
                      src={filePreviews.profile_pic || userData?.user?.profile_pic_url || avatar2}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white"
                      alt="Profile"
                  />
                  {isEditMode && (
                      <label className="absolute bottom-0 right-0 bg-secondary-500 text-white p-1 rounded-full cursor-pointer hover:bg-secondary-600">
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
            <div className="mt-4 w-full flex justify-center sm:justify-end">
              {isEditMode && (
                  <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm transition-colors duration-200"
                      disabled={isLoading}
                  >
                     {isLoading ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </button>
              )}
          </div>
          </form>
        </div>
      </div>
  );
};

export default StudentProfile;