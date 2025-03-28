import React from 'react'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '../../components/common/ui/Pagination';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TutorCard from '../../components/tutor/TutorCard';
import { fetchAdminTutors } from '../../redux/slices/adminSlice';
import SearchBar from '../../components/common/ui/SearchBar';

const StudentTutors = () => {
  
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [searchQuery, setSearchQuery] = useState('');
  const {adminTutorsData, currentPage, totalPages} = useSelector((state)=>state.admin);
  
  useEffect(() => {
    // Dispatch fetchUser and store the promise
    const fetchData = async () => {
        try {
        setLoading(true);
        await dispatch(fetchAdminTutors({page, pageSize, activeStatus:true, verifiedStatus:true, search:searchQuery})).unwrap();
        } catch (error) {
        
        toast.error("Failed to fetch Tutor")
        console.error('Failed to fetch user:', error);
        }finally {
        setLoading(false);
        }
    };

    fetchData();
    }, [dispatch,page, searchQuery]);

    const handleSearch = (query) => {
      // setPage(1);
      setSearchQuery(query);
    };

  return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section with Profile */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Meet Our Expert Tutors!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 mb-2">
              Discover skilled professionals, explore their profiles, and share your reviews and ratings.
            </p>
          </div>
        </div>

        
        {loading ? (
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        ) :  (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <SearchBar value={searchQuery} onChange={handleSearch} placeholder='Search tutors...'/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {adminTutorsData?.map((tutor) => (
                <TutorCard 
                    key={tutor.id} 
                    tutor={tutor}
                />
                ))}
            </div>
            {<div className='w-full mt-10'>
              <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
              />
            </div> }
            </>
        )}
        </div>
  )
}

export default StudentTutors