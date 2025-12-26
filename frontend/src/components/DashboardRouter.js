import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import SupplierDashboard from "./SupplierDashboard";
import OrderDashboard from "./OrderDashboard";

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === "supplier") {
    return <SupplierDashboard />;
  }

  return <OrderDashboard />;
};

export default DashboardRouter;

