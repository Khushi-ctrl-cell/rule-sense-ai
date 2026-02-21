import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";
import DashboardPage from "./pages/DashboardPage";
import RulesPage from "./pages/RulesPage";
import ViolationsPage from "./pages/ViolationsPage";
import RiskPage from "./pages/RiskPage";
import AuditPage from "./pages/AuditPage";
import SimulatorPage from "./pages/SimulatorPage";
import NetworkPage from "./pages/NetworkPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppSidebar>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/violations" element={<ViolationsPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppSidebar>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
