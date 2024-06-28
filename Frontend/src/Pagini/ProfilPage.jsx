import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilPage.css';

function ProfilPage({ setIsLoggedIn, setLoggedInUsername, setUserId, setRole }) {
  // State variables for user details, form data, and edit mode
  const [userDetails, setUserDetails] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false); // State to check if user is confirmed
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Get userId from localStorage

  // Fetch user details and confirmation status when component mounts
  useEffect(() => {
    if (userId) {
      console.log(userId);
      axios.get(`https://localhost:8081/users/id/${userId}`)
        .then(response => {
          setUserDetails(response.data);
          console.log(response.data);
          setFormData({
            username: response.data.username,
            email: response.data.email,
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
        });

      // Check if user is confirmed
      axios.get(`https://localhost:8081/confirm-status/${userId}`)
        .then(response => {
          setIsConfirmed(response.data.isConfirmed);
        })
        .catch(error => {
          console.error('Error checking confirmation status:', error);
        });
    }
  }, [userId]);

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle save button click to update user details
  const handleSaveClick = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      alert('New passwords do not match.');
      return;
    }

    const updateData = {
      oldPassword: formData.oldPassword,
    };
    if (formData.username) updateData.username = formData.username;
    if (formData.email) updateData.email = formData.email;
    if (formData.newPassword) updateData.newPassword = formData.newPassword;

    axios.patch(`https://localhost:8081/users/id/${userId}`, updateData)
      .then(response => {
        setUserDetails(response.data);
        setIsEditing(false);
        alert('Profile updated successfully. Please log in again to see the changes.');
        // Update username in localStorage if changed
        if (response.data.username) {
          localStorage.setItem('username', response.data.username);
        }
        handleLogout();
      })
      .catch(error => {
        console.error('Error updating user details:', error);
        alert('Error updating user details.');
      });
  };

  // Handle delete profile button click
  const handleDeleteProfile = () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      if (window.confirm('Are you absolutely sure?')) {
        axios.delete(`https://localhost:8081/users/id/${userId}`)
          .then(response => {
            console.log('Profile deleted successfully:', response.data);
            handleLogout(); // Call logout function
          })
          .catch(error => {
            console.error('Error deleting user profile:', error);
            alert('Error deleting user profile.');
          });
      }
    }
  };

  // Handle resend confirmation email button click
  const handleResendConfirmation = () => {
    axios.post('https://localhost:8081/resend-confirmation-email', { userId })
      .then(response => {
        alert('Confirmation email resent successfully.');
      })
      .catch(error => {
        console.error('Error resending confirmation email:', error);
        alert('Error resending confirmation email.');
      });
  };

  // Handle logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUsername('');
    setUserId(null);
    setRole('');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="profile-page">
      <button className="back-button" onClick={() => { navigate('/'); window.location.reload(false); }}>Back</button>
      <div className="profile-card">
        <h1>Profilul utilizatorului</h1>
        <div className="profile-details">
          {isEditing ? (
            <>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Old Password:</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                />
              </div>
              <div className="button-group">
                <button className="btn save-btn" onClick={handleSaveClick}>Save</button>
                <button className="btn edit-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p><strong>Username:</strong> {userDetails.username}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Data înregistrării:</strong> {new Date(userDetails.registrationDate).toLocaleString()}</p>
              {!isConfirmed && (
                <div className="confirmation-message">
                  <p>Your email is not confirmed. Please check your email for the confirmation link.</p>
                </div>
              )}
              <div className="button-group">
                <button className="btn edit-btn" onClick={handleEditClick}>Edit</button>
                <button className="btn delete-btn" onClick={handleDeleteProfile}>Delete Profile</button>
                {!isConfirmed && (
                <button className="btn resend-btn" onClick={handleResendConfirmation}>Resend Confirmation Email</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilPage;
