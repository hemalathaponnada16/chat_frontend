// import { useState } from "react";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await api.post("/auth/login", {
//         email,
//         password,
//       });

//       login(res.data);
//       alert("Login successful 🚀");
//     } catch (err) {
//       alert("Login failed ❌");
//     }
//   };

//   return (
//     <div style={{
//       minHeight: "100vh",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       background: "linear-gradient(135deg, #667eea, #764ba2)"
//     }}>
//       <div style={{
//         background: "#fff",
//         padding: "40px",
//         borderRadius: "15px",
//         boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
//         width: "350px"
//       }}>
//         <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Login</h2>

//         <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
//           <input
//             type="email"
//             placeholder="Enter email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             style={{ padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #ccc" }}
//           />

//           <input
//             type="password"
//             placeholder="Enter password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             style={{ padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ccc" }}
//           />

//           <button
//             type="submit"
//             style={{
//               padding: "12px",
//               borderRadius: "8px",
//               border: "none",
//               backgroundColor: "#667eea",
//               color: "#fff",
//               fontWeight: "bold",
//               cursor: "pointer"
//             }}
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Login;
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
    } catch (err) {
      alert("Invalid credentials ❌");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back 👋</h1>
        <p style={styles.subtitle}>Sign in to continue chatting</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>

        <p style={styles.footerText}>
          Secure • Real-time • Modern
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, sans-serif",
  },

  overlay: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
    borderRadius: "50%",
    top: "-150px",
    right: "-150px",
  },

  card: {
    position: "relative",
    zIndex: 2,
    width: "380px",
    padding: "45px",
    borderRadius: "20px",
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.08)",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
  },

  title: {
    color: "#fff",
    marginBottom: "10px",
    fontSize: "26px",
    fontWeight: "600",
  },

  subtitle: {
    color: "#cbd5e1",
    marginBottom: "30px",
    fontSize: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    padding: "14px",
    marginBottom: "18px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },

  footerText: {
    marginTop: "25px",
    fontSize: "12px",
    color: "#94a3b8",
  },
};

export default Login;