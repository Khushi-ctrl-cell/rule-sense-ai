import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";
import AIChatBot from "./components/AIChatBot";
import DashboardPage from "./pages/DashboardPage";
import RulesPage from "./pages/RulesPage";
import NLRuleCreatorPage from "./pages/NLRuleCreatorPage";
import ViolationsPage from "./pages/ViolationsPage";
import CaseManagementPage from "./pages/CaseManagementPage";
import RiskPage from "./pages/RiskPage";
import RuleAnalyticsPage from "./pages/RuleAnalyticsPage";
import AuditPage from "./pages/AuditPage";
import SimulatorPage from "./pages/SimulatorPage";
import NetworkPage from "./pages/NetworkPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import BenchmarksPage from "./pages/BenchmarksPage";
import DataIntegrityPage from "./pages/DataIntegrityPage";
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
            <Route path="/nl-rules" element={<NLRuleCreatorPage />} />
            <Route path="/violations" element={<ViolationsPage />} />
            <Route path="/cases" element={<CaseManagementPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/rule-analytics" element={<RuleAnalyticsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/benchmarks" element={<BenchmarksPage />} />
            <Route path="/data-integrity" element={<DataIntegrityPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppSidebar>
        <AIChatBot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
