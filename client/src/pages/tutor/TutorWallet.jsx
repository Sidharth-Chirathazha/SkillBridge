import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, fetchWallet } from '../../redux/slices/authSlice';
import { Loader } from 'lucide-react';
import WalletComponent from '../../components/common/Wallet';
import Pagination from '../../components/common/ui/Pagination';
import TutorVerificationMessage from '../../components/tutor/TutorVerificationMessage';

const TutorWallet = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const dispatch = useDispatch();
  const {walletData, transactionsData, currentPage, totalPages} = useSelector((state)=>state.auth);

  const {role, userData} = useSelector((state)=>state.auth);

  useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            dispatch(fetchWallet()).unwrap(),
            dispatch(fetchTransactions({page, pageSize})).unwrap()
          ]);
        } catch (error) {
          console.error('Failed to wallet data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [dispatch,page]);


    if (loading || !walletData || !transactionsData) {
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
        <>
          <WalletComponent
              userRole={"user"}
              walletData={walletData}
              transactions={transactionsData}
          />
          <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
          />
        </>
      )}
    </>
  )
}

export default TutorWallet