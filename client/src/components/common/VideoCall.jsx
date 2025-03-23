import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';



export default function VideoCall({roomID, userId, userName, onClose}) {
      
    const zpRef = useRef(null);
    const containerRef = useRef(null);
    
    useEffect(() => {
      const initializeCall = async () => {
        const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
  
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          userId,
          userName
        );
  
      zpRef.current = ZegoUIKitPrebuilt.create(kitToken);

      zpRef.current.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Personal link',
            url:
             window.location.protocol + '//' + 
             window.location.host + window.location.pathname +
              '?roomID=' +
              roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, 
        },
        showPreJoinView: false,
      });
    };

    if (roomID && userId && userName) {
      initializeCall();
    }

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [roomID, userId, userName]);


  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <button
        onClick={() => window.close()}
        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-50"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
