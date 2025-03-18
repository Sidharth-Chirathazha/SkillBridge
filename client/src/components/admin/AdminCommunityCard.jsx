import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { Users, Clock, User } from 'lucide-react';
import { fetchCommunities, updateCommunity } from '../../redux/slices/communitySlice';
import toast from 'react-hot-toast';

const cld = new Cloudinary({
  cloud: { cloudName: 'dz9kgofdy' },
});

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/upload/');
  return parts.length > 1 ? parts[1].split('.')[0] : null;
};

const AdminCommunityCard = ({ community, page, pageSize }) => {
  const dispatch = useDispatch();

  const handleBlockToggle = async () => {
    try {
      const formData = new FormData();
      formData.append("is_active", !community.is_active); // Toggle status
  
      await dispatch(updateCommunity({ id: community.id, updateData: formData }));
  
      toast.success(
        !community.is_active ? "Community unblocked successfully" : "Community blocked successfully"
      );
      await dispatch(fetchCommunities({page, pageSize}));
    } catch (error) {
      console.error("Error updating community status:", error);
      toast.error("Failed to update community status");
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col group">
    {/* Thumbnail Section */}
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {community?.thumbnail ? (
        <AdvancedImage
          cldImg={cld.image(getPublicIdFromUrl(community.thumbnail))}
          className="w-full aspect-video object-cover"
          alt={community.title}
        />
      ) : (
        <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">No thumbnail</span>
        </div>
      )}
    </div>

    {/* Content Section */}
    <div className="p-5 flex-1 flex flex-col">
      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 text-text line-clamp-2 group-hover:text-primary transition-colors">
        {community.title}
      </h3>

      {/* Metrics */}
      <div className="flex items-center gap-4 text-sm text-text-400 mb-3">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{community.members_count}/{community.max_members}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{new Date(community.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Creator Info */}
      <div className="flex items-center gap-2 text-sm text-text-400 mb-3">
        <User className="w-4 h-4" />
        <span>Created by: {community.creator_name || 'Unknown'}</span>
      </div>

      {/* Description */}
      <p className="text-text-400 text-sm mb-4 line-clamp-2">{community.description}</p>

      {/* Action Button */}
      <div className="flex justify-center mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={handleBlockToggle}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            community.is_active 
              ? 'bg-secondary-500 hover:bg-secondary-600 text-white' 
              : 'bg-text-500 hover:bg-text-600 text-white'
          }`}
        >
          {community.is_active ? 'Block' : 'Unblock'}
        </button>
      </div>
    </div>
  </div>
  );
};

export default AdminCommunityCard;