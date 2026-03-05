class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--dark-bg)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Something went wrong</h1>
            <p className="text-[var(--text-secondary)] mb-4">Please reload the page</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[var(--primary-color)] text-white rounded">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  try {
    const [peerId, setPeerId] = React.useState('');
    const [peer, setPeer] = React.useState(null);
    const [callState, setCallState] = React.useState('idle');
    const [incomingCall, setIncomingCall] = React.useState(null);
    const [currentCall, setCurrentCall] = React.useState(null);
    const [notification, setNotification] = React.useState(null);

    React.useEffect(() => {
      const peerInstance = initializePeer(setPeerId, setIncomingCall, setNotification);
      setPeer(peerInstance);
      return () => peerInstance?.destroy();
    }, []);

    const showNotification = (message, type = 'info') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    };

    return (
      <div className="min-h-screen" data-name="app" data-file="app.js">
        {callState === 'idle' && (
          <IdScreen 
            peerId={peerId} 
            peer={peer} 
            onCallStart={(call) => {
              setCurrentCall(call);
              setCallState('calling');
            }}
            showNotification={showNotification}
          />
        )}
        
        {callState === 'calling' && (
          <VideoCall 
            call={currentCall}
            onHangup={() => {
              setCallState('idle');
              setCurrentCall(null);
            }}
          />
        )}

        {incomingCall && (
          <IncomingCall 
            incomingCall={incomingCall}
            onAccept={(call) => {
              setCurrentCall(call);
              setCallState('calling');
              setIncomingCall(null);
            }}
            onDecline={() => setIncomingCall(null)}
          />
        )}

        {notification && <Notification message={notification.message} type={notification.type} />}
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);