function JitsiCall({ roomName, onHangup }) {
  try {
    const jitsiContainerRef = React.useRef(null);
    const jitsiApiRef = React.useRef(null);

    React.useEffect(() => {
      if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
        return;
      }

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'recording', 'etherpad', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'stats', 'shortcuts',
            'tileview', 'download', 'help', 'mute-everyone'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      jitsiApiRef.current.addEventListener('readyToClose', () => {
        onHangup();
      });

      return () => {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }
      };
    }, [roomName, onHangup]);

    return (
      <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="components/JitsiCall.js">
        <div ref={jitsiContainerRef} className="w-full h-full"></div>
      </div>
    );
  } catch (error) {
    console.error('JitsiCall component error:', error);
    return null;
  }
}