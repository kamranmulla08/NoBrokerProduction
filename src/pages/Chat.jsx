import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Chat.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Chat() {
  const { conversationId } = useParams();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] =
    useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("access_token");

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Load conversation and existing messages
  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("Please login to use chat.");
        }

        // Get conversation
        const conversationResponse = await fetch(
          `${API_BASE_URL}/api/chat/conversations/${conversationId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const conversationData =
          await conversationResponse.json();

        if (!conversationResponse.ok) {
          throw new Error(
            conversationData.error ||
              "Failed to load conversation."
          );
        }

        setConversation(conversationData);

        // Get existing messages
        const messagesResponse = await fetch(
          `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const messagesData =
          await messagesResponse.json();

        if (!messagesResponse.ok) {
          throw new Error(
            messagesData.error ||
              "Failed to load messages."
          );
        }

        setMessages(messagesData);

        // Mark messages as read
        await fetch(
          `${API_BASE_URL}/api/chat/conversations/${conversationId}/read/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [conversationId, token]);

  // Connect to WebSocket
  useEffect(() => {
    if (!conversationId || !token) {
      return;
    }

    const socketUrl =
      `ws://127.0.0.1:8000/ws/chat/` +
      `${conversationId}/?token=${encodeURIComponent(token)}`;

    console.log(
      "Connecting to WebSocket:",
      `ws://127.0.0.1:8000/ws/chat/${conversationId}/`
    );

    const socket = new WebSocket(socketUrl);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setSocketConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        console.log(
          "WebSocket message received:",
          message
        );

        if (message.error) {
          setError(message.error);
          return;
        }

        setMessages((currentMessages) => {
          // Prevent duplicate messages
          const alreadyExists =
            currentMessages.some(
              (item) => item.id === message.id
            );

          if (alreadyExists) {
            return currentMessages;
          }

          return [...currentMessages, message];
        });
      } catch (err) {
        console.error(
          "Invalid WebSocket message:",
          err
        );
      }
    };

    socket.onerror = (event) => {
      console.error(
        "WebSocket error:",
        event
      );

      setSocketConnected(false);
    };

    socket.onclose = (event) => {
      console.log(
        "WebSocket disconnected:",
        event.code
      );

      setSocketConnected(false);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [conversationId, token]);

  // Scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setSending(true);
      setError("");

      // Prefer WebSocket for real-time messaging
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            content: trimmedContent,
          })
        );

        setContent("");
        return;
      }

      // REST fallback if WebSocket is unavailable
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/send/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: trimmedContent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to send message."
        );
      }

      setMessages((currentMessages) => {
        const alreadyExists =
          currentMessages.some(
            (item) => item.id === data.data.id
          );

        if (alreadyExists) {
          return currentMessages;
        }

        return [...currentMessages, data.data];
      });

      setContent("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="chat-page">
          <div className="chat-loading">
            Loading chat...
          </div>
        </main>
      </>
    );
  }

  if (error && !conversation) {
    return (
      <>
        <Navbar />

        <main className="chat-page">
          <div className="chat-error">
            <h2>Unable to open chat</h2>

            <p>{error}</p>

            <Link to="/properties">
              Back to Properties
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="chat-page">
        <div className="chat-container">

          {/* Chat Header */}
          <div className="chat-header">
            <div>
              <Link
                to={`/properties/${conversation.property}`}
                className="chat-back"
              >
                ← Back to Property
              </Link>

              <h1>
                Chat with Owner
              </h1>

              <p>
                Property ID:{" "}
                {conversation.property}
              </p>
            </div>

            <div
              style={{
                fontSize: "13px",
                marginTop: "8px",
                color: socketConnected
                  ? "green"
                  : "#777",
              }}
            >
              {socketConnected
                ? "● Real-time connected"
                : "● Connecting..."}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="chat-error-message">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="messages-container">

            {messages.length === 0 ? (
              <div className="no-messages">
                <p>
                  No messages yet.
                </p>

                <span>
                  Start the conversation with
                  the property owner.
                </span>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="message-wrapper"
                >
                  <div className="message">

                    <div className="message-content">
                      {message.content}
                    </div>

                    <div className="message-info">
                      {new Date(
                        message.created_at
                      ).toLocaleString("en-IN")}
                    </div>

                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Message Input */}
          <form
            className="message-form"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              disabled={sending}
            />

            <button
              type="submit"
              disabled={
                sending ||
                !content.trim()
              }
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>
          </form>

        </div>
      </main>
    </>
  );
}

export default Chat;