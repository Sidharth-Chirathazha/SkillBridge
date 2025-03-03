import React from 'react'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '../../components/common/ui/Pagination';
import { Loader } from 'lucide-react';
import UserLayout from '../../components/common/UserLayout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TutorCard from '../../components/tutor/TutorCard';
import { fetchAdminTutors } from '../../redux/slices/adminSlice';

const StudentTutors = () => {
  
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const {adminTutorsData, currentPage, totalPages} = useSelector((state)=>state.admin);
  
  useEffect(() => {
    // Dispatch fetchUser and store the promise
    const fetchData = async () => {
        try {
        setLoading(true);
        await dispatch(fetchAdminTutors({page, pageSize, activeStatus:true, verifiedStatus:true})).unwrap();
        } catch (error) {
        
        toast.error("Failed to fetch Tutor")
        console.error('Failed to fetch user:', error);
        }finally {
        setLoading(false);
        }
    };

    fetchData();
    }, [dispatch,page]);

  return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Discover Your Next Learning Adventure
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Browse through diverse courses and enhance your skills today!
          </p>
        </div>

        
        {loading ? (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin h-10 w-10 text-primary" />
            </div>
        ) :  (
            <>
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