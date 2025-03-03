import React from 'react';
import { useDispatch } from 'react-redux';
import { joinCommunity } from '../../../redux/slices/communitySlice';
import { Link } from 'react-router-dom';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import toast from 'react-hot-toast';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dz9kgofdy',
  },
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

  const handleJoin = () => {
    dispatch(joinCommunity(community.id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative">
      {isCreator && (
        <button
          onClick={() => onEditCommunity(community)}
          className="absolute top-1 right-1 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-gray-50 z-10"
        >
          <PencilSquareIcon className="w-4 h-4 text-secondary-500" />
        </button>
      )}
      <div className="w-full h-40 bg-gray-100 overflow-hidden">
        {community?.thumbnail ? (
          <AdvancedImage
            cldImg={cld.image(getPublicIdFromUrl(community.thumbnail))}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            alt={community.title}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No thumbnail</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text-500 mb-1 truncate">{community.title}</h3>
        <div className="flex justify-between text-xs text-text-400 mb-2">
          <span>{new Date(community.created_at).toLocaleDateString()}</span>
          <span className="font-medium">{community.members_count}/{community.max_members}</span>
        </div>
        <p className="text-text-400 text-xs mb-3 line-clamp-2">{community.description}</p>
        
        <div className="flex justify-center">
          {isCreator || isMember ? (
            <Link 
              to={`/${userRole}/communities/${community.id}/chat`}
              className="inline-block text-center bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors w-2/3"
            >
              Open Community
            </Link>
          ) : (
            <button
              onClick={handleJoin}
              disabled={community.members_count >= community.max_members}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors w-2/3 ${
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