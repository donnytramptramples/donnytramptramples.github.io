function ReactionOverlay({ reactions }) {
  try {
    return (
      <div className="fixed inset-0 pointer-events-none z-40" data-name="reaction-overlay" data-file="components/ReactionOverlay.js">
        {reactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute text-4xl animate-float-up"
            style={{
              left: `${reaction.x}%`,
              bottom: '20%',
              animation: 'float-up 3s ease-out forwards'
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('ReactionOverlay component error:', error);
    return null;
  }
}
