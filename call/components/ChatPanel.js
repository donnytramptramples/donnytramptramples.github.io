function ChatPanel({ messages, onSendMessage, onClose }) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto‑focus input when panel opens
  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col glass-effect relative z-20 pointer-events-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.sender === "me";

          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[75%]">
                
                {/* Sender label */}
                <div
                  className={`text-xs mb-1 ${
                    isMe ? "text-right text-blue-400" : "text-left text-gray-400"
                  }`}
                >
                  {isMe ? "You" : "Them"}
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-700 text-white rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-4 border-t border-gray-700 flex gap-2 relative z-50 pointer-events-auto">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Expose globally (required for your setup)
window.ChatPanel = ChatPanel;
