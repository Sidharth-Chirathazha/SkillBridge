import React, { useEffect, useState } from 'react'
import CourseDetail from '../components/common/CourseDetail'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchSingleCourse, initiateCheckout, resetCheckout } from '../redux/slices/courseSlice'
import {loadStripe} from '@stripe/stripe-js'
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';


const CourseDetailPage = () => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {singleCourse, isCourseLoading, isCheckoutLoading, checkoutError, checkoutSession} = useSelector((state)=>state.course);
    const {id} = useParams();
    const {role, userData} = useSelector((state)=>state.auth)
    const [stripe, setStripe] = useState(null);


    // Stripe Initialization
   useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        console.log('Stripe Initialized:', !!stripeInstance);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Stripe Initialization Error:', error);
        toast.error('Payment system could not be loaded');
      }
    };

    initializeStripe();
  }, []);

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
    
     // Checkout Redirect Effect
  useEffect(() => {
    const handleCheckoutRedirect = async () => {
      console.log('Checkout Debug:', {
        session: checkoutSession,
        stripeReady: !!stripe
      });

      if (!checkoutSession || !stripe) return;

      try {
        const { error } = await stripe.redirectToCheckout({
          sessionId: checkoutSession
        });

        if (error) {
          console.error('Checkout Redirect Error:', error);
          toast.error(error.message || 'Payment redirection failed');
        }
      } catch (error) {
        console.error('Checkout Process Exception:', error);
        toast.error('Payment processing encountered an error');
      } finally {
        dispatch(resetCheckout());
      }
    };

    handleCheckoutRedirect();
  }, [checkoutSession, stripe, dispatch]);

    const handleStudentAction = async ()=>{

      try {
        const result = await dispatch(initiateCheckout(id)).unwrap();
        console.log('Checkout Initiation Result:', result);
      } catch (error) {
        console.error('Checkout Initiation Error:', {
          message: error.message,
          details: error
        });
        toast.error(error.message || 'Failed to start payment process');
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