import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Finance Tracker</div>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/budgets">Budgets</Link>
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
}
