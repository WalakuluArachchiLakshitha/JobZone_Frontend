import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatbotApi } from '../api/chatbotApi';
import './Chatbot.css';

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hello! 👋 I'm JobZone Assistant. How can I help you today?",
      suggestions: ['Show latest jobs', 'How to apply?', 'About JobZone', 'Create resume'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatbotApi.sendMessage(text.trim());
      const botMsg = {
        role: 'bot',
        text: res.text || "I'm sorry, I couldn't understand that.",
        suggestions: res.suggestions || [],
        jobs: res.jobs || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '😔 Sorry, something went wrong. Please try again.', suggestions: ['Show latest jobs', 'How to apply?'] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
    setIsOpen(false);
  };

  // Format text with basic markdown-style bold
  const formatText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
        type="button"
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.03 2 11c0 2.885 1.512 5.437 3.87 7.027a1 1 0 0 1 .374.966l-.515 2.578a1 1 0 0 0 1.378 1.109l2.793-1.396a1 1 0 0 1 .836-.046C11.16 21.69 11.583 22 12 22c5.523 0 10-4.03 10-9s-4.477-9-10-9z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-header__avatar">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="chatbot-header__title">JobZone Assistant</h4>
                <span className="chatbot-header__status">Online • Ready to help</span>
              </div>
            </div>
            <button className="chatbot-header__close" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                <div className="chatbot-msg__avatar">
                  {msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="chatbot-msg__content">
                  <div className="chatbot-msg__bubble">
                    {msg.text.split('\n').map((line, i) => (
                      <span key={i}>
                        {formatText(line)}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>

                  {/* Job results */}
                  {msg.jobs && msg.jobs.length > 0 && (
                    <div className="chatbot-jobs">
                      {msg.jobs.map((job) => (
                        <button
                          key={job._id}
                          className="chatbot-job-card"
                          onClick={() => handleJobClick(job._id)}
                        >
                          <span className="chatbot-job-title">{job.title}</span>
                          <span className="chatbot-job-meta">{job.company} • {job.location}</span>
                          <span className="chatbot-job-type">{job.type}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="chatbot-suggestions">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          className="chatbot-suggestion-btn"
                          onClick={() => handleSuggestionClick(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-msg chatbot-msg--bot">
                <div className="chatbot-msg__avatar"><Bot size={16} /></div>
                <div className="chatbot-msg__content">
                  <div className="chatbot-msg__bubble chatbot-msg__bubble--typing">
                    <Loader2 size={16} className="chatbot-typing-icon" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="chatbot-input__field"
            />
            <button
              type="submit"
              className="chatbot-input__send"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
