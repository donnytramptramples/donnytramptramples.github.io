function ChatPanel({ messages, onSendMessage, onClose }) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col glass-effect">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Chat</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className="bg-gray-700 px-3 py-2 rounded">
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="flex-1 bg-gray-800 text-white px-3 py-2"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

// ✅ expose globally
window.ChatPanel = ChatPanel;
