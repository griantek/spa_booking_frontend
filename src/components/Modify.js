import React, { useState, useEffect } from "react";
import "./Modify.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { API_URLS, DEFAULT_VALUES } from "../utils/constants";

function Modify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Extract token from the URL
  const token = new URLSearchParams(window.location.search).get("token");

  const [formData, setFormData] = useState({
    name:"", // Prefill name if available
    phone:"", // Prefill phone if available
    service: "",
    time: "",
    date: "",
    notes: "",
  });

  const [message, setMessage] = useState(""); // State for success messages
  const [errors, setErrors] = useState({}); // State for field-specific errors
  const [loading, setLoading] = useState(true);
  const [chatNo, setChatNo] = useState(true);
  //useEffect for if Modify directly from Web Aplication
  useEffect(() => {
    const phone = location.state?.phone;

    if (phone) {
      setFormData((prevData) => ({
        ...prevData,
        phone: phone,
      }));

      const fetchAppointmentData = async () => {
        try {
          const response = await axios.get(
            `https://spa-booking-backend-kcqy.onrender.com/appointment/${phone}`
          );

          if (response.status === 200) {
            setFormData((prevData) => ({
              ...prevData,
              name: response.data.name || "",
              service: response.data.service || "",
              time: response.data.time || "",
              date: response.data.date || "",
              notes: response.data.notes || "",
            }));
          } else {
            console.error("Unexpected response status:", response.status);
          }
        } catch (error) {
          console.error(
            "Error fetching appointment data:",
            error.response?.data || error.message
          );
        }
      };

      fetchAppointmentData();
    }
  }, [location.state?.phone]);
  //useEffect for if Modification reqeust from whatsapp bot

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          setLoading(true);

          // Validate token
          const tokenResponse = await axios.get(`https://spa-booking-backend-kcqy.onrender.com/validate-token?token=${token}`);
          const { phone, name, chat } = tokenResponse.data; // Extract phone and name from response
          setChatNo(chat);

          setFormData((prevData) => ({
            ...prevData,
            phone,
            name, // Prefill phone and name
          }));

          // Fetch appointment details
          const appointmentResponse = await axios.get(`https://spa-booking-backend-kcqy.onrender.com/appointment/${phone}`);
          setFormData((prevData) => ({
            ...prevData,
            service: appointmentResponse.data.service || "",
            time: appointmentResponse.data.time || "",
            date: appointmentResponse.data.date || "",
            notes: appointmentResponse.data.notes || "",
          }));
        } catch (err) {
          setErrors("Failed to fetch data.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [token]);

  //if (loading) return <p>Loading...</p>;

  const validateFields = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.service) newErrors.service = "Service is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error for the current field
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post(`${API_URLS.BACKEND_URL}/modify-appointment`, {
        phone: formData.phone,
        name: formData.name,
        service: formData.service,
        time: formData.time,
        date: formData.date,
        notes: formData.notes,
      });

      navigate("/confirmation", {
        state: {
          phone: formData.phone,
          message: "Your appointment has been updated successfully!",
          note: "Feel free to explore or book another appointment.",
          chatbotNo:chatNo
        },
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      setMessage("Failed to update the appointment.");
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URLS.BACKEND_URL}/cancel-appointment`, {
        phone: formData.phone,
      });

      navigate("/confirmation", {
        state: {
          message: "Your appointment has been cancelled successfully!",
          note: "You can book another appointment if needed.",
        },
      });
    } catch (error) {
      console.error("Error canceling appointment:", error);
      setMessage("Failed to cancel the appointment.");
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
    <div className="formcontainer ">
      <img src={DEFAULT_VALUES.IMAGE_URL} alt="Spa" className="form-image" />
      <h1 className="heading">Modify Your Appointment</h1>

      <form onSubmit={handleUpdate}>
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
        {errors.notes && <span className="error-text">{errors.notes}</span>}

        <button className="form-button update-button" type="submit">
          Update
        </button>
      </form>

      <button className="form-button cancel-button" onClick={handleCancel}>
        Cancel Appointment
      </button>

      {message && <div className="status-message">{message}</div>}
    </div>
  );
}

export default Modify;
