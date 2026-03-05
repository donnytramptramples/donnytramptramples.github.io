function VideoCall({ call, onHangup }) {
  try {
    const localVideoRef = React.useRef(null);
    const remoteVideoRef = React.useRef(null);
    const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
    const [isScreenSharing, setIsScreenSharing] = React.useState(false);
    const originalStreamRef = React.useRef(null);

    React.useEffect(() => {
      if (localVideoRef.current && call.localStream) {
        localVideoRef.current.srcObject = call.localStream;
        originalStreamRef.current = call.localStream;
      }
      if (remoteVideoRef.current && call.remoteStream) {
        remoteVideoRef.current.srcObject = call.remoteStream;
      }
    }, [call]);

    const toggleAudio = () => {
      const audioTracks = call.localStream.getAudioTracks();
      audioTracks.forEach(track => track.enabled = !track.enabled);
      setIsAudioEnabled(!isAudioEnabled);
    };

    const toggleVideo = () => {
      const videoTracks = call.localStream.getVideoTracks();
      videoTracks.forEach(track => track.enabled = !track.enabled);
      setIsVideoEnabled(!isVideoEnabled);
    };

    const toggleScreenShare = async () => {
      try {
        if (!isScreenSharing) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const videoTrack = screenStream.getVideoTracks()[0];
          
          const sender = call.call.peerConnection.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          videoTrack.onended = () => {
            toggleScreenShare();
          };
          
          setIsScreenSharing(true);
        } else {
          const videoTrack = originalStreamRef.current.getVideoTracks()[0];
          const sender = call.call.peerConnection.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = originalStreamRef.current;
          }
          
          setIsScreenSharing(false);
        }
      } catch (error) {
        console.error('Screen share error:', error);
      }
    };

    const handleHangup = () => {
      call.localStream.getTracks().forEach(track => track.stop());
      call.call.close();
      onHangup();
    };

    return (
      <div className="relative h-screen bg-black" data-name="video-call" data-file="components/VideoCall.js">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-64 h-48 object-cover rounded-lg border-2 border-[var(--primary-color)] shadow-lg"
        />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="glass-effect rounded-lg px-6 py-4 max-w-md mx-auto flex items-center justify-center gap-4">
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isAudioEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <div className={`${isAudioEnabled ? 'icon-mic' : 'icon-mic-off'} text-xl`}></div>
            </button>

            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <div className={`${isVideoEnabled ? 'icon-video' : 'icon-video-off'} text-xl`}></div>
            </button>

            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isScreenSharing ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
              }`}
            >
              <div className="icon-monitor text-xl"></div>
            </button>

            <button
              onClick={handleHangup}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
            >
              <div className="icon-phone-off text-xl"></div>
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('VideoCall component error:', error);
    return null;
  }
}