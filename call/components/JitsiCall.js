function JitsiCall({ roomName, onHangup }) {
  try {
    const iframeRef = React.useRef(null);
    const [iframeLoaded, setIframeLoaded] = React.useState(false);

    React.useEffect(() => {
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'jitsi-hangup') {
          onHangup();
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onHangup]);

    const handleIframeLoad = () => {
      setIframeLoaded(true);
    };

    const jitsiUrl = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false`;

    return (
      <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="components/JitsiCall.js">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center glass-effect">
            <div className="text-center">
              <div className="icon-loader animate-spin text-4xl text-[var(--primary-color)] mb-4"></div>
              <p className="text-lg">Connecting to video call...</p>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={jitsiUrl}
          allow="camera; microphone; display-capture; fullscreen"
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
        />

        <button
          onClick={onHangup}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all z-50"
        >
          <div className="icon-phone-off text-xl text-white"></div>
        </button>
      </div>
    );
  } catch (error) {
    console.error('JitsiCall component error:', error);
    return null;
  }
}
