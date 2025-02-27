import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import "./Dashboard/Dashboard"

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", formData);
      alert(response.data.message);
      navigate("/Login");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div className="register-container">      
    <h1>Register</h1>
    <form className="register-form" onSubmit={handleSubmit}>
      <input
        className="register-input"
        type="text"
        name="firstName"
        placeholder="First Name"
        onChange={handleChange}
        required
      />

      <input
        className="register-input"
        type="text"
        name="lastName"
        placeholder="Last Name"
        onChange={handleChange}
        required
      />

      <input
        className="register-input"
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />

      <input
        className="register-input"
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        required
      />

      <input
        className="register-input"
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />

      <button className="register-button" type="submit">Register Account</button>
      <button className="back-to-login-button" type="button" onClick={() => navigate("/login")}>Back to Login</button>
    </form>
    </div>
  );
};

export default Register;
