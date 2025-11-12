import React, { useState } from 'react';
import './ChatInterface.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [taskData, setTaskData] = useState(null);

  // Handle "Ask" button - for general chat
  const handleAsk = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to conversation
    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call chat API
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add bot response to conversation
      const botMessage = { text: data.message, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: 'Sorry, there was an error connecting to the server.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle "Create Task" button - for task creation
  const handleCreateTask = async () => {
    if (!inputMessage.trim()) return;

    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call create-task API
      const response = await fetch(`${API_URL}/api/create-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: currentMessage }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        // Show error in chat
        const errorMessage = {
          text: data.error || 'Could not create task. Please be more specific about the department and task.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        // Show confirmation modal
        setTaskData(data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = {
        text: 'Sorry, there was an error processing your task.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTask = async () => {
    setShowModal(false);
    setIsLoading(true);

    try {
      // Call the send-email endpoint
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: taskData.recipientEmail,
          subject: taskData.subject,
          body: taskData.body
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check backend logs.');
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication required
        if (data.authRequired) {
          const errorMessage = {
            text: `Gmail authorization required. Please visit ${API_URL}/api/auth/google to authorize.`,
            sender: 'bot'
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          // Handle other errors
          const errorMessage = {
            text: data.error || 'Failed to send email. Please try again.',
            sender: 'bot'
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        // Success! Add confirmation message
        const confirmMessage = {
          text: `✓ Task sent successfully to ${taskData.recipientName} (${taskData.recipientEmail})!`,
          sender: 'bot'
        };
        setMessages(prev => [...prev, confirmMessage]);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = {
        text: error.message || 'Failed to send email. Please ensure the backend server is running.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTaskData(null);
    }
  };

  const handleCancelTask = () => {
    setShowModal(false);
    setTaskData(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Assistant</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation by typing a message below</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message bot">
            <div className="message-content loading">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask a question, or describe a task for a department..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className="ask-button"
          onClick={handleAsk}
          disabled={isLoading || !inputMessage.trim()}
        >
          Ask
        </button>
        <button
          className="create-task-button"
          onClick={handleCreateTask}
          disabled={isLoading || !inputMessage.trim()}
        >
          Create Task
        </button>
      </div>

      {/* Task Confirmation Modal */}
      {showModal && taskData && (
        <div className="modal-overlay" onClick={handleCancelTask}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Task</h3>
            <div className="modal-details">
              <div className="modal-field">
                <label>To:</label>
                <span className="modal-value">
                  {taskData.recipientName}
                  <br />
                  <small style={{ color: '#666', fontSize: '14px' }}>
                    {taskData.recipientEmail}
                  </small>
                </span>
              </div>
              <div className="modal-field">
                <label>Subject:</label>
                <span className="modal-value">{taskData.subject}</span>
              </div>
              <div className="modal-field">
                <label>Message:</label>
                <span className="modal-value">{taskData.body}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={handleCancelTask}>
                Cancel
              </button>
              <button className="confirm-button" onClick={handleConfirmTask}>
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;
