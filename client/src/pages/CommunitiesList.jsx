// CommunitiesList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCommunities } from '../redux/slices/communitySlice';
import CommunityCard from '../components/common/ui/CommunityCard';
import CreateCommunityModal from '../components/common/CreateCommunityModal';
import { Loader } from 'lucide-react';


const CommunitiesList = () => {
  const { communities, isCommunityLoading } = useSelector((state) => state.community);
  const { role, userData } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCommunity, setEditingCommunity] = useState(null);

  // console.log("UserData in CommunitiesList:", userData);
  // console.log("CurrentUserId being passed:", userData?.user?.id);
  // console.log("Communities Array:", communities);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
        try {
        setLoading(true);
        await dispatch(fetchCommunities()).unwrap();
        } catch (error) {
        console.error('Failed to fetch Course:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [dispatch]);


  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
        </div>
    );
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Explore & Connect</h1>
        <p className="text-gray-600 text-sm sm:text-base mt-1">Join communities, share knowledge, and grow together!</p>
      </div>
        {role === 'tutor' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-secondary-500 hover:bg-secondary-600 text-white text-sm px-3 py-1.5 rounded-md"
          >
            Create Community
          </button>
        )}
      </div>

      {isCommunityLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              currentUserId={userData?.user?.id}
              onEditCommunity={setEditingCommunity}
              userRole={role} 
            />
          ))}
        </div>
      )}

      <CreateCommunityModal 
        isOpen={showCreateModal || Boolean(editingCommunity)}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCommunity(null);
        }}
        community={editingCommunity} // Pass community for edit
      />
    </div>
  );
};

export default CommunitiesList;