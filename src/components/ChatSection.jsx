import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ChatSection = ({ recipientPhone, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Fetch messages from DB whenever recipient changes
  useEffect(() => {
    if (!recipientPhone) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/sms/list`, {
          params: { to: recipientPhone },
          headers: { "Content-Type": "application/json" },
        });

        if (res.data.success) {
          setMessages(
            res.data.data.map((msg) => ({
              id: msg.id,
              text: msg.body,
              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              // ✅ Correctly identify inbound vs outbound
              sender:
                msg.direction === "outbound" || msg.from.startsWith("+1835")
                  ? "outbound"
                  : "inbound",
              read: msg.status === "delivered",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [recipientPhone]);

  // ✅ Handle sending new messages
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !recipientPhone) return;

    const formattedPhone = recipientPhone.startsWith("+")
      ? recipientPhone
      : `+${recipientPhone}`;

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "outbound",
      read: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    try {
      await fetch(`${API_URL}/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formattedPhone,
          message: newMessage,
        }),
      });
    } catch (error) {
      console.error("Twilio API error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div
      className="chat-panel"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* ✅ Chat Header */}
      <div
        className="chat-header"
        style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
      >
        <h3>{recipientName || "Select a recipient"}</h3>
      </div>

      {/* ✅ Chat Messages */}
      <div
        className="chat-thread"
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender}`}
            style={{
              alignSelf:
                message.sender === "outbound" ? "flex-end" : "flex-start",
              backgroundColor:
                message.sender === "outbound" ? "#DCF8C6" : "#FFF",
              color: "#000",
              padding: "8px 12px",
              borderRadius: "15px",
              maxWidth: "70%",
              boxShadow: "0px 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ margin: 0 }}>{message.text}</p>
            <span
              className="chat-time"
              style={{
                fontSize: "0.7em",
                color: "#555",
                marginTop: "4px",
                display: "block",
                textAlign: "right",
              }}
            >
              {message.time}
            </span>
          </div>
        ))}
      </div>

      {/* ✅ Input Area */}
      <div
        className="chat-input-area"
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ccc",
          gap: "8px",
        }}
      >
        <input
          type="text"
          placeholder="Write your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
          }}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          style={{
            backgroundColor: "#007bff",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
