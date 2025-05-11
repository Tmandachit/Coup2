import React, { useState, useEffect } from "react";
import "./Profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(sessionStorage.getItem("firstName") || "");
  const [lastName, setLastName] = useState(sessionStorage.getItem("lastName") || "");

  // Game stats state
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [winRate, setWinRate] = useState("0.0");

  // Fetch user stats on load
  useEffect(() => {
    const fetchStats = async () => {
      const userId = sessionStorage.getItem("userId");
      if (!userId) return;
  
      try {
        const response = await axios.get(`http://localhost:5001/profile/${userId}`);
        const data = response.data;
  
        // Update session storage
        sessionStorage.setItem("gamesPlayed", data.gamesPlayed);
        sessionStorage.setItem("gamesWon", data.gamesWon);
        sessionStorage.setItem("firstName", data.firstName);
        sessionStorage.setItem("lastName", data.lastName);
  
        // Update component state
        setGamesPlayed(data.gamesPlayed);
        setGamesWon(data.gamesWon);
        setWinRate(
          data.gamesPlayed > 0 ? ((data.gamesWon / data.gamesPlayed) * 100).toFixed(1) : "0.0"
        );
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };
  
    fetchStats();
  }, []);  

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
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
        toast.success("Password changed successfully!");
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to change password.");
      }
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || "Something went wrong"));
      console.error("Change password error:", error);
    }
  };

  const handleChangeProfile = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName) {
      toast.warning("Please fill in both fields.");
      return;
    }

    try {
      const username = sessionStorage.getItem("userId");

      const response = await axios.post("http://localhost:5001/changeprofile", {
        username,
        firstName,
        lastName,
      });

      if (response.status === 200) {
        toast.success("Profile updated successfully!");

        sessionStorage.setItem("firstName", firstName);
        sessionStorage.setItem("lastName", lastName);

        setIsEditModalOpen(false);
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || "Something went wrong"));
      console.error("Change profile error:", error);
    }
  };

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

      {/* Password Modal */}
      {isPasswordModalOpen && (
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
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