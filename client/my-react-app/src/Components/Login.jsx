import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", formData);
      alert(response.data.message);
    } catch (error) {
      alert("Error: " + error.response.data.message);
    }
  };

  return (
    <>
    <h1>Coup Login</h1>
    <form className="login-form" onSubmit={handleSubmit}>
      <input className="login-input" type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input className="login-input" type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button className="login-button" type="submit">Log In</button>
      <button className="create-account-button" type="button" onClick={() => navigate("/register")}>
        Create Account
      </button>
    </form>
    </>
  );
};

export default Login;
