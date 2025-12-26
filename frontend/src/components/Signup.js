import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../App.css";
import "./Auth.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    // Tailor fields
    specialization: [],
    experience: "",
    // Supplier fields
    businessName: "",
    businessType: "",
    businessDescription: "",
    businessRegistrationNumber: "",
    taxId: "",
    cnic: "",
    yearsInBusiness: "",
    productCategories: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "specialization") {
      const updatedSpecializations = checked
        ? [...formData.specialization, value]
        : formData.specialization.filter((item) => item !== value);
      setFormData({
        ...formData,
        specialization: updatedSpecializations,
      });
    } else if (name === "productCategories") {
      const updatedCategories = checked
        ? [...formData.productCategories, value]
        : formData.productCategories.filter((item) => item !== value);
      setFormData({
        ...formData,
        productCategories: updatedCategories,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Prepare user data
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone || undefined,
      address: {
        street: formData.street || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        postalCode: formData.postalCode || undefined,
      },
    };

    // Add role-specific fields
    if (formData.role === "tailor") {
      userData.specialization = formData.specialization;
      userData.experience = formData.experience ? parseInt(formData.experience) : 0;
    }

    if (formData.role === "supplier") {
      userData.businessName = formData.businessName || undefined;
      userData.businessType = formData.businessType || undefined;
      userData.businessDescription = formData.businessDescription || undefined;
      userData.businessRegistrationNumber = formData.businessRegistrationNumber || undefined;
      userData.taxId = formData.taxId || undefined;
      userData.cnic = formData.cnic || undefined;
      userData.yearsInBusiness = formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : 0;
      userData.productCategories = formData.productCategories || [];
    }

    const result = await register(userData);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const specializations = [
    "Traditional Wear",
    "Western Wear",
    "Bridal Wear",
    "Embroidery",
    "Alterations",
    "Custom Design",
  ];

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join StitchCraft and start your journey</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select your role</option>
              <option value="customer">Customer (Service Seeker)</option>
              <option value="tailor">Tailor (Service Provider)</option>
              <option value="supplier">Supplier (Raw Material Seller)</option>
            </select>
          </div>

          {formData.role === "tailor" && (
            <>
              <div className="form-group">
                <label>Specialization (Select all that apply)</label>
                <div className="checkbox-group">
                  {specializations.map((spec) => (
                    <label key={spec} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="specialization"
                        value={spec}
                        checked={formData.specialization.includes(spec)}
                        onChange={handleChange}
                      />
                      <span>{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="experience">Years of Experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Enter years of experience"
                  min="0"
                />
              </div>
            </>
          )}

          {formData.role === "supplier" && (
            <>
              <div className="form-group">
                <label htmlFor="businessName">Business Name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessType">Business Type *</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select business type</option>
                  <option value="fabric">Fabric</option>
                  <option value="supplies">Supplies</option>
                  <option value="equipment">Equipment</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="businessDescription">Business Description</label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleChange}
                  placeholder="Describe your business and products..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessRegistrationNumber">Business Registration Number</label>
                  <input
                    type="text"
                    id="businessRegistrationNumber"
                    name="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={handleChange}
                    placeholder="Registration number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="taxId">Tax ID</label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="Tax identification number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cnic">CNIC</label>
                  <input
                    type="text"
                    id="cnic"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    placeholder="CNIC number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="yearsInBusiness">Years in Business</label>
                  <input
                    type="number"
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={handleChange}
                    placeholder="Years"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Categories (Select all that apply)</label>
                <div className="checkbox-group">
                  {[
                    "Fabric",
                    "Textiles",
                    "Threads",
                    "Needles",
                    "Buttons",
                    "Zippers",
                    "Sewing Machines",
                    "Embroidery Materials",
                    "Mannequins",
                    "Measuring Tools",
                    "Packaging Materials",
                    "Other",
                  ].map((category) => (
                    <label key={category} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="productCategories"
                        value={category}
                        checked={formData.productCategories.includes(category)}
                        onChange={handleChange}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Enter street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label htmlFor="province">Province</label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Province"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="postalCode">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal code"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min. 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

