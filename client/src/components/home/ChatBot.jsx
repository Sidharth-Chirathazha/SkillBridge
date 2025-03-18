import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Send, X, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import axiosInstance from '../../api/axios.Config';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm SkillBridge Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Focus input when chat opens
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post('/chatbot/chat/', { message: userMessage });
      setMessages(prev => [...prev, { text: response.data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, 
        { text: 'Sorry, I encountered an error. Please try again later.', sender: 'bot' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Example suggestions to help users get started
  const suggestions = [
    "What courses do you offer?",
    "How do I purchase a course?",
    "Tell me about tutor communities",
    "How can I get study tips?"
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-lg hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 ring-4 ring-background-100"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={28} className="text-white" />
        </button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <div className="flex flex-col bg-background-50 rounded-2xl shadow-2xl w-80 md:w-96 overflow-hidden border border-background-300 transition-all duration-300">
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-primary text-white px-4 py-3 shadow-md">
            <div className="flex items-center">
              <Bot size={20} className="mr-2" />
              <h3 className="font-medium">SkillBridge Assistant</h3>
            </div>
            <div className="flex items-center space-x-1">
              {/* Toggle Minimize Button */}
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="p-1.5 hover:bg-primary-600 rounded-full transition-colors"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-primary-600 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Area - Only shown when not minimized */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-background-100">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 ${msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                  >
                    {/* Avatar for bot messages */}
                    {msg.sender === 'bot' && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}
                    
                    <div 
                      className={`px-4 py-3 rounded-2xl max-w-xs md:max-w-sm break-words shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-secondary text-white rounded-tr-none' 
                          : 'bg-background-200 text-text rounded-tl-none'
                      }`}
                    >
                      {msg.sender === 'bot' ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                    
                    {/* Avatar for user messages */}
                    {msg.sender === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center ml-2 flex-shrink-0 shadow-sm">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-background-200 text-text rounded-tl-none flex items-center space-x-1 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions - Only shown for new conversations */}
              {messages.length <= 2 && (
                <div className="px-4 py-3 bg-background-50 border-t border-background-200">
                  <p className="text-xs text-text-400 mb-2 font-medium">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button 
                        key={index}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors border border-primary-100"
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => sendMessage(), 100);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="flex items-center p-3 border-t border-background-200 bg-background-50">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 border border-background-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300 bg-background-50 text-text"
                />
                <button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()} 
                  className={`ml-2 p-2.5 rounded-full transition-colors ${
                    isLoading || !input.trim() 
                      ? 'bg-background-300 text-background-500 cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primary-600'
                  }`}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}

          {/* Minimized State Hint */}
          {isMinimized && (
            <div className="px-4 py-2 text-center text-text-400 text-sm bg-background-50">
              Chat minimized. Click the arrow to expand.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;