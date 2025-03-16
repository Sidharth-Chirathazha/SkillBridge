// src/pages/student/VideoCallPage.jsx
import { useSelector } from 'react-redux';
import VideoCall from '../components/common/VideoCall';
import { useParams } from 'react-router-dom';


const VideoCallPage = () => {
  const { roomId } = useParams();
  const currentUser = useSelector(state => state.auth.userData?.user);

  return (
    <div className="h-screen w-screen">
      <VideoCall
        roomID={roomId}
        userId={currentUser?.id.toString()}
        userName={`${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim()}

      />
    </div>
  );
};

export default VideoCallPage;