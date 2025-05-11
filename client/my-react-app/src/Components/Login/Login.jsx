import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/login", formData);

      if (response.status === 200) {
        toast.success("Login successful!");

        sessionStorage.setItem("userId", response.data.userId);
        sessionStorage.setItem("firstName", response.data.firstName);
        sessionStorage.setItem("lastName", response.data.lastName);
        sessionStorage.setItem("gamesPlayed", response.data.gamesPlayed);
        sessionStorage.setItem("gamesWon", response.data.gamesWon);

        navigate("/home");
      } else {
        toast.error(response.data.message || "Invalid username or password.");
      }
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || "Something went wrong"));
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