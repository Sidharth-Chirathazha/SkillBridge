import React, { useState } from 'react';

const MembersList = ({ members, onlineUserIds=[] }) => {
  const [search, setSearch] = useState('');
    
  const filteredMembers = search.trim() 
    ? members.filter(member => 
        member.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getStatusColor = (memberId) => {
    return onlineUserIds.includes(String(memberId)) ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusText = (memberId) => {
    return onlineUserIds.includes(String(memberId)) ? 'Online' : 'Offline';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 px-2">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full py-2 pl-3 pr-8 text-sm bg-background-100 border-0 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-400 hover:text-text-500"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      {filteredMembers.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-text-400 text-sm">
          No members found
        </div>
      ) : (
        <div className="overflow-y-auto space-y-1 pb-4">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center gap-3 px-3 py-2 hover:bg-background-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                {member.profile_pic_url ? (
                  <img
                    src={member.profile_pic_url}
                    alt={member.full_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`${!member.profile_pic_url ? 'flex' : 'hidden'} w-10 h-10 rounded-full bg-primary-100 items-center justify-center text-primary-600 font-medium border-2 border-white`}
                >
                  {getInitials(member.full_name)}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.id)}`}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-500 truncate">
                  {member.full_name}
                </div>
                <div className="text-xs text-text-400 truncate">
                  {/* This would be a real status message in a production app */}
                  {getStatusText(member.id)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersList;