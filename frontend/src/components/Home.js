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
          <div className="hero-content">
            <h1 className="hero-title">
              Connect with skilled tailors across Pakistan
            </h1>
            <p className="hero-subtitle">
              Find the perfect artisan for your tailoring needs, or grow your business by reaching new customers.
            </p>
            {!user ? (
              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary">
                  Get started
                </Link>
                <Link to="/login" className="btn btn-text">
                  Sign in
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                {user.role !== "supplier" && (
                  <Link to="/tailors" className="btn btn-primary">
                    Browse tailors
                  </Link>
                )}
                {(user.role === "tailor" || user.role === "supplier") && (
                  <Link to="/dashboard" className="btn btn-text">
                    Go to dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="intro-content">
            <h2 className="intro-heading">How it works</h2>
            <div className="intro-items">
              <div className="intro-item">
                <div className="intro-number">1</div>
                <div className="intro-text">
                  <h3>For customers</h3>
                  <p>Browse portfolios, compare prices, and book consultations with verified tailors in your area.</p>
                </div>
              </div>
              <div className="intro-item">
                <div className="intro-number">2</div>
                <div className="intro-text">
                  <h3>For tailors</h3>
                  <p>Showcase your work, manage orders, and build your client base through our platform.</p>
                </div>
              </div>
              <div className="intro-item">
                <div className="intro-number">3</div>
                <div className="intro-text">
                  <h3>For suppliers</h3>
                  <p>Connect directly with tailors and customers to sell fabrics, supplies, and equipment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
