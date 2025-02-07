import React, { useEffect, useState } from 'react'
import UserLayout from '../../components/common/UserLayout'
import CourseDetail from '../../components/common/CourseDetail'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchSingleCourse, initiateCheckout, resetCheckout } from '../../redux/slices/courseSlice'
import { Loader } from 'lucide-react'
import {loadStripe} from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_51Qp6mdRZhgmNkKQoW8Hp4xmJjjpuuC9iwjD0s1utEDyqLsByg7yXK81XadWBK751vQE8nbAMV5RmL11nw25aQrFh00zV21sORj')

const StudentCourseDetailView = () => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const {singleCourse, isCourseLoading, isCheckoutLoading, checkoutError, checkoutSession} = useSelector((state)=>state.course);
    const {id} = useParams();

    useEffect(() => {
    const fetchData = async () => {
        try {
        setLoading(true);
        await dispatch(fetchSingleCourse(id)).unwrap();
        } catch (error) {
        console.error('Failed to fetch Course:', error);
        } finally {
        setLoading(false);
        }
    };
    fetchData();
    }, [dispatch, id]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
          dispatch(resetCheckout());
        };
      }, [dispatch]);
    
      useEffect(()=>{
        const redirectToCheckout = async()=>{
          if(checkoutSession?.sessionId){
            const stripe = await stripePromise;
            const {error} = await stripe.redirectToCheckout({
              sessionId: checkoutSession.sessionId
            });
            if(error){
              console.error('Stripe redirect error:', error);
            }
          }
        };
        redirectToCheckout();
      }, [checkoutSession])

    const handleStudentAction = async ()=>{

        try{
            await dispatch(initiateCheckout(id));
        }catch(error){
            toast.error("Unexpected error occured")
        }
    }

    if (loading || !singleCourse || isCheckoutLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
        </div>
    );
    }


  return (
    <UserLayout>
        <CourseDetail
            course={singleCourse}
            variant="student"
            onAction={handleStudentAction}      
        />

    </UserLayout>
  )
}

export default StudentCourseDetailView