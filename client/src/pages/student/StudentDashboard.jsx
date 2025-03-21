import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { fetchUser } from "../../redux/slices/authSlice";
import { FiChevronRight } from 'react-icons/fi';
import { FaStar, FaRegClock, FaBook, FaCheck } from 'react-icons/fa';
import { fetchPurchasedCourses } from "../../redux/slices/courseSlice";
import axiosInstance from "../../api/axios.Config";
import avatar2 from '../../assets/images/avatar2.jpg'
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { userData, role } = useSelector((state) => state.auth);
  const { purchasedCoursesData } = useSelector((state) => state.course);
  const navigate = useNavigate()

  const [activityTimeframe, setActivityTimeframe] = useState('weekly');
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({});
  const [completedPercent, setCompletedPercent] = useState(40);
  const [remainingPercent, setRemainingPercent] = useState(60);
  const [topRatedCourses, setTopRatedCourses] = useState([]);
  const [topRatedTutors, setTopRatedTutors] = useState([]);
  
  // Course completion data for pie chart
  const completionData = [
    { name: 'Completed', value: completedPercent },
    { name: 'Remaining', value: remainingPercent },
  ];

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes > 0 ? minutes + "m" : ""}`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs > 0 ? secs + "s" : ""}`;
    } else {
        return `${secs}s`;
    }
};
  
  const COLORS = ['#1E467F', '#F23276'];

  useEffect(()=>{
    const fetchTopRatedCourses = async () =>{

      try{
        const response = await axiosInstance.get('/student/top-rated-courses/');
        setTopRatedCourses(response.data);
      }catch (error){
        console.error("Error fetching toprated courses:", error);
      }
    };
    fetchTopRatedCourses();
  }, []);

  useEffect(()=>{
    const fetchTopRatedTutors = async () =>{

      try{
        const response = await axiosInstance.get('/student/top-rated-tutors/');
        setTopRatedTutors(response.data);
      }catch (error){
        console.error("Error fetching toprated tutors:", error);
      }
    };
    fetchTopRatedTutors();
  }, []);

  const fetchActivityData = async (timeframe) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, you would use the actual API endpoint
      const response = await axiosInstance.get(`/learning-activity?period=${timeframe}`, {requiresAuth:true});
      const responseData = response.data;
      
      // Transform API response into the expected chart format
      let formattedData = [];
      
      if (timeframe === 'daily') {
        // Show data for the last 24 hours
        for (let i = 0; i < 24; i++) {
          formattedData.push({
            name: `${i}:00`,
            time_spent: Math.round((responseData.find(entry => new Date(entry.date).getHours() === i)?.time_spent || 0) / 60) // Convert to minutes
          });
        }
      } else if (timeframe === 'monthly') {
        // Days in a month
        for (let i = 1; i <= 30; i++) {
          formattedData.push({
            name: `Day ${i}`,
            time_spent: Math.round((responseData.find(entry => new Date(entry.date).getDate() === i)?.time_spent || 0) / 60) // Convert to minutes
          });
        }
      } else { // weekly
        // Days in a week
        const daysMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        formattedData = responseData.map(entry => ({
          name: daysMap[new Date(entry.date).getDay()],
          time_spent: Math.round(entry.time_spent / 60) // Convert to minutes
        }));

        // Ensure all days are present in order
        formattedData = daysMap.map(day => ({
            name: day,
            time_spent: formattedData.find(item => item.name === day)?.time_spent || 0
        }));
      }
      
      setActivityData(formattedData);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Failed to load activity data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (timeframe) => {
    setActivityTimeframe(timeframe);
    fetchActivityData(timeframe);
  };

  useEffect(() => {
    fetchActivityData(activityTimeframe);
  }, []);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
        dispatch(fetchPurchasedCourses({ page:1, pageSize:3}));
  }, [dispatch]);

  useEffect(()=>{
    const fetchSummaryData = async () =>{

      try{
        const response = await axiosInstance.get('/student/dashboard-summary/', {requiresAuth:true});
        setSummaryData(response.data);
        setCompletedPercent(response.data.completed_percentage)
        setRemainingPercent(response.data.completed_percentage > 0 ? 100 - response.data.completed_percentage : 0)
      }catch (error){
        console.error("Error fetching dashboard summary:", error);
      }
    };
    fetchSummaryData();
  }, []);


  return (
    <div className="min-h-screen bg-background-500">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section with Profile */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="flex-shrink-0">
            <img 
              src={userData?.user?.profile_pic_url || avatar2} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-primary-500"
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
              <FaBook className="text-primary-500 mr-2 text-xl" />
              <h2 className="text-lg text-text-400">Courses Enrolled</h2>
            </div>
            <p className="text-3xl font-bold text-primary-500">{summaryData.courses_enrolled}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex items-center mb-2">
              <FaRegClock className="text-primary-500 mr-2 text-xl" />
              <h2 className="text-lg text-text-400">Learning Time</h2>
            </div>
            <p className="text-3xl font-bold text-primary-500">{formatTime(summaryData.learning_time_seconds)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex items-center mb-2">
              <FaCheck className="text-secondary-500 mr-2 text-xl" />
              <h2 className="text-lg text-text-400">Courses Completed</h2>
            </div>
            <p className="text-3xl font-bold text-secondary-500">{summaryData.courses_completed}</p>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Learning Activity Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold text-text-500 mb-4 sm:mb-0">Learning Activity</h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleTimeframeChange('daily')}
                  className={`px-3 py-1 rounded-md text-sm transition duration-200 ${activityTimeframe === 'daily' ? 'bg-primary-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => handleTimeframeChange('weekly')}
                  className={`px-3 py-1 rounded-md text-sm transition duration-200 ${activityTimeframe === 'weekly' ? 'bg-primary-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => handleTimeframeChange('monthly')}
                  className={`px-3 py-1 rounded-md text-sm transition duration-200 ${activityTimeframe === 'monthly' ? 'bg-primary-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                >
                  Monthly
                </button>
              </div>
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
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} min`, 'Time Spent']}
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="time_spent" 
                      stroke="#1E467F" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          {/* Course Completion Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-500">Course Completion</h2>
            </div>
            
            <div className="h-80 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 40, right: 20, left: 20, bottom: 60 }}>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {completionData.map((entry, index) => (
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
            <button className="text-primary-500 text-sm flex items-center transition duration-200 hover:text-primary-600"
            onClick={() => navigate('/student/learning/')}
            >
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
        
        {/* Two column layout for Top Courses and Top Tutors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Rated Courses */}
          <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-500">Top Rated Courses</h2>
              <button className="text-primary-500 text-sm flex items-center transition duration-200 hover:text-primary-600"
              onClick={() => navigate("/student/courses/")}
              >
                View All <FiChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {topRatedCourses.map(course => (
                <div 
                  key={course.id} 
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background-100 transition duration-200"
                >
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-500 truncate">{course.title}</h3>
                    <p className="text-text-400 text-sm truncate">By {course.tutor_name}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-background-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-text-400 ml-2">{course.rating} ({course.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top Rated Tutors */}
          <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-500">Top Rated Tutors</h2>
              <button className="text-primary-500 text-sm flex items-center transition duration-200 hover:text-primary-600"
              onClick={() => navigate("/student/tutors/")}
              >
                View All <FiChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {topRatedTutors.map(tutor => (
                <div 
                  key={tutor.id} 
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background-100 transition duration-200"
                >
                  <img 
                    src={tutor.profile_pic} 
                    alt={tutor.name} 
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-500 truncate">{tutor.name}</h3>
                    <p className="text-text-400 text-sm truncate">{tutor.city}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(tutor.rating) ? 'text-yellow-400' : 'text-background-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-text-400 ml-2">{tutor.rating} • {tutor.total_students} students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;