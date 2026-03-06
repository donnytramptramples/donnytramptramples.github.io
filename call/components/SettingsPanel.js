function SettingsPanel({ onClose }) {
  try {
    const [devices, setDevices] = React.useState({ audio: [], video: [] });

    React.useEffect(() => {
      navigator.mediaDevices.enumerateDevices().then(deviceList => {
        setDevices({
          audio: deviceList.filter(d => d.kind === 'audioinput'),
          video: deviceList.filter(d => d.kind === 'videoinput')
        });
      });
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" data-name="settings-panel" data-file="components/SettingsPanel.js">
        <div className="glass-effect rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center hover:bg-[var(--dark-surface)] transition-colors">
              <div className="icon-x text-lg"></div>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Microphone</label>
              <select className="w-full bg-[var(--dark-surface)] border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)]">
                {devices.audio.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || 'Microphone'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Camera</label>
              <select className="w-full bg-[var(--dark-surface)] border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)]">
                {devices.video.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || 'Camera'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SettingsPanel component error:', error);
    return null;
  }
}