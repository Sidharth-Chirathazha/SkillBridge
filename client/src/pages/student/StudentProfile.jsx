import React, { useState, useEffect } from 'react';
import { Upload, PlusCircle, Linkedin } from 'lucide-react';
import UserLayout from '../../components/common/UserLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, updateUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

// Sample skills data - replace with your actual skills data
const AVAILABLE_SKILLS = [
  { id: 1, name: 'Python' },
  { id: 2, name: 'JavaScript' },
  { id: 3, name: 'Java' },
  { id: 4, name: 'React' },
  { id: 5, name: 'Django' }
];

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  
  const [formData, setFormData] = useState({
    user: {
      first_name: '',
      last_name: '',
      phone: '',
      linkedin_url:'',
      bio: '',
      country: '',
      city: '',
      skills: []
    },
  });

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (userData) {
  
      setFormData({
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
      });
    }
  }, [userData]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfilePicPreview(previewUrl);
      setProfilePicFile(file);
    }
  };
  
  
  const handleUserInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value
      }
    }));
  };


  const handleSkillToggle = (skillId) => {
    const currentSkills = [...formData.user.skills];
    const index = currentSkills.indexOf(skillId);
    
    if (index === -1) {
      currentSkills.push(skillId);
    } else {
      currentSkills.splice(index, 1);
    }
    
    handleUserInputChange('skills', currentSkills);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Prepare data in the exact format expected by the backend
    const dataToSend = {
      user: {
        ...formData.user,
        skills: formData.user.skills.map(id => parseInt(id)) // Ensure skill IDs are numbers
      },
    };

    formDataToSend.append('json_data', JSON.stringify(dataToSend));
    
    if (profilePicFile) {
      formDataToSend.append('profile_pic', profilePicFile);
    }

    for (let [key, value] of formDataToSend.entries()) {
      console.log("inside submit",key, value);
    }

    try {
      await dispatch(updateUser(formDataToSend));
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.")
    }
  };

  console.log("User Data: ", userData);
  
  // console.log("Uploaded Profile Pic URL:", profilePic);

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <p className="text-text-500">Please provide your details to get started as a Student</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-background-200 flex items-center justify-center overflow-hidden">
                {profilePicPreview || userData?.user?.profile_pic_url ? (
                  <img
                    src={profilePicPreview || userData.user.profile_pic_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-text-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-background-50 rounded-full hover:bg-primary-600 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <PlusCircle className="w-4 h-4" />
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.user.first_name}
              onChange={(e) => handleUserInputChange('first_name', e.target.value)}
              placeholder="First Name"
              className="w-full px-3 py-2 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <input
              type="text"
              value={formData.user.last_name}
              onChange={(e) => handleUserInputChange('last_name', e.target.value)}
              placeholder="Last Name"
              className="w-full px-3 py-2 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            /> 
            <input
              type="text"
              value={formData.user.phone}
              onChange={(e) => handleUserInputChange('phone', e.target.value)}
              placeholder="Phone"
              className="w-full px-3 py-2 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            /> 
            <input
              type="text"
              value={formData.user.country}
              onChange={(e) => handleUserInputChange('country', e.target.value)}
              placeholder="Country"
              className="w-full px-3 py-2 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            /> 
            <input
              type="text"
              value={formData.user.city}
              onChange={(e) => handleUserInputChange('city', e.target.value)}
              placeholder="City"
              className="w-full px-3 py-2 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            /> 
            <textarea
              type="text"
              value={formData.user.bio}
              onChange={(e) => handleUserInputChange('bio', e.target.value)}
              placeholder="Bio"
              className="w-full px-3 py-2 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            /> 
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    formData.user.skills.includes(skill.id)
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Social Media Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Social Media Profiles</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Linkedin className="w-6 h-6 text-blue-600" />
                <input
                  type="url"
                  value={formData.user.linkedin_url}
                  onChange={(e) => handleUserInputChange('linkedin_url', e.target.value)}
                  placeholder="LinkedIn Profile URL"
                  className="flex-1 px-3 py-2 rounded-lg border"
                />
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 font-semibold"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
};

export default StudentProfile;