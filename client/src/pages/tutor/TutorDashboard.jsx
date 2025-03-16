import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FaChalkboardTeacher, FaUsers} from "react-icons/fa";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { fetchTutorReviews, fetchUser } from "../../redux/slices/authSlice";
import TutorVerificationMessage from "../../components/tutor/TutorVerificationMessage";
import { FiDownload, FiChevronRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { fetchPurchasedCourses } from "../../redux/slices/courseSlice";
import axiosInstance from "../../api/axios.Config";


const TutorDashboard = () => {
  const dispatch = useDispatch();
  const { userData, tutorReviewsData, role } = useSelector((state) => state.auth);
  const { purchasedCoursesData } = useSelector((state) => state.course);
  const [chartTimeframe, setChartTimeframe] = useState('week');
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({});
  const [purchasePercent, setPurchasePercent] = useState(0);
  const [tradePercent, setTradePercent] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  
  // Purchase data for pie chart
  const purchaseData = [
    { name: 'Purchased', value: purchasePercent },
    { name: 'Traded', value: tradePercent },
  ];
  
  const COLORS = ['#1E467F', '#F23276'];

  const fetchChartData = async (timeframe) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/tutor/earnings-overview?timeframe=${timeframe}`, {requiresAuth:true});
      
      // Update state with the data from the API
      setChartData(response.data.chart_data);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError('Failed to load earnings data');
      
      // // Fallback to dummy data in case of error
      // setChartData(generateFallbackData(timeframe));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (timeframe) => {
    setChartTimeframe(timeframe);
    fetchChartData(timeframe);
  };

  useEffect(() => {
    fetchChartData(chartTimeframe);
  }, []);
  
  
  
  
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try{
      const response = await axiosInstance.get(`/tutor/purchase-details?timeframe=${chartTimeframe}`, {requiresAuth:true});
      const purchaseData = response.data.purchases;

      // Generate CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add CSV header
      csvContent += "Course Name,User Name,Purchase Date,Purchase Type,Course Price,Purchase Amount\n";

      // Add data rows
      purchaseData.forEach(purchase => {
        const row = [
          `"${purchase.course_name}"`,
          `"${purchase.user_name}"`,
          purchase.purchase_date,
          purchase.purchase_type,
          purchase.course_price,
          purchase.transaction_amount
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `earnings_report_${chartTimeframe}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    }catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  

  };

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
      dispatch(fetchPurchasedCourses({ page:1, pageSize:3}));
    }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTutorReviews(userData?.id))
  }, [dispatch])

  useEffect(()=>{
    const fetchSummaryData = async () =>{

      try{
        const response = await axiosInstance.get('/tutor/dashboard-summary/', {requiresAuth:true});
        setSummaryData(response.data);
        setPurchasePercent(response.data.purchase_percent)
        setTradePercent(response.data.trade_percent)
      }catch (error){
        console.error("Error fetching dashboard summary:", error);
      }
    };
    fetchSummaryData();
  }, []);

  return (
    <>
      {userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) : (
      <div className="min-h-screen bg-background-500">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section with Profile */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="flex-shrink-0">
              <img 
                src={userData?.user?.profile_pic_url || "https://via.placeholder.com/100x100"} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-500"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Welcome, {userData?.user?.first_name || "Student"}!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 mb-2">
                Track your progress, manage your courses, and continue your learning journey.
              </p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <span className="bg-primary-100 text-primary-500 px-3 py-1 rounded-full text-xs">
                  {role || "Student"}
                </span>
                <span className="bg-secondary-100 text-secondary-500 px-3 py-1 rounded-full text-xs">
                  {userData?.user?.skills?.length || 0} skills
                </span>
              </div>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex items-center mb-2">
                <FaChalkboardTeacher className="text-primary-500 mr-2 text-xl" />
                <h2 className="text-lg text-text-400">Total Courses</h2>
              </div>
              <p className="text-3xl font-bold text-primary-500">{summaryData.total_courses}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex items-center mb-2">
                <FaUsers className="text-primary-500 mr-2 text-xl" />
                <h2 className="text-lg text-text-400">Total Students</h2>
              </div>
              <p className="text-3xl font-bold text-primary-500">{summaryData.total_students}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex items-center mb-2">
                <RiMoneyRupeeCircleFill className="text-secondary-500 mr-2 text-xl" />
                <h2 className="text-lg text-text-400">Total Earnings</h2>
              </div>
              <p className="text-3xl font-bold text-secondary-500">₹{summaryData.total_earnings}</p>
            </div>
          </div>
          
          {/* Charts Section - now as two separate cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Earnings Overview Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-semibold text-text-500 mb-4 sm:mb-0">Earnings Overview</h2>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleTimeframeChange('day')}
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'day' ? 'bg-primary-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Day
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('week')}
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'week' ? 'bg-primary-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('month')}
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'month' ? 'bg-primary-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('year')}
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'year' ? 'bg-primary-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              <div className="mt-2 flex justify-end mb-6">
                <button 
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="px-3 py-1 bg-secondary-500 text-white rounded-md text-sm flex items-center transition duration-200 hover:bg-secondary-600"
                >
                  <span className="mr-1">{isDownloading ? 'Downloading...' : 'Download Report'}</span>
                  <FiDownload className="h-4 w-4" />
                </button>
              </div>
              
              {isLoading && (
                <div className="flex justify-center items-center h-64">
                  <span className="text-text-400">Loading data...</span>
                </div>
              )}
              
              {error && (
                <div className="flex justify-center items-center h-64 text-red-500">
                  <span>{error}</span>
                </div>
              )}
              
              {!isLoading && !error && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Earnings']}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd' }}
                      />
                      <Bar dataKey="earnings" fill="#1E467F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {/* Purchase Distribution Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg ">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-500">Purchase Distribution</h2>
              </div>
              
              <div className="h-80 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 40, right: 20, left: 20, bottom: 60 }}>
                    <Pie
                      data={purchaseData}
                      cx="50%"
                      cy="40%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {purchaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd' }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{marginTop: '20px'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Courses in Progress */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-500">Courses in Progress</h2>
              <button className="text-primary-500 text-sm flex items-center transition duration-200 hover:text-primary-600">
                View All <FiChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {purchasedCoursesData.map(course => (
                <div 
                  key={course.id} 
                  className="bg-background-100 rounded-lg overflow-hidden shadow transition duration-300 ease-in-out hover:shadow-lg hover:translate-y-1"
                >
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <span className="text-white text-sm font-medium">{course.progress || 0}% Complete</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-text-500 mb-2">{course.title}</h3>
                    <div className="w-full bg-background-300 rounded-full h-2">
                      <div 
                        className="bg-secondary-500 h-2 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Student Reviews - hover effects removed */}
          <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-500">Student Reviews</h2>
              <button className="text-primary-500 text-sm flex items-center transition duration-200 hover:text-primary-600">
                View All <FiChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {tutorReviewsData.map(review => (
                <div 
                  key={review.id} 
                  className="border-b border-background-300 last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex items-start mb-3">
                    <img 
                      src={review.user.profile_pic_url} 
                      alt={review.user.full_name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium text-text-500">{review.user.full_name}</h3>
                        <span className="text-sm text-text-400">
                        {new Date(review.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-background-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-text-400 text-sm">{review.review}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default TutorDashboard;