import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";
import "./Login.css";
import "../Dashboard/Dashboard"

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post("http://localhost:5001/login", formData);

        if (response.status === 200) {
            alert("Login successful!");
            navigate("/home");
        } else {
            alert(response.data.message || "Invalid username or password.");
        }
    } catch (error) {
        alert("Error: " + (error.response?.data?.message || "Something went wrong"));
        console.error("Login error:", error);
    }
};

  return (
    <div className="login-container">
      <h1>Coup</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          className="login-input"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button className="login-button" type="submit">Log In</button>
        <button className="create-account-button" type="button" onClick={() => navigate("/register")}>
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Login;
