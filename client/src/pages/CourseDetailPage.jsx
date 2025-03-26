import React, { useEffect, useState } from 'react'
import CourseDetail from '../components/common/CourseDetail'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchSingleCourse, initiateCheckout, resetCheckout } from '../redux/slices/courseSlice'
import { Loader } from 'lucide-react'
import {loadStripe} from '@stripe/stripe-js'
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';

const stripePromise = loadStripe('pk_test_51Qp6mdRZhgmNkKQoW8Hp4xmJjjpuuC9iwjD0s1utEDyqLsByg7yXK81XadWBK751vQE8nbAMV5RmL11nw25aQrFh00zV21sORj')

const CourseDetailPage = () => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {singleCourse, isCourseLoading, isCheckoutLoading, checkoutError, checkoutSession} = useSelector((state)=>state.course);
    const {id} = useParams();
    const {role, userData} = useSelector((state)=>state.auth)

    useEffect(() => {
    const fetchData = async () => {
        try {
        setLoading(true);
        await dispatch(fetchSingleCourse({id,user:true})).unwrap();
        } catch (error) {
        console.error('Failed to fetch Course:', error);
        navigate("*");
        
        } finally {
        setLoading(false);
        }
    };
    fetchData();
    }, [dispatch, id]);
    

    useEffect(() => {
      // Clear any existing checkout session when component mounts
      dispatch(resetCheckout());
    }, [dispatch]);
    
    useEffect(() => {
      const redirectToCheckout = async () => {
        if (!checkoutSession) {
          return;
        }
    
        try {
          const stripe = await stripePromise;
          const { error } = await stripe.redirectToCheckout({
            sessionId: checkoutSession,
          });
    
          if (error) {
            throw error;
          }
        } catch (error) {
          console.error('Stripe redirect failed:', error);
          toast.error("Payment session expired or invalid. Please try again.");
        } finally {
          // Always clear the session after attempt
          dispatch(resetCheckout());
        }
      };
    
      redirectToCheckout();
    }, [checkoutSession, dispatch]);

    const handleStudentAction = async ()=>{

        try{
            await dispatch(initiateCheckout(id));
        }catch(error){
            toast.error("Unexpected error occured")
        }
    }

    if (loading || !singleCourse || isCheckoutLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
    }


  return (
    <>
     { role === "tutor" && userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) :(
        <CourseDetail
            course={singleCourse}
            variant={role}
            onAction={handleStudentAction}      
        />
      )}
    </>
  )
}

export default CourseDetailPage