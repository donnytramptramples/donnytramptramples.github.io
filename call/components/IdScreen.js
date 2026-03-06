function IdScreen({ peerId, peer, onCallStart, showNotification }) {
  try {
    const [targetId, setTargetId] = React.useState('');
    const [calling, setCalling] = React.useState(false);

    const handleCall = async () => {
      if (!targetId.trim()) {
        showNotification('Please enter a Peer ID', 'error');
        return;
      }

      if (targetId === peerId) {
        showNotification('Cannot call yourself', 'error');
        return;
      }

      setCalling(true);
      try {
        const result = await makeCall(peer, targetId, showNotification);
        onCallStart(result);
      } catch (error) {
        console.error('Call error:', error);
        showNotification('Call failed', 'error');
        setCalling(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4" data-name="id-screen" data-file="components/IdScreen.js">
        <div className="glass-effect rounded-lg p-8 max-w-md w-full shadow-xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[var(--primary-color)] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="icon-video text-4xl text-[var(--primary-color)]"></div>
            </div>
            <h1 className="text-3xl font-bold mb-2">P2P Video Call</h1>
            <p className="text-[var(--text-secondary)]">Secure peer-to-peer communication</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Your Peer ID</label>
            <div className="bg-[var(--dark-surface)] rounded px-4 py-3 text-center">
              <span className="text-2xl font-mono tracking-wider text-[var(--primary-color)]">
                {peerId || 'Loading...'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Enter Peer ID to Call</label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value.toUpperCase())}
              placeholder="XXXXX"
              className="w-full bg-[var(--dark-surface)] border border-gray-600 rounded px-4 py-3 text-lg font-mono tracking-wider focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              maxLength={5}
              disabled={calling}
            />
          </div>

          <button
            onClick={handleCall}
            disabled={calling || !peerId}
            className="w-full bg-[var(--primary-color)] hover:bg-opacity-80 text-white rounded py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {calling ? (
              <>
                <div className="icon-loader animate-spin text-xl"></div>
                Connecting...
              </>
            ) : (
              <>
                <div className="icon-phone text-xl"></div>
                Start Call
              </>
            )}
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('IdScreen component error:', error);
    return null;
  }
}