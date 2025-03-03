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
        } finally {
        setLoading(false);
        }
    };
    fetchData();
    }, [dispatch, id]);

    console.log("Course detail in course detial page:", singleCourse);
    

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