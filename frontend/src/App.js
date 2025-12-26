import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import TailorListing from "./components/TailorListing";
import TailorProfile from "./components/TailorProfile";
import TailorProfileEdit from "./components/TailorProfileEdit";
import BookingForm from "./components/BookingForm";
import OrderTracking from "./components/OrderTracking";
import OrderDashboard from "./components/OrderDashboard";
import PackageBuilder from "./components/PackageBuilder";
import SupplierProfile from "./components/SupplierProfile";
import SupplierProfileEdit from "./components/SupplierProfileEdit";
import DashboardRouter from "./components/DashboardRouter";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/tailors" element={<TailorListing />} />
              <Route path="/tailors/:id" element={<TailorProfile />} />
              <Route
                path="/tailors/:id/edit"
                element={
                  <ProtectedRoute requiredRole="tailor">
                    <TailorProfileEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tailors/:id/book"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <BookingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/packages/manage"
                element={
                  <ProtectedRoute requiredRole="tailor">
                    <PackageBuilder />
                  </ProtectedRoute>
                }
              />
              <Route path="/suppliers" element={<div className="container"><h2>Suppliers</h2><p>Suppliers listing coming soon...</p></div>} />
              <Route path="/suppliers/:id" element={<SupplierProfile />} />
              <Route
                path="/suppliers/:id/edit"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierProfileEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/materials"
                element={
                  <div className="container">
                    <h2>Materials</h2>
                    <p>Materials marketplace coming soon...</p>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
