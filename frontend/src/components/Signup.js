import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
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
    specialization: [],
    experience: "",
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
      <div className="auth-wrapper signup-card">
        <div className="auth-header">
          <h1>Create account</h1>
          <p>Join StitchCraft to get started</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="name">Full name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Phone number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-field">
            <label htmlFor="role">I am a *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select your role</option>
              <option value="customer">Customer</option>
              <option value="tailor">Tailor</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>

          {formData.role === "tailor" && (
            <>
              <div className="form-field">
                <label>Specialization</label>
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

              <div className="form-field">
                <label htmlFor="experience">Years of experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </>
          )}

          {formData.role === "supplier" && (
            <>
              <div className="form-field">
                <label htmlFor="businessName">Business name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Your business name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="businessType">Business type *</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="fabric">Fabric</option>
                  <option value="supplies">Supplies</option>
                  <option value="equipment">Equipment</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="businessDescription">Business description</label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleChange}
                  placeholder="Describe your business..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="businessRegistrationNumber">Registration number</label>
                  <input
                    type="text"
                    id="businessRegistrationNumber"
                    name="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="taxId">Tax ID</label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="cnic">CNIC</label>
                  <input
                    type="text"
                    id="cnic"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="yearsInBusiness">Years in business</label>
                  <input
                    type="number"
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Product categories</label>
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

          <div className="form-field">
            <label htmlFor="street">Street address</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-field">
              <label htmlFor="province">Province</label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="postalCode">Postal code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
