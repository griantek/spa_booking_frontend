import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/global.css";

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message, note, phone } = location.state || {
    message: "Operation successful!",
    note: "You can perform more actions here.",
    phone: null,
  };

  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    if (phone) {
      const fetchDetails = async () => {
        try {
          const response = await fetch(`https://spa-booking-backend-kcqy.onrender.com/appointment/${phone}`);
          if (response.ok) {
            const data = await response.json();
            setAppointmentDetails(data);
          } else {
            console.error("Failed to fetch appointment details");
          }
        } catch (error) {
          console.error("Error fetching appointment details:", error);
        }
      };
      fetchDetails();
    }
  }, [phone]);

  const handleGoBack = () => {
    navigate("/");
  };

  const handlePrint = () => {
    window.print();
  };

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    return `${adjustedHours}:${minutes} ${period}`;
  };



  return (
    <div className="form-container">
      <img
        src="https://www.dermaessentia.com/cdn/shop/articles/Hair-Spa-for-Men.jpg?v=1694420768"
        alt="Spa"
        className="form-image"
      />
      <h1>{message}</h1>
      

      {appointmentDetails ? (
        <div className="appointment-details">
          <h2>Appointment Details</h2>
          <p><strong>Name:</strong> {appointmentDetails.name}</p>
          <p><strong>Phone:</strong> {appointmentDetails.phone}</p>
          <p><strong>Service:</strong> {appointmentDetails.service}</p>
          <p><strong>Date:</strong> {appointmentDetails.date}</p>
          <p><strong>Time:</strong> {convertTo12HourFormat(appointmentDetails.time)}</p>
          {appointmentDetails.notes && (
            <p><strong>Notes:</strong> {appointmentDetails.notes}</p>
          )}
        </div>
      ) : (
        ""
      )}

      <div className="button-container">
        <button className="form-button" onClick={handleGoBack}>
          Go to Home
        </button>

        {appointmentDetails ?(<button className="form-button" onClick={handlePrint}>
          Print Confirmation
        </button>):("")}
        
      </div>
      <p className="confirmation-text">{note}</p>
    </div>
  );
};

export default ConfirmationPage;
