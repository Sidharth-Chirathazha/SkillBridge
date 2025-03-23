import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FaChalkboardTeacher, FaUsers, FaUserTie } from "react-icons/fa";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { FiDownload, FiChevronRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import axiosInstance from "../../api/axios.Config";
import avatar from "../../assets/images/avatar.jpg"


const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [chartTimeframe, setChartTimeframe] = useState('week');
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({});
  const [adminSharePercent, setAdminSharePercent] = useState(0);
  const [tutorSharePercent, setTutorSharePercent] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [topRatedCourses, setTopRatedCourses] = useState([]);
  const [topRatedTutors, setTopRatedTutors] = useState([]);
  
  
  // Purchase data for pie chart
  const totalSalesData = [
    { name: 'Admin Share', value: adminSharePercent },
    { name: 'Tutor Share', value: tutorSharePercent },
  ];
  
  const COLORS = ['#273044', '#A8ACB7'];

  const fetchChartData = async (timeframe) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/admin/earnings-overview?timeframe=${timeframe}`, {requiresAuth:true});
      
      // Update state with the data from the API
      setChartData(response.data.chart_data);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError('Failed to load earnings data');
      
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
      csvContent += "Course Name,Purchased By,Purchase Date,Purchase Type,Course Price,Tutor Share,Credited Amount\n";

      // Add data rows
      purchaseData.forEach(purchase => {
        const row = [
          `"${purchase.course_name}"`,
          `"${purchase.user_name}"`,
          purchase.purchase_date,
          purchase.purchase_type,
          purchase.course_price,
          purchase.opposite_share,
          purchase.credited_amount
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


  useEffect(()=>{
    const fetchSummaryData = async () =>{

      try{
        const response = await axiosInstance.get('/admin/dashboard-summary/', {requiresAuth:true});
        setSummaryData(response.data);
        setAdminSharePercent(response.data.admin_share_percentage)
        setTutorSharePercent(response.data.tutor_share_percentage)
      }catch (error){
        console.error("Error fetching dashboard summary:", error);
      }
    };
    fetchSummaryData();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background-500">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section with Profile */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="flex-shrink-0">
              <img 
                src={avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-text-500"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Welcome, Admin!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 mb-2">
                Track your progress, manage your courses, and continue your learning journey.
              </p>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"> {/* Changed to 4 columns */}
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex items-center mb-2">
                <FaChalkboardTeacher className="text-text-500 mr-2 text-xl" />
                <h2 className="text-lg text-text-400">Total Courses</h2>
              </div>
              <p className="text-3xl font-bold text-text-500">{summaryData.total_courses}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex items-center mb-2">
                <FaUsers className="text-text-500 mr-2 text-xl" />
                <h2 className="text-lg text-text-400">Total Students</h2>
              </div>
              <p className="text-3xl font-bold text-text-500">{summaryData.total_students}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex items-center mb-2">
                <FaUserTie className="text-text-500 mr-2 text-xl" />
                <h2 className="text-lg text-text-400">Total Tutors</h2>
              </div>
              <p className="text-3xl font-bold text-text-500">{summaryData.total_tutors}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex items-center mb-2">
                <RiMoneyRupeeCircleFill className="text-text-500 mr-2 text-xl" />
                <h2 className="text-lg text-text-400">Total Earnings</h2>
              </div>
              <p className="text-3xl font-bold text-text-500">₹{summaryData.total_earnings}</p>
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
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'day' ? 'bg-text-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Day
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('week')}
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'week' ? 'bg-text-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('month')}
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'month' ? 'bg-text-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange('year')}
                    className={`px-3 py-1 rounded-md text-sm transition duration-200 ${chartTimeframe === 'year' ? 'bg-text-500 text-white' : 'bg-background-200 text-text-400 hover:bg-background-300'}`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-background-700 rounded mr-1"></div>
                    <span className="text-sm text-text-400">Total Sales</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-text-500 rounded mr-1"></div>
                    <span className="text-sm text-text-400">Admin Earnings</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="px-3 py-1 bg-background-800 text-white rounded-md text-sm flex items-center transition duration-200 hover:bg-background-900"
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
                        formatter={(value, name, props) => {
                          const label = name === 'adminEarnings' ? 'Admin Earnings' : 'Total Sales';
                          return [`₹${value}`, label];
                        }}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd' }}
                      />
                      <Legend />
                      <Bar dataKey="totalSales" name="Total Sales" fill="#A8ACB7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="adminEarnings" name="Admin Earnings" fill="#202A3B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>            
            {/* Sales Distribution Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-500">Sales Distribution</h2>
                
                {/* Total Sales Display */}
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                  <span className="text-gray-600 font-medium mr-2">Total Sales:</span>
                  <span className="text-lg font-bold text-text-600">
                    ₹{summaryData.total_sales}
                  </span>
                </div>
              </div>
              
              <div className="h-80 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 40, right: 20, left: 20, bottom: 60 }}>
                    <Pie
                      data={totalSalesData}
                      cx="50%"
                      cy="40%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {totalSalesData.map((entry, index) => (
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
          
          {/* Two column layout for Top Courses and Top Tutors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Top Rated Courses */}
            <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-500">Top Rated Courses</h2>
                <button className="text-text-500 text-sm flex items-center transition duration-200 hover:text-text-600">
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
                <button className="text-text-500 text-sm flex items-center transition duration-200 hover:text-text-600">
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
    </>
  );
};

export default AdminDashboard;