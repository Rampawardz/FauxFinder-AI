import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import About from  "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Enquiry from "./pages/Enquiry";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="homepage">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Home />} />
          <Route path="/about" element={<About/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/enquiry" element={<Enquiry />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
