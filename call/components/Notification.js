function Notification({ message, type = 'info' }) {
  try {
    const bgColor = type === 'error' ? 'bg-red-600' : 'bg-[var(--primary-color)]';
    
    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in" data-name="notification" data-file="components/Notification.js">
        <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
          <div className={`${type === 'error' ? 'icon-circle-x' : 'icon-circle-check'} text-xl`}></div>
          <span className="font-medium">{message}</span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Notification component error:', error);
    return null;
  }
}