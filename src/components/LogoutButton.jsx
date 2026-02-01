import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear JWT
    navigate("/login");               // redirect to login
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
      Logout
    </button>
  );
}
