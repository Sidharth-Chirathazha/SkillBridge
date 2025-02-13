import React from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import {format} from 'date-fns'

const WalletComponent = ({ userRole, walletData, transactions }) => {
  // Dummy data for transactions
 
  // Dynamic styles based on user role
  const isAdmin = userRole === 'admin';
  const themeStyles = {
    background: isAdmin ? 'bg-background-100' : 'bg-background-500',
    card: isAdmin ? 'bg-background-50' : 'bg-background-50',
    primaryText: isAdmin ? 'text-primary-700' : 'text-primary-500',
    secondaryText: isAdmin ? 'text-text-400' : 'text-text-300',
  };

  const formatDate = (isoString)=>{
    return format(new Date(isoString), "MMMM d, yyyy h:mm a");
  }

  return (
    <div className={`p-4 md:p-6 ${themeStyles.background} min-h-screen`}>
      {/* Balance Card */}
      <div className="mb-6">
        <div className={`${themeStyles.card} rounded-lg border border-background-200 shadow-sm`}>
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className={`h-5 w-5 ${themeStyles.primaryText}`} />
              <h2 className="text-lg font-semibold">Wallet Balance</h2>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl md:text-3xl font-bold">₹{walletData?.balance}</span>
              <span className={`ml-2 ${themeStyles.secondaryText} text-sm`}>INR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className={`${themeStyles.card} rounded-lg border border-background-200 shadow-sm`}>
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className={`h-5 w-5 ${themeStyles.primaryText}`} />
            <h2 className="text-lg font-semibold">Transaction History</h2>
          </div>
          
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-3 md:p-4 rounded-lg border border-background-200 hover:bg-background-100 transition-colors duration-300"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className={`p-2 rounded-full ${
                      transaction.transaction_type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' 
                        ? <ArrowDownLeft className="h-4 w-4" /> 
                        : <ArrowUpRight className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">{transaction.description}</p>
                      <p className={`text-xs md:text-sm ${themeStyles.secondaryText}`}>
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-auto">
                    <p className={`font-medium text-sm md:text-base ${
                      transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </p>
                    <p className={`text-xs md:text-sm ${themeStyles.secondaryText} capitalize`}>
                      success
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletComponent;