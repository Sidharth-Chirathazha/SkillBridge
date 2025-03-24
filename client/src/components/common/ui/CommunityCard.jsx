import React from 'react';
import { useDispatch } from 'react-redux';
import { joinCommunity } from '../../../redux/slices/communitySlice';
import { Link } from 'react-router-dom';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { Users, Pencil, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const cld = new Cloudinary({
  cloud: { cloudName: 'dz9kgofdy' },
});

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/upload/');
  return parts.length > 1 ? parts[1].split('.')[0] : null;
};

const CommunityCard = ({ community, currentUserId, onEditCommunity, userRole }) => {
  const isMember = Array.isArray(community?.members) && 
    community.members.some(m => Number(m.user) === Number(currentUserId));
  const isCreator = Number(community?.creator) === Number(currentUserId);
  const dispatch = useDispatch();

  const handleJoin = async() => {
    try{
      await dispatch(joinCommunity(community.id));
      toast.success("You have successfully joined this community")
    }catch(error){
      console.error("An error occured while joining the community")
      toast.error("An error occured while joining the community")
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
        {isCreator && (
          <button
            onClick={() => onEditCommunity(community)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all z-20"
          >
            <Pencil className="w-5 h-5 text-secondary-500" />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 text-text line-clamp-2 group-hover:text-primary transition-colors">
          {community.title}
        </h3>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm text-text-400 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{community.members_count}/{community.max_members}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(community.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-400 text-sm mb-4 line-clamp-2">{community.description}</p>

        {/* Action Button */}
        <div className="flex justify-center mt-auto pt-4 border-t border-gray-100">
          {isCreator || isMember ? (
            <Link
              to={`/${userRole}/communities/${community.id}/chat`}
              className="w-full flex items-center justify-center bg-primary text-white px-4 py-2 rounded-full transition-colors hover:bg-secondary"
            >
              Open Community
            </Link>
          ) : (
            <button
              onClick={handleJoin}
              disabled={community.members_count >= community.max_members}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                community.members_count >= community.max_members 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-secondary-500 hover:bg-secondary-600 text-white'
              }`}
            >
              {community.members_count >= community.max_members ? 'Full' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
