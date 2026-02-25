import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

function Chat() {

  const { user, logout } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [room, setRoom] = useState("general");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const username = user?.user?.username;
  const chatContainerRef = useRef(null);
  //const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  // 🔥 Generate Private Room
  const generatePrivateRoom = (user1, user2) => {
    return [user1, user2].sort().join("_");
  };
  

  // 🔥 Fetch All Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/all-users");
        const data = await res.json();
        setAllUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  // 🔥 CONNECT + LISTENERS (RUN ONCE)
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("previous_messages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_typing", (author) => {
      setTypingUser(author);
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });
    // 🔥 Delivered
    socket.on("message_delivered", (id) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id ? { ...msg, status: "delivered" } : msg
        )
      );
    });

      // 🔥 Read
      socket.on("messages_read", () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.author === username
              ? { ...msg, status: "read" }
              : msg
          )
        );
      });
      

    return () => {
      socket.off("previous_messages");
      socket.off("receive_message");
      socket.off("online_users");
      socket.off("user_typing");
      socket.off("stop_typing");
      socket.off("message_delivered");
      socket.off("messages_read");
      socket.disconnect();
    };
  }, []);

  // 🔥 JOIN ROOM WHEN ROOM OR USER CHANGES
  useEffect(() => {
    if (!room || !username || !socket.connected) return;

    socket.emit("join_room", {
      room,
      author: username,
    });

  }, [room, username]);

  // 🔥 Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // arrown down bro
  useEffect(() => {
    const container = chatContainerRef.current;
  
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
  
      // If user is NOT at bottom
      if (scrollHeight - scrollTop > clientHeight + 50) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };
  
    container.addEventListener("scroll", handleScroll);
  
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  //deleting messages
  useEffect(() => {
    socket.on("deleteMessage", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });
  
    socket.on("clearChat", () => {
      setMessages([]);
    });
  
    return () => {
      socket.off("deleteMessage");
      socket.off("clearChat");
    };
  }, []);

  // theme bro
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  // toggle theme

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  // 🔥 Send Message
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      room,
      author: username,
      message,
    });

    socket.emit("stop_typing", { room });

    setMessage("");
  };

  const isOwn = (msg) => msg.author === username;
  const formatTime = (dateString) => {
    const date = new Date(dateString);
  
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formatDateLabel = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
  
    yesterday.setDate(today.getDate() - 1);
  
    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }
  
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
  
    return messageDate.toLocaleDateString("en-IN");
  };



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
  style={{
    ...styles.container,
    backgroundColor: theme === "dark" ? "#1e1e1e" : "#f5f5f5",
  }}
>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h3 style={{ color: "#fff" }}>Online Users</h3>

        {/* General Room */}
        <div
          style={styles.roomBox}
          onClick={() => setRoom("general")}
        >
          # General
        </div>

        {/* Private Users */}
        {allUsers
          .filter((u) => u.username !== username)
          .map((u) => {
            const isOnline = onlineUsers.includes(u.username);

            return (
              <div
                key={u._id}
                style={styles.roomBox}
                onClick={() =>
                  setRoom(generatePrivateRoom(username, u.username))
                }
              >
                {u.username}
                <span
                  style={{
                    color: isOnline ? "lightgreen" : "gray",
                    marginLeft: "8px",
                  }}
                >
                  ●
                </span>
              </div>
            );
          })}

        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Chat Area */}
      <div
  style={{
    ...styles.chatArea,
    //backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
    backgroundColor: theme === "dark" ? "#0b141a" : "#ece5dd",
    //color: theme === "dark" ? "#ffffff" : "#000000",
  }}
>
<div
  style={{
    ...styles.header,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
  }}
