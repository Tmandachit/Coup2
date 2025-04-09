import React, { useState } from "react";
import "./Profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  // Password const
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile const
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Change user password
  const handleChangePassword = async (e) => {
    e.preventDefault();
  
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
  
    try {
      const userId = sessionStorage.getItem("userId"); 
  
      const response = await axios.post("http://localhost:5001/changepassword", {
        userId,
        currentPassword,
        newPassword,
      });
  
      if (response.status === 200) {
        alert("Password changed successfully!");
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(response.data.message || "Failed to change password.");
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
      console.error("Change password error:", error);
    }
  };
  
  // Change user profile (first and last name)
  const handleChangeProfile = async (e) => {
    e.preventDefault();
  
    if (!firstName || !lastName) {
      alert("Please fill in both fields.");
      return;
    }
  
    try {
      const username = sessionStorage.getItem("userId"); // Username = doc ID
  
      const response = await axios.post("http://localhost:5001/changeprofile", {
        username,
        firstName,
        lastName,
      });
  
      if (response.status === 200) {
        alert("Profile updated successfully!");

        // Ensure that names update
        sessionStorage.setItem("firstName", firstName);
        sessionStorage.setItem("lastName", lastName);

        setIsEditModalOpen(false);
      } else {
        alert(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
      console.error("Change profile error:", error);
    }
  };

  const gamesPlayed = parseInt(sessionStorage.getItem("gamesPlayed")) || 0;
  const gamesWon = parseInt(sessionStorage.getItem("gamesWon")) || 0;

  const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : "0.0";

  return (
    <div className="profile-container">
      <div className="profile-card">
      <h2 className="profile-name">
        {sessionStorage.getItem("firstName")} {sessionStorage.getItem("lastName")}
      </h2>


        <div className="profile-stats">
          <div><strong>Games Played:</strong> {gamesPlayed} </div>
          <div><strong>Wins:</strong> {gamesWon} </div>
          <div><strong>Win Rate:</strong> {winRate}%</div>
        </div>

        <button className="edit-button" onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
        <button className="password-button" onClick={() => setIsPasswordModalOpen(true)}>
          Change Password
        </button>

        <div className="spacer"></div>
        <button className="back-button" type="button" onClick={() => navigate("/home")}>
          Back to Game
        </button>
      </div>

      {isPasswordModalOpen && ( // Change password Pop-up
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleChangePassword}>Submit</button>
              <button onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

        {isEditModalOpen && ( // Change profile popup
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Profile</h3>
            <form onSubmit={handleChangeProfile}>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <div className="modal-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
        )}

    </div>
  );
};

export default Profile;
