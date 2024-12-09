import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/global.css";

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { message, note } = location.state || {
    message: "Operation successful!",
    note: "You can perform more actions here.",
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="form-container">
      <img
        src="https://www.dermaessentia.com/cdn/shop/articles/Hair-Spa-for-Men.jpg?v=1694420768"
        alt="Spa"
        className="form-image"
      />
      <h1>{message}</h1>
      <p className="confirmation-text">{note}</p>
      <button className="form-button" onClick={handleGoBack}>
        Go to Home
      </button>
    </div>
  );
};

export default ConfirmationPage;
