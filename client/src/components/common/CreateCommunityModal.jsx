// CreateCommunityModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { useDispatch } from 'react-redux';
import { createCommunity, fetchCommunities, updateCommunity } from '../../redux/slices/communitySlice';
import FormInput from './ui/FormInput';
import FileUploadInput from './ui/FileUploadInput';
import toast from 'react-hot-toast';


const schema = Joi.object({
  title: Joi.string().required().label('Title'),
  description: Joi.string().required().label('Description'),
  max_members: Joi.number().min(1).max(500).required().label('Member Limit'),
  thumbnail: Joi.any().optional(),
});

const CreateCommunityModal = ({ isOpen, onClose, community }) => {
  const dispatch = useDispatch();
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

    // console.log("FormData entries:", [...formData.entries()]);

    if (isEditMode) {
      dispatch(updateCommunity({ id: community.id, updateData: formData }))
          .unwrap()  // Ensures the action completes before continuing
          .then(() => {
              toast.success("Community updated successfully");
              dispatch(fetchCommunities()); // Now fetch the updated list
          })
          .catch((error) => {
              toast.error("Failed to update community");
              console.error(error);
          });
    } else {
        dispatch(createCommunity(formData))
          .unwrap()
          .then(() => {
              toast.success("Community added successfully");
              dispatch(fetchCommunities());
          })
          .catch((error) => {
              toast.error("Failed to add community");
              console.error(error);
          });
    }

    reset();
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-xl shadow-xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-text-500">
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                {isEditMode ? 'Update Community' : 'Create Community'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;