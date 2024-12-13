import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Home.css';
import { API_URLS, DEFAULT_VALUES } from "../utils/constants";

const Home = () => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(""); // State for inline error
  const navigate = useNavigate();

  const checkPhone = async () => {
    // Validate phone number input
    if (!phone) {
      setError("Phone number is required.");
      return;
    }
    if (!/^\d{12}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setError(""); // Clear any existing error

    try {
      const response = await axios.get(`${API_URLS.BACKEND_URL}/check-phone/${phone}`);
      if (response.data.exists) {
        // Phone number exists, navigate to Modify page and pass the phone number
        toast.success("Phone number found! Redirecting to Modify page...", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/modify", { state: { phone } }), 2000);
      } else {
        // Phone number does not exist, navigate to Register page and pass the phone number
        toast.info("Phone number not found! Redirecting to Register page...", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/register", { state: { phone } }), 2000);
      }
    } catch (error) {
      console.error("Error checking phone:", error);
      toast.error("An error occurred while checking the phone number.", {
        position: "top-center",
      });
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only numeric values
    if (/^\d*$/.test(value)) {
      value="91"+value
      setPhone(value);
      setError(""); // Clear error when user starts typing
    }
  };

  return (
    <div className="form-container">
      <img
        src={DEFAULT_VALUES.IMAGE_URL}
        alt="Spa"
        className="form-image"
      />
      <h1>Welcome to the Spa Booking System</h1>
      <div className="form-group">
        <input
          className={`form-field ${error ? "form-field-error" : ""}`}
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={handleInputChange}
          maxLength={12}
        />
        {error && <span className="error-text">{error}</span>}
      </div>
      <button className="form-button" onClick={checkPhone}>
        Check
      </button>
    </div>
  );
};

export default Home;
