import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="container">
          <h2 className="hero-title">Digital Tailoring Marketplace</h2>
          <p className="hero-subtitle">
            Connecting skilled artisans with customers across Pakistan
          </p>
          {!user ? (
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/tailors" className="btn btn-primary">
                Find a Tailor
              </Link>
              {user.role === "tailor" && (
                <Link to="/dashboard" className="btn btn-secondary">
                  My Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h3 className="section-title">How It Works</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>For Customers</h4>
              <p>
                Find skilled tailors in your area, browse portfolios, and get
                quality tailoring services for all your needs.
              </p>
            </div>
            <div className="feature-card">
              <h4>For Tailors</h4>
              <p>
                Showcase your skills, connect with customers, and grow your
                tailoring business with our platform.
              </p>
            </div>
            <div className="feature-card">
              <h4>For Suppliers</h4>
              <p>
                Reach tailors and customers directly, sell fabrics and supplies,
                and expand your business network.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

