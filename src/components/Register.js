import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/global.css";
import { useSearchParams } from "react-router-dom";
import { API_URLS, DEFAULT_VALUES } from "../utils/constants";
const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); 

  const [formData, setFormData] = useState({
    name: "", // Prefill name if available
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

  useEffect(() => {
    // Validate token and prefill form data
    if (token) {
      const fetchTokenData = async () => {
        try {
          // Send token to backend for validation
          const response = await axios.get(`${API_URLS.BACKEND_URL}/validate-token?token=${token}`);
          const { phone, name } = response.data; // Extract phone and name from token
          
          // Prefill form data with phone and name
          setFormData((prevData) => ({
            ...prevData,
            phone: phone,
            name: name,
          }));
        } catch (error) {
          console.error("Error validating token:", error);
          setErrors({ token: "Invalid or expired token" });
        }
      };

      fetchTokenData();
    }
  }, [token]);
 
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
      await axios.post(`${API_URLS.BACKEND_URL}/submit-booking`, formData);

      navigate("/confirmation", {
        state: {
          phone: formData.phone,
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

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <div className="formcontainer">
      <img src={DEFAULT_VALUES.IMAGE_URL} alt="Spa" className="form-image" />
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
          <option value="Facial Treatment">Facial Treatment</option>
          <option value="Massage Therapy">Massage Therapy</option>
          <option value="Manicure & Pedicure">Manicure & Pedicure</option>
          <option value="Hair Removal">Hair Removal</option>
          <option value="Acne Treatment">Acne Treatment</option>
          <option value="Body Scrub">Body Scrub</option>
          <option value="Hot Stone Massage">Hot Stone Massage</option>
          <option value="Nail Art & Design">Nail Art & Design</option>
        </select>
        {errors.service && <span className="error-text">{errors.service}</span>}

        <div className="horizontal-placement">
          <input
            className="form-field"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={getTodayDate()}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}

          <input
            className="form-field"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            disabled={!formData.date}
            min={formData.date === getTodayDate() ? getCurrentTime() : null}
          />
          {errors.time && <span className="error-text">{errors.time}</span>}
        </div>

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

      {errors.submit && <div className="error-message">{errors.submit}</div>}
    </div>
  );
};

export default Register;
