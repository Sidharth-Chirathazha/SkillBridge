import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import CourseDetail from '../../components/common/CourseDetail'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchSingleCourse, updateCourse } from '../../redux/slices/courseSlice'
import { Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminCourseDetailView = () => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const {singleCourse, isCourseLoading} = useSelector((state)=>state.course);
    const {id} = useParams();
    
    useEffect(() => {
    const fetchData = async () => {
        try {
        setLoading(true);
        await dispatch(fetchSingleCourse({id})).unwrap();
        } catch (error) {
        console.error('Failed to fetch Course:', error);
        } finally {
        setLoading(false);
        }
    };
    fetchData();
    }, [dispatch, id]);

    const handleAdminAction = async (action)=>{
        const formData = new FormData();
        if(action == 'Approve'){
            formData.append('status', 'Approved')
        }
        else if(action == 'Decline'){
            formData.append('status', 'Declined')
        }
        else if(action == 'deactivate'){
            formData.append('is_active', false)
        }
        else if(action == 'activate'){
            formData.append('is_active', true)
        }

        try{
            await dispatch(updateCourse({id:id, updateData:formData})).unwrap();
            toast.success("Course status updated");
            dispatch(fetchSingleCourse({id}));
        }catch(error){
            toast.error("Failed to update course status")
        }
    }

    if (loading || !singleCourse) {
    return (
        <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
        </div>
    );
    }


  return (
    <>
        <CourseDetail
            course={singleCourse}
            variant="admin"
            onAction={handleAdminAction}      
        />

    </>
  )
}

export default AdminCourseDetailView