import React, { useState, useEffect } from "react";
import "./Modify.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URLS, DEFAULT_VALUES } from "../utils/constants";

function Modify() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Remove unused searchParams
  const token = new URLSearchParams(window.location.search).get("token");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    time: "",
    date: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  // const [isLoading, setIsLoading] = useState(true);
  const [chatNo, setChatNo] = useState(true);

  useEffect(() => {
    const phone = location.state?.phone;

    if (phone) {
      setFormData(prevData => ({
        ...prevData,
        phone: phone,
      }));

      const fetchAppointmentData = async () => {
        try {
          const response = await axios.get(
            `${API_URLS.BACKEND_URL}/appointment/${phone}`
          );

          if (response.status === 200) {
            setFormData(prevData => ({
              ...prevData,
              name: response.data.name || "",
              service: response.data.service || "",
              time: response.data.time || "",
              date: response.data.date || "",
              notes: response.data.notes || "",
            }));
          }
        } catch (error) {
          console.error(
            "Error fetching appointment data:",
            error.response?.data || error.message
          );
        } 
        // finally {
        //   setIsLoading(false);
        // }
      };

      fetchAppointmentData();
    } 
    // else {
    //   setIsLoading(false);
    // }
  }, [location.state?.phone]);

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          // setIsLoading(true);

          const tokenResponse = await axios.get(
            `${API_URLS.BACKEND_URL}/validate-token?token=${token}`
          );
          const { phone, name, chat } = tokenResponse.data;
          setChatNo(chat);

          setFormData(prevData => ({
            ...prevData,
            phone,
            name,
          }));

          const appointmentResponse = await axios.get(
            `${API_URLS.BACKEND_URL}/appointment/${phone}`
          );
          
          setFormData(prevData => ({
            ...prevData,
            name: appointmentResponse.data.name || "",
            service: appointmentResponse.data.service || "",
            time: appointmentResponse.data.time || "",
            date: appointmentResponse.data.date || "",
            notes: appointmentResponse.data.notes || "",
          }));
        } catch (err) {
          setErrors({ general: "Failed to fetch data." });
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [token]);

  const validateFields = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.service) newErrors.service = "Service is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.date) newErrors.date = "Date is required.";
  
    // Time validation
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    const currentDateTime = new Date();
  
    if (formData.date === getTodayDate()) {
      // Allow booking if time is exactly the same or up to 1 minute in the past
      const timeDifference = (selectedDateTime - currentDateTime) / (1000 * 60);
      if (timeDifference < -1) {
        newErrors.time = "Selected time has already passed.";
      }
    }
  
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: "" }));
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
        ...formData
      });

      navigate("/confirmation", {
        state: {
          phone: formData.phone,
          message: "Your appointment has been updated successfully!",
          note: "Feel free to explore or book another appointment.",
          chatbotNo: chatNo,
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

  // Add loading state rendering
  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="formcontainer">
      <img src={DEFAULT_VALUES.IMAGE_URL} alt="Spa" className="form-image" />
      <h1 className="heading">Modify Your Appointment</h1>

      {/* Rest of the component remains the same */}
      <form onSubmit={handleUpdate}>
        {/* Form fields */}
        <input
          className="form-field"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        {errors.name && <span className="error-text">{errors.name}</span>}

        <input
          className="form-field"
          type="text"
          name="phone"
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