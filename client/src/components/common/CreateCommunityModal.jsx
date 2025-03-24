
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { useDispatch } from 'react-redux';
import { createCommunity, fetchCommunities, updateCommunity } from '../../redux/slices/communitySlice';
import FormInput from './ui/FormInput';
import FileUploadInput from './ui/FileUploadInput';
import toast from 'react-hot-toast';


const schema = Joi.object({
  title: Joi.string()
    .pattern(/^[a-zA-Z0-9\s]+$/)
    .min(1)
    .required()
    .label('Title')
    .messages({
      'string.pattern.base': 'Title can only contain alphabets, numbers, and spaces.'
    }),

  description: Joi.string()
    .pattern(/^[a-zA-Z0-9\s]+$/)
    .required()
    .label('Description')
    .messages({
      'string.pattern.base': 'Description can only contain alphabets, numbers, and spaces.'
    }),

  max_members: Joi.number()
    .min(1)
    .max(500)
    .required()
    .label('Member Limit'),

  thumbnail: Joi.any().optional(),
});


const CreateCommunityModal = ({ isOpen, onClose, community }) => {
  const dispatch = useDispatch();
  const [localLoading, setLocalLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: joiResolver(schema),
    defaultValues: community || {
      title: community?.title || '',
      description: community?.description || '',
      max_members: community?.max_members || 50,
      thumbnail: null
      }
  });

  useEffect(() => {
    reset({
      title: community?.title || '',
      description: community?.description || '',
      max_members: community?.max_members || 50,
      thumbnail: null
    });
  }, [community, reset]);

  const isEditMode = !!community;

  const onSubmit = (data) => {
    const formData = new FormData();
    if (data.title !== community?.title) formData.append('title', data.title);
    if (data.description !== community?.description) formData.append('description', data.description);
    if (data.max_members !== community?.max_members) formData.append('max_members', data.max_members);
  
    if (data.thumbnail && data.thumbnail instanceof File) {
     formData.append('thumbnail', data.thumbnail);
    }
    formData.append("is_active", true)

    setLocalLoading(true);

    const action = isEditMode
      ? updateCommunity({ id: community.id, updateData: formData })
      : createCommunity(formData);
  
    dispatch(action)
      .unwrap()
      .then(() => {
        toast.success(isEditMode ? "Community updated successfully" : "Community added successfully");
        dispatch(fetchCommunities({ page: 1, pageSize: 6 }));
      })
      .catch((error) => {
        toast.error(isEditMode ? "Failed to update community" : "Failed to add community");
        console.error(error);
      })
      .finally(() => {
        setLocalLoading(false);
        onClose();
      });

    reset();
    onClose(); 
  };

  if (!isOpen) return null;

  {localLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>
  )}
  

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-xl shadow-xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-text">
              {isEditMode ? 'Edit Community' : 'Create New Community'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              {/* Close icon SVG */}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="Community Title"
              name="title"
              control={control}
              error={errors.title}
              isEditMode={true}
            />
            
            <FormInput
              label="Description"
              name="description"
              control={control}
              error={errors.description}
              type="textarea"
              isEditMode={true}
            />
            
            <FormInput
              label="Maximum Members"
              name="max_members"
              control={control}
              error={errors.max_members}
              type="number"
              isEditMode={true}
            />
            
            <FileUploadInput
              label="Community Thumbnail"
              name="thumbnail"
              control={control}
              error={errors.thumbnail}
              accept="image/*"
              existingImage={community?.thumbnail}
            />

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-text-300 rounded-lg hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-600 transition-colors"
              >
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;