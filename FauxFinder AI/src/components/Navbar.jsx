import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-10/12 md:w-3/4 bg-white/90 backdrop-blur-md shadow-lg rounded-xl z-50 p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl text-orange-600 ml-2">
        FauxFinder AI
      </Link>

      <div className="space-x-6 sm:space-x-8 md:space-x-12 mr-2 text-gray-800 font-medium">
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/Enquiry">Enquiry</Link>
            <button
              onClick={logout}
              className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
