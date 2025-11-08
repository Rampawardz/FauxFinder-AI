import { useAuth } from "../context/AuthContext";

function Footer() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <footer className="footer bg-orange-50 text-gray-800 py-4 text-center">
      <p>© 2025 FauxFinder AI. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
