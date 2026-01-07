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
import PricingTierManager from "./components/PricingTierManager";
import SupplierListing from "./components/SupplierListing";
import SupplierProfile from "./components/SupplierProfile";
import SupplierProfileEdit from "./components/SupplierProfileEdit";
import DashboardRouter from "./components/DashboardRouter";
import FabricListing from "./components/FabricListing";
import FabricDetail from "./components/FabricDetail";
import FabricForm from "./components/FabricForm";
import MyFabrics from "./components/MyFabrics";
import SampleOrderForm from "./components/SampleOrderForm";
import InventoryManagement from "./components/InventoryManagement";
import BulkOrderForm from "./components/BulkOrderForm";
import SupplyListing from "./components/SupplyListing";
import SupplyDetail from "./components/SupplyDetail";
import SupplyForm from "./components/SupplyForm";
import MySupplies from "./components/MySupplies";
import SupplyOrderForm from "./components/SupplyOrderForm";
import SupplyOrderTracking from "./components/SupplyOrderTracking";
import SupplierAnalytics from "./components/SupplierAnalytics";
import SupplierOrders from "./components/SupplierOrders";
import TailorOrders from "./components/TailorOrders";
import AdminDashboard from "./components/AdminDashboard";
import AdminVerifications from "./components/AdminVerifications";
import SearchPage from "./components/SearchPage";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import PatternLibrary from "./components/PatternLibrary";
import PatternDetail from "./components/PatternDetail";
import PatternTools from "./components/PatternTools";
import PatternForm from "./components/PatternForm";
import PatternCollaboration from "./components/PatternCollaboration";
import PatternDesigner from "./components/PatternDesigner";
import MoodBoard from "./components/MoodBoard";
import DesignAnnotationTool from "./components/DesignAnnotationTool";
import ProtectedRoute from "./components/ProtectedRoute";
import LearningPortal from "./components/LearningPortal";
import CourseList from "./components/CourseList";
import CourseDetail from "./components/CourseDetail";
import ForumList from "./components/ForumList";
import ForumDetail from "./components/ForumDetail";
import ForumForm from "./components/ForumForm";
import WorkshopList from "./components/WorkshopList";
import NewsList from "./components/NewsList";
import MentorshipProgram from "./components/MentorshipProgram";
import AdminVideoManagement from "./components/AdminVideoManagement";
import AdminWorkshopManagement from "./components/AdminWorkshopManagement";
import AdminNewsManagement from "./components/AdminNewsManagement";
import PriceComparison from "./components/PriceComparison";
import EquipmentMarketplace from "./components/EquipmentMarketplace";
import EquipmentDetail from "./components/EquipmentDetail";
import EquipmentForm from "./components/EquipmentForm";
import MaintenanceBooking from "./components/MaintenanceBooking";
import VirtualStylist from "./components/VirtualStylist";
import VirtualTryOn from "./components/VirtualTryOn";
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
                      <Route path="/search" element={<SearchPage />} />
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute requiredRole="customer">
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute requiredRole="customer">
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
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
                path="/tailor-orders"
                element={
                  <ProtectedRoute requiredRole="tailor">
                    <TailorOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mood-boards/:id"
                element={
                  <ProtectedRoute>
                    <MoodBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId/mood-board"
                element={
                  <ProtectedRoute>
                    <MoodBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId/annotate"
                element={
                  <ProtectedRoute>
                    <DesignAnnotationTool />
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
              <Route
                path="/pricing/tiers/manage"
                element={
                  <ProtectedRoute requiredRole="tailor">
                    <PricingTierManager />
                  </ProtectedRoute>
                }
              />
              <Route path="/suppliers" element={<SupplierListing />} />
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
              <Route path="/fabrics" element={<FabricListing />} />
              <Route path="/fabrics/:id" element={<FabricDetail />} />
              <Route
                path="/fabrics/:fabricId/sample-order"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <SampleOrderForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fabrics/new"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <FabricForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fabrics/:id/edit"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <FabricForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fabrics/me/list"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <MyFabrics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <InventoryManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplier-orders"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplierOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers/:supplierId/bulk-order"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <BulkOrderForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verifications"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminVerifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/videos"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminVideoManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/workshops"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminWorkshopManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminNewsManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/supplies" element={<SupplyListing />} />
              <Route path="/supplies/:id" element={<SupplyDetail />} />
              <Route
                path="/supplies/new"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplyForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplies/:id/edit"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <SupplyForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplies/me/list"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <MySupplies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supply-order/:supplierId"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <SupplyOrderForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supply-orders/:id"
                element={
                  <ProtectedRoute>
                    <SupplyOrderTracking />
                  </ProtectedRoute>
                }
              />
              <Route path="/patterns" element={<PatternLibrary />} />
              <Route path="/patterns/:id" element={<PatternDetail />} />
              <Route
                path="/patterns/:id/collaboration"
                element={
                  <ProtectedRoute>
                    <PatternCollaboration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patterns/new"
                element={
                  <ProtectedRoute>
                    <PatternForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patterns/:id/edit"
                element={
                  <ProtectedRoute>
                    <PatternForm />
                  </ProtectedRoute>
                }
              />
              <Route path="/pattern-tools" element={<PatternTools />} />
              <Route
                path="/pattern-designer"
                element={
                  <ProtectedRoute>
                    <PatternDesigner />
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
              <Route path="/learning" element={<LearningPortal />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/forums" element={<ForumList />} />
              <Route
                path="/forums/new"
                element={
                  <ProtectedRoute>
                    <ForumForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forums/:id/edit"
                element={
                  <ProtectedRoute>
                    <ForumForm />
                  </ProtectedRoute>
                }
              />
              <Route path="/forums/:id" element={<ForumDetail />} />
              <Route path="/workshops" element={<WorkshopList />} />
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/:id" element={<NewsList />} />
              <Route path="/mentorships" element={<MentorshipProgram />} />
              <Route path="/price-comparison" element={<PriceComparison />} />
              <Route path="/equipment" element={<EquipmentMarketplace />} />
              <Route path="/equipment/new" element={<ProtectedRoute requiredRole="supplier"><EquipmentForm /></ProtectedRoute>} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              <Route path="/equipment/:id/edit" element={<ProtectedRoute requiredRole="supplier"><EquipmentForm /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><MaintenanceBooking /></ProtectedRoute>} />
              <Route path="/virtual-stylist" element={<VirtualStylist />} />
              <Route path="/virtual-tryon" element={<ProtectedRoute><VirtualTryOn /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
