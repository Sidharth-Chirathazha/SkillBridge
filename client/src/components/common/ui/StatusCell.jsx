import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, ShieldOff } from 'lucide-react';

const StatusCell = ({ type, status }) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'active':
        return status ? {
          icon: <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />,
          text: 'Active',
          style: 'bg-green-50 text-green-600'
        } : {
          icon: <Clock className="h-3 w-3 sm:h-4 sm:w-4" />,
          text: 'Blocked',
          style: 'bg-yellow-50 text-yellow-600'
        };
      
      case 'verification':
        return status ? {
          icon: <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" />,
          text: 'Verified',
          style: 'bg-blue-50 text-blue-600'
        } : {
          icon: <ShieldOff className="h-3 w-3 sm:h-4 sm:w-4" />,
          text: 'Pending',
          style: 'bg-gray-50 text-gray-600'
        };
      
      default:
        return {
          icon: <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />,
          text: 'Unknown',
          style: 'bg-gray-50 text-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <td className="p-2 sm:p-4">
      <div className="flex items-center">
        <div className={`flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${config.style} whitespace-nowrap`}>
          {config.icon}
          <span className="text-xs sm:text-sm font-medium hidden xs:inline">{config.text}</span>
          {/* Mobile view - show only icon with tooltip */}
          <span className="text-xs font-medium xs:hidden" title={config.text}>
            {config.text}
          </span>
        </div>
      </div>
    </td>
  );
};

export default StatusCell;