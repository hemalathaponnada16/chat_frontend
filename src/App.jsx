
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/chat" /> : <Login />}
      />
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
// import Login from "./pages/Login";

// function App() {
//   return (
//     <div>
//       <Login />
//     </div>
//   );
// }

// export default App;