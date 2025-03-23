import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Pagination from '../../components/common/ui/Pagination';
import SearchBar from '../../components/common/ui/SearchBar';
import AdminCommunityCard from '../../components/admin/AdminCommunityCard';
import { fetchCommunities } from '../../redux/slices/communitySlice';

const AdminCommunityManagement = () => {

  const { communities, isCommunityLoading, currentPage, totalPages } = useSelector((state) => state.community);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 6;
 
  const dispatch = useDispatch();

  useEffect(() => {
      const fetchData = async () => {
          try {
          setLoading(true);
          await dispatch(fetchCommunities({page,pageSize, search:searchQuery})).unwrap();
          } catch (error) {
          console.error('Failed to fetch Course:', error);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
    }, [dispatch, page, searchQuery]);

  const handleSearch = (query) => {
    setPage(1);
    setSearchQuery(query);
  };


  return (
    <>
     <div className="container mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Explore & Connect</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Join communities, share knowledge, and grow together!</p>
        </div>
       </div>

       {isCommunityLoading ? (
         <div className="text-center">Loading...</div>
       ) : (
         <>

           {/* Add Filters Section Here */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               <SearchBar value={searchQuery} onChange={handleSearch} placeholder='Search communities...' />
             </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {communities.map((community) => (
               <AdminCommunityCard 
                 key={community.id} 
                 community={community}
                 page={page}
                 pageSize={pageSize} 
               />
             ))}
           </div>
           <div className='w-full mt-10'>
               <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
               />
           </div>
         </>
       )}
     </div>
   </>
  )
}

export default AdminCommunityManagement