>
  <span style={{ fontWeight: "600" }}>
    Room: {room}
  </span>

  <button
    onClick={toggleTheme}
    style={{
      padding: "6px 14px",
      borderRadius: "20px",
      border: "none",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      backgroundColor: theme === "dark" ? "#444" : "#e0e0e0",
      color: theme === "dark" ? "#fff" : "#000",
      transition: "0.2s ease",
    }}
  >
    {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
  </button>
</div>

        <div style={styles.messages} ref={chatContainerRef}>
        {messages.map((msg, index) => {

const showDate =
  index === 0 ||
  formatDateLabel(messages[index - 1].createdAt) !==
    formatDateLabel(msg.createdAt);

return (
  <div key={index}
  style={{
    display: "flex",
    flexDirection: "column",
    //alignItems: isOwn(msg) ? "flex-end" : "flex-start",
    marginBottom: "6px",
  }}>

    {/* 📅 Date Label */}
    {showDate && (
      <div
        style={{
          textAlign: "center",
          margin: "10px 0",
          fontSize: "13px",
          opacity: 0.7,
          fontWeight: "500",
        }}
      >
        {formatDateLabel(msg.createdAt)}
      </div>
    )}

    {/* 💬 Message Bubble */}
    <div
      style={{
        ...styles.message,
        alignSelf: isOwn(msg) ? "flex-end" : "flex-start",
        backgroundColor: isOwn(msg)
          ? theme === "dark"
            ? "#005c4b"
            : "#d9fdd3"
          : theme === "dark"
            ? "#2a3942"
            : "#ffffff",
        color: theme === "dark" ? "#e9edef" : "#000000",
        maxWidth: "65%",
        padding: "8px 12px",
        borderRadius: "12px",
        wordBreak: "break-word",
      }}
    >
      {!isOwn(msg) && (
        <div style={styles.sender}>{msg.author}</div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>{msg.message}</span>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            marginTop: "4px",
            opacity: 0.8,
          }}
        >
          <span>{formatTime(msg.createdAt)}</span>

          {isOwn(msg) && (
            <>
              {msg.status === "sent" && "✓"}
              {msg.status === "delivered" && "✓✓"}
              {msg.status === "read" && (
                <span style={{ color: "#34b7f1" }}>✓✓</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>


  </div>
);
})}
          {/* {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: isOwn(msg) ? "flex-end" : "flex-start",
                //backgroundColor: isOwn(msg) ? "#dcf8c6" : "#ffffff",
                backgroundColor: isOwn(msg)
                  ? theme === "dark"
                    ? "#005c4b"
                    : "#d9fdd3"
                  : theme === "dark"
                    ? "#2a3942"
                    : "#ffffff",
                color: theme === "dark" ? "#e9edef" : "#000000",
              }}
            >
              {!isOwn(msg) && (
                <div style={styles.sender}>{msg.author}</div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span>{msg.message}</span>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    marginTop: "4px",
                    opacity: 0.8,
                  }}
                >
                  <span>{formatTime(msg.createdAt)}</span>

                {isOwn(msg) && (
                  <>
                    {msg.status === "sent" && "✓"}
                    {msg.status === "delivered" && "✓✓"}
                    {msg.status === "read" && (
                      <span style={{ color: "#34b7f1" }}>✓✓</span>
                    )}
                  </>
                )}
              </div>
              </div>
              </div>
          ))} */}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typingUser && typingUser !== username && (
  <div style={styles.typingIndicator}>
    {typingUser} is typing...
  </div>
)}
{showScrollBtn && (
  <button
    onClick={scrollToBottom}
    style={{
      position: "absolute",
      bottom: "80px",
      right: "30px",
      width: "45px",
      height: "45px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      backgroundColor: "rgba(0,0,0,0.85)",
      color: "white",
      fontSize: "18px",
      fontWeight: "bold",
      transform: "rotate(90deg)",   // 🔥 THIS IS THE MAGIC
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    }}
  >
    {'>>'}
  </button>
)}
        <div style={styles.inputArea}>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);

              socket.emit("typing", {
                room,
                author: username,
              });

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { room });
              }, 1500);
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={styles.input}
          />

          <button onClick={sendMessage} style={styles.sendBtn}>
            ➤
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  typingIndicator: {
    alignSelf: "flex-start",
    background: "linear-gradient(135deg, #25D366, #128C7E)",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    marginLeft: "10px",
    marginBottom: "8px",
    fontWeight: "500",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    animation: "fadeIn 0.2s ease-in-out"
  },
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#ece5dd",
  },

  sidebar: {
    width: "250px",
    backgroundColor: "#075e54",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  roomBox: {
    backgroundColor: "#128c7e",
    padding: "10px",
    borderRadius: "8px",
    color: "#fff",
    marginBottom: "15px",
    cursor: "pointer",
  },

  logoutBtn: {
    marginTop: "auto",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    cursor: "pointer",
  },

  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  header: {
    backgroundColor: "#ededed",
    padding: "15px",
    borderBottom: "1px solid #ddd",
    fontWeight: "bold",
  },

  messages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    overflowY: "auto",
  },

  message: {
    padding: "10px 15px",
    borderRadius: "8px",
    marginBottom: "10px",
    maxWidth: "60%",
    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
  },

  sender: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  inputArea: {
    display: "flex",
    padding: "15px",
    backgroundColor: "#f0f0f0",
    borderTop: "1px solid #ddd",
  },
  

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
  },

  sendBtn: {
    marginLeft: "10px",
    padding: "10px 15px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#128c7e",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Chat;
// // src/pages/Chat.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useAuth } from "../context/AuthContext";
// import { socket } from "../socket";

// function Chat() {
//   const { user, logout } = useAuth();
//   const [room, setRoom] = useState("");
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [typingUser, setTypingUser] = useState("");
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     // Listen for incoming messages
//     socket.on("receive_message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     // Listen for typing notifications
//     socket.on("user_typing", (author) => {
//       if (author !== user.user.username) {
//         setTypingUser(author);
//         setTimeout(() => setTypingUser(""), 1000); // remove after 1 sec
//       }
//     });

//     // Load previous messages when joining
//     socket.on("previous_messages", (msgs) => {
//       setMessages(msgs);
//     });

//     // Listen for online users
//     socket.on("online_users", (users) => {
//       setOnlineUsers(users);
//     });

//     return () => {
//       socket.off("receive_message");
//       socket.off("user_typing");
//       socket.off("previous_messages");
//       socket.off("online_users");
//     };
//   }, [user.user.username]);

//   useEffect(() => {
//     // Scroll to bottom whenever messages update
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const joinRoom = () => {
//     if (user && room) {
//       socket.connect();
//       socket.emit("join_room", { room, author: user.user.username });
//     }
//   };

//   const sendMessage = () => {
//     if (message && room) {
//       const msgObj = { room, author: user.user.username, message };
//       socket.emit("send_message", msgObj);
//       setMessages((prev) => [...prev, msgObj]);
//       setMessage("");
//     }
//   };

//   const handleTyping = () => {
//     if (room) {
//       socket.emit("typing", { room, author: user.user.username });
//     }
//   };

//   return (
//     <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
//       <h2>Welcome {user?.user?.username} 👋</h2>
//       <button onClick={logout}>Logout</button>

//       {/* Join Room */}
//       <div style={{ marginTop: "20px" }}>
//         <input
//           placeholder="Room ID"
//           value={room}
//           onChange={(e) => setRoom(e.target.value)}
//         />
//         <button onClick={joinRoom} style={{ marginLeft: "10px" }}>
//           Join Room
//         </button>
//       </div>

//       <div style={{ display: "flex", marginTop: "20px" }}>
//         {/* Messages */}
//         {/* Messages with bubbles */}
// <div
//   style={{
//     flex: 3,
//     border: "1px solid #ccc",
//     padding: "10px",
//     height: "300px",
//     overflowY: "auto",
//     marginRight: "10px",
//     display: "flex",
//     flexDirection: "column",
//   }}
// >
//   {messages.map((msg, idx) => {
//     const isMe = msg.author === user.user.username;
//     return (
//       <div
//         key={idx}
//         style={{
//           alignSelf: isMe ? "flex-end" : "flex-start",
//           backgroundColor: isMe ? "#DCF8C6" : "#FFF",
//           color: "#000",
//           padding: "8px 12px",
//           borderRadius: "20px",
//           margin: "5px 0",
//           maxWidth: "70%",
//           boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
//           wordBreak: "break-word",
//         }}
//       >
//         {!isMe && <b>{msg.author}: </b>}
//         {msg.message}
//       </div>
//     );
//   })}
//   {typingUser && (
//     <p style={{ fontStyle: "italic", color: "#555", margin: "5px 0" }}>
//       {typingUser} is typing...
//     </p>
//   )}
//   <div ref={messagesEndRef}></div>
// </div>

//         {/* Online Users */}
//         {/* Online Users with highlight */}
// <div
//   style={{
//     flex: 1,
//     border: "1px solid #ccc",
//     padding: "10px",
//     height: "300px",
//     overflowY: "auto",
//     borderRadius: "10px",
//     backgroundColor: "#f9f9f9",
//   }}
// >
//   <h4 style={{ marginBottom: "10px" }}>Online Users</h4>
//   <ul style={{ listStyle: "none", padding: 0 }}>
//     {onlineUsers.map((u, idx) => {
//       const isMe = u === user.user.username;
//       return (
//         <li
//           key={idx}
//           style={{
//             padding: "6px 10px",
//             marginBottom: "5px",
//             borderRadius: "8px",
//             backgroundColor: isMe ? "#DCF8C6" : "#FFF",
//             fontWeight: isMe ? "bold" : "normal",
//             boxShadow: isMe ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
//           }}
//         >
//           {u}
//         </li>
//       );
//     })}
//   </ul>
// </div>
//       </div>

//       {/* Send Message */}
      
// <div
//   style={{
//     display: "flex",
//     marginTop: "10px",
//     position: "sticky",
//     bottom: 0,
//     backgroundColor: "#fff",
//     padding: "10px 0",
//   }}
// >
//   <input
//     placeholder="Type your message"
//     value={message}
//     onChange={(e) => setMessage(e.target.value)}
//     onKeyPress={(e) => {
//       handleTyping();
//       if (e.key === "Enter") {
//         e.preventDefault();
//         sendMessage();
//       }
//     }}
//     style={{
//       flex: 1,
//       padding: "8px 12px",
//       borderRadius: "20px",
//       border: "1px solid #ccc",
//       marginRight: "10px",
//     }}
//   />
//   <button
//     onClick={sendMessage}
//     style={{
//       padding: "8px 16px",
//       borderRadius: "20px",
//       backgroundColor: "#128C7E",
//       color: "#fff",
//       border: "none",
//       cursor: "pointer",
//     }}
//   >
//     Send
//   </button>
// </div>
//     </div>
//   );
// }

// export default Chat;


