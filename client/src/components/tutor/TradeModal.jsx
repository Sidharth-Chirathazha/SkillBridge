import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { sendTradeRequest, fetchCourses } from '../../redux/slices/courseSlice';
import toast from 'react-hot-toast';



const TradeModal = ({ isOpen, closeModal, requestedCourseData }) => {
  const [selectedCourse, setSelectedCourse] = useState('');

  const dispatch = useDispatch();

  const { tutorCoursesData } = useSelector(
    (state) => state.course
  );
   
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try{
      await dispatch(sendTradeRequest({requested_course:requestedCourseData?.id, offered_course:selectedCourse}));
      await dispatch(fetchCourses({ page:1, pageSize:8, status :'Approved', user:true })).unwrap();
      toast.success("Trade request sent successfully")
    }catch(error){
      toast.error("An Error Occured")
    }
    
    closeModal();
    setSelectedCourse('');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Trade Course
                  </Dialog.Title>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Course</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{requestedCourseData?.title}</p>
                      <p className="text-secondary-500 font-medium">₹{requestedCourseData?.price}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Course to Trade
                    </label>
                    <select
                      id="course"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a course</option>
                      {tutorCoursesData
                        ?.filter((course) => course.status==="Approved") // ✅ Only include verified courses
                        .map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title} - ₹{course.price}
                          </option>
                        ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                      Note: Only courses with matching prices can be traded
                    </p>
                  </div>


                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        disabled={!selectedCourse}
                      >
                        Send Trade Request
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TradeModal;