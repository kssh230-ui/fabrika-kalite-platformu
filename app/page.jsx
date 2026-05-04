"use client";
import { useState } from "react";
import Navigation from "../components/Navigation";
import ProductionScreen from "../components/production/ProductionScreen";
import InstallerScreen from "../components/installer/InstallerScreen";
import DashboardScreen from "../components/dashboard/DashboardScreen";

export default function Home() {
  const [activePage, setActivePage] = useState("production");

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Navigation activePage={activePage} setActivePage={setActivePage} />
      <main className="pb-20 md:pb-4 md:pt-0">
        {activePage === "production" && <ProductionScreen />}
        {activePage === "installer" && <InstallerScreen />}
        {activePage === "dashboard" && <DashboardScreen />}
      </main>
    </div>
  );
}
