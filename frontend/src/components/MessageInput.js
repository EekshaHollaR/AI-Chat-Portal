import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const MessageInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your message... (Shift+Enter for new line)"
        className="input-primary resize-none"
        rows={3}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="btn-primary flex-shrink-0"
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </button>
    </form>
  );
};

export default MessageInput;
