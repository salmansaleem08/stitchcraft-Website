import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import SupplierDashboard from "./SupplierDashboard";
import TailorDashboard from "./TailorDashboard";
import OrderDashboard from "./OrderDashboard";

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === "supplier") {
    return <SupplierDashboard />;
  }

  if (user?.role === "tailor") {
    return <TailorDashboard />;
  }

  return <OrderDashboard />;
};

export default DashboardRouter;

