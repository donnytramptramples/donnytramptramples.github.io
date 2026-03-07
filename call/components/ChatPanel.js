function ChatPanel({ messages, onSendMessage, onClose }) {
  try {
    const [input, setInput] = React.useState('');
    const messagesEndRef = React.useRef(null);

    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
      if (input.trim()) {
        onSendMessage(input);
        setInput('');
      }
    };

    return (
      <div className="h-full flex flex-col glass-effect" data-name="chat-panel" data-file="components/ChatPanel.js">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Chat</h3>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center hover:bg-[var(--dark-surface)] transition-colors">
            <div className="icon-x text-lg"></div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                msg.sender === 'me' ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--dark-surface)]'
              }`}>
                <p className="text-sm break-words">{msg.text}</p>
                <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-[var(--dark-surface)] border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 bg-[var(--primary-color)] hover:bg-opacity-80 rounded flex items-center justify-center transition-colors"
            >
              <div className="icon-send text-lg"></div>
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ChatPanel component error:', error);
    return null;
  }
}
