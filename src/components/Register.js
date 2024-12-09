import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/global.css";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    time: "",
    date: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location.state?.phone) {
      setFormData((prevState) => ({
        ...prevState,
        phone: location.state.phone,
      }));
    }
  }, [location]);

  const validateFields = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    if (!formData.service) newErrors.service = "Please select a service.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post("http://localhost:3000/submit-booking", formData);

      navigate("/confirmation", {
        state: {
          message: "Your Appointment is Confirmed!",
          note: "Thank you for booking your appointment with us. We look forward to serving you!",
        },
      });
    } catch (error) {
      console.error("Error during submission:", error);
      setErrors({ submit: "Failed to register the appointment." });
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="form-container">
      <img
        src="https://www.dermaessentia.com/cdn/shop/articles/Hair-Spa-for-Men.jpg?v=1694420768"
        alt="Spa"
        className="form-image"
      />
      <h1>Register for a Spa Appointment</h1>

      <form onSubmit={handleSubmit}>
        <input
          className="form-field"
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}

        <input
          className="form-field"
          type="text"
          name="phone"
          placeholder="Your Phone"
          value={formData.phone}
          readOnly
        />
        {errors.phone && <span className="error-text">{errors.phone}</span>}

        <select
          className="form-field"
          name="service"
          value={formData.service}
          onChange={handleChange}
        >
          <option value="">Select Service</option>
          <option value="Massage">Massage</option>
          <option value="Facial">Facial</option>
          <option value="Manicure">Manicure</option>
        </select>
        {errors.service && <span className="error-text">{errors.service}</span>}

        <input
          className="form-field"
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
        />
        {errors.time && <span className="error-text">{errors.time}</span>}

        <input
          className="form-field"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={getTodayDate()}
        />
        {errors.date && <span className="error-text">{errors.date}</span>}

        <textarea
          className="form-field"
          name="notes"
          placeholder="Additional Notes"
          value={formData.notes}
          onChange={handleChange}
        />

        <button className="form-button" type="submit">
          Register
        </button>
      </form>

      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}
    </div>
  );
};

export default Register;
