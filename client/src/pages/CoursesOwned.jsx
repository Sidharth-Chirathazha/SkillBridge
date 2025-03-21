import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPurchasedCourses, fetchTradeRequests, updateTradeRequest, fetchCategories } from '../redux/slices/courseSlice';
import Pagination from '../components/common/ui/Pagination';
import CourseCard from '../components/common/ui/CourseCard';
import { Loader, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { ConfirmDialog } from '../components/common/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';
import SearchBar from '../components/common/ui/SearchBar';
import DropdownMenu from '../components/common/ui/DropdownMenu';


const CoursesOwned = ({ variant = 'student' }) => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('purchased');
  const pageSize = 8;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { purchasedCoursesData, currentPage, totalPages, isCourseLoading, 
    isCourseError, requestedTrades, receivedTrades, tradeError, categoriesData } = useSelector((state) => state.course);

  const {role, userData} = useSelector((state)=>state.auth)

  console.log("Requested trades", requestedTrades);
  console.log("Received trades", receivedTrades);
  console.log("Purchased Courses Data", purchasedCoursesData);

   useEffect(() => {
      dispatch(fetchCategories({categoryPage:1, pageSize:100}));
    }, [dispatch]);
  
  
  useEffect(() => {
    dispatch(fetchPurchasedCourses({ page, pageSize, search:searchQuery, categoryId:selectedCategory}));
  }, [dispatch, page, searchQuery, selectedCategory, receivedTrades]);

  // Fetch course data
    useEffect(() => {
        const fetchTrades = async () => {
        try {
            await dispatch(fetchTradeRequests()).unwrap();
        } catch (error) {
            console.error('Failed to fetch course:', error);
        }
        };
        fetchTrades();
    }, [dispatch]);

    useEffect(()=>{
        if(tradeError){
            toast.error(tradeError)
        }
    }, [tradeError])


    const handleSearch = (query) => {
      setPage(1);
      setSearchQuery(query);
    };
  
    const handleCategoryChange = (categoryId) => {
      setPage(1);
      setSelectedCategory(categoryId);
    };

  const handleTradeAction = async (tradeId, action) => {
        try{
            console.log("Dispatching trade action:", { tradeId, action });
            await dispatch(updateTradeRequest({tradeId, action})).unwrap();
            await dispatch(fetchTradeRequests()).unwrap();
            dispatch(fetchPurchasedCourses({ page, pageSize, search:searchQuery, categoryId:selectedCategory}));
            toast.success("Course traded successfully");
        }catch(error){
            console.log("Trade action error:", error);
            
            toast.error("An error occured while updating");
        }
  };

  const TabButton = ({ label, count, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-primary-500 text-white'
          : 'bg-background-200 text-text-500 hover:bg-background-300'
      }`}
    >
      <div className="flex items-center gap-2">
        {label}
        {count !== undefined && (
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            isActive ? 'bg-white text-primary-500' : 'bg-background-300 text-text-600'
          }`}>
            {count}
          </span>
        )}
      </div>
    </button>
  );

  const TradeRequestCard = ({ request, type }) => (
    <div className="bg-white rounded-lg shadow-sm border border-background-200 p-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={type === 'received' ? request.requester.profile_pic : request.accepter.profile_pic}
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-text-700">
                {type === 'received' ? request.requester.name : request.accepter.name}
              </p>
              <p className="text-sm text-text-500">
                {type === 'received' ? 'Requested trade' : 'Trade offered to'}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-text-500">
                {type === 'received' ? 'Requested Course' : 'Course You Requested'}
              </p>
              <p className="font-medium text-text-700">{request.requested_course.title}</p>
              <p className="text-sm text-secondary-500">₹{request.requested_course.price}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-text-500">
                {type === 'received' ? 'Offered Course' : 'Course You Offered'}
              </p>
              <p className="font-medium text-text-700">{request.offered_course.title}</p>
              <p className="text-sm text-secondary-500">₹{request.offered_course.price}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <span className={`px-3 py-1 rounded-full text-sm ${
            request.status === 'pending'
              ? 'bg-primary-100 text-primary-700'
              : request.status === 'accepted'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {request.status}
          </span>
          {type === 'received' && request.status === 'pending' && (
            <div className=" mt-3 flex gap-2">
              <ConfirmDialog
                trigger={(open) =>(
                    <button
                    onClick={open}
                    className="px-4 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                    >
                    <CheckCircle size={16} />
                    Accept
                    </button>
                )}
                title="Accept Course Trade"
                description={`Are you sure you want to trade your course with "${request.offered_course.title}?"`}
                confirmText='Accept'
                onConfirm={() => handleTradeAction(request.id, 'accept')}
                variant='user' 
             />
             <ConfirmDialog
                trigger={(open) =>(
                    <button
                    onClick={open}
                    className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors flex items-center gap-2"
                    >
                    <XCircle size={16} />
                    Decline
                    </button>
                )}
                title="Decline Course Trade"
                description={`Are you sure you want decline the trade offer of "${request.offered_course.title}?"`}
                confirmText='Decline'
                destructive
                onConfirm={() => handleTradeAction(request.id, 'decline')}
                variant='user' 
             />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
    { role === "tutor" && userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) :(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {variant === 'tutor' && (
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <TabButton
                  label="Purchased Courses"
                  count={purchasedCoursesData?.length}
                  isActive={activeTab === 'purchased'}
                  onClick={() => setActiveTab('purchased')}
              />
              <TabButton
                  label="Received Trades"
                  count={receivedTrades.length}
                  isActive={activeTab === 'received'}
                  onClick={() => setActiveTab('received')}
              />
              <TabButton
                  label="Requested Trades"
                  count={requestedTrades.length}
                  isActive={activeTab === 'requested'}
                  onClick={() => setActiveTab('requested')}
              />
            </div>
        )}

        {activeTab === 'purchased' ? (
            <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Continue Learning</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Dive back into your courses and continue learning.
              </p>
            </div>
            {isCourseLoading ? (
                <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin h-10 w-10 text-primary" />
                </div>
            ) : !purchasedCoursesData ? (
              <div className="flex justify-center items-center h-96">
                <h1 className='text-lg text-text-600'>You haven't purchased any courses yet.</h1>
              </div>
            ) : (
                <>
                {/* Add Filters Section Here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <SearchBar value={searchQuery} onChange={handleSearch} />
                    <DropdownMenu
                      dropDownItems={categoriesData.map((cat) => ({value:cat.id, label:cat.name}))} 
                      value={selectedCategory} 
                      onChange={handleCategoryChange}
                      defaultLabel={"All Categories"} 
                    />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    {purchasedCoursesData?.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        isPurchased={true}
                        onLike={() => handleLike(course.id)}
                        role={role}
                    />
                    ))}
                </div>
                <div className="w-full mt-10">
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    />
                </div>
                </>
            )}
            </>
        ) : activeTab === 'received' ? (
            <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Received Trade Requests</h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                Manage trade requests from other tutors.
                </p>
            </div>
            {receivedTrades.map((request) => (
                <TradeRequestCard key={request.id} request={request} type="received" />
            ))}
            </div>
        ) : (
            <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Your Trade Requests</h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                Track the status of your trade requests.
                </p>
            </div>
            {requestedTrades.map((request) => (
                <TradeRequestCard key={request.id} request={request} type="requested" />
            ))}
            </div>
        )}
        </div>
      )}
    </>
  );
};

export default CoursesOwned;