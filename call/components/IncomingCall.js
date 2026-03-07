function IncomingCall({ incomingCall, onAccept, onDecline }) {
  try {
    const [accepting, setAccepting] = React.useState(false);

    const handleAccept = async () => {
      setAccepting(true);
      try {
        const result = await answerCall(incomingCall);
        onAccept(result);
      } catch (error) {
        console.error('Accept call error:', error);
        setAccepting(false);
      }
    };

    const handleDecline = () => {
      incomingCall.close();
      onDecline();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" data-name="incoming-call" data-file="components/IncomingCall.js">
        <div className="glass-effect rounded-lg p-8 max-w-sm w-full shadow-2xl border border-gray-700 animate-pulse">
          <div className="text-center">
            <div className="w-24 h-24 bg-[var(--primary-color)] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="icon-phone-incoming text-5xl text-[var(--primary-color)]"></div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Incoming Call</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              From <span className="text-[var(--primary-color)] font-mono text-xl">{incomingCall.peer}</span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleDecline}
                disabled={accepting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-3 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div className="icon-phone-off text-xl"></div>
                Decline
              </button>
              
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded py-3 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {accepting ? (
                  <>
                    <div className="icon-loader animate-spin text-xl"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <div className="icon-phone text-xl"></div>
                    Accept
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('IncomingCall component error:', error);
    return null;
  }
}
