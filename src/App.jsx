import { BrowserRouter as Router, Routes } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>{AppRoutes}</Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
