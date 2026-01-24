import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { formatCurrencyShort } from '../utils/currency';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your AI assistant. How can I help you book a home service today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chatbot/message', { message: userMessage });
      const botResponse = response.data;

      setMessages(prev => [...prev, { type: 'bot', text: botResponse.message }]);
      setSuggestions(botResponse);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookProvider = async (providerId, serviceId) => {
    if (!suggestions) return;

    const bookingDate = suggestions.suggestedDateTime?.date || new Date().toISOString().split('T')[0];
    const bookingTime = suggestions.suggestedDateTime?.time || '10:00';

    try {
      const response = await axios.post('/api/chatbot/book', {
        provider_id: providerId,
        service_id: serviceId,
        booking_date: bookingDate,
        booking_time: bookingTime,
        service_address: prompt('Please enter your service address:') || '',
        urgency_level: suggestions.urgency,
        total_cost: suggestions.service?.base_price || null
      });

      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: `Great! Your booking has been created successfully. Booking ID: ${response.data.booking.booking_id}` 
      }]);
      setSuggestions(null);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, there was an error creating your booking. Please try again.' 
      }]);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {suggestions && suggestions.suggestedProviders && suggestions.suggestedProviders.length > 0 && (
        <div className="chatbot-suggestions">
          <h4>Suggested Providers:</h4>
          {suggestions.suggestedProviders.map((provider) => (
            <div key={provider.provider_id} className="provider-suggestion">
              <div>
                <strong>{provider.business_name || `${provider.first_name} ${provider.last_name}`}</strong>
                <p>Rating: {provider.rating ? parseFloat(provider.rating).toFixed(1) : 'N/A'} ⭐ | Rate: {formatCurrencyShort(provider.hourly_rate)}/hr</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => handleBookProvider(provider.provider_id, suggestions.service?.service_id)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
