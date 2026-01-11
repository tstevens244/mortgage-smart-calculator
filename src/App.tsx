import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SecondMortgage from "./pages/SecondMortgage";
import Heloc from "./pages/Heloc";
import Refinance from "./pages/Refinance";
import CashOutRefi from "./pages/CashOutRefi";
import Affordability from "./pages/Affordability";
import Qualification from "./pages/Qualification";
import RentOrBuy from "./pages/RentOrBuy";
import ExtraPayments from "./pages/ExtraPayments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/second-mortgage" element={<SecondMortgage />} />
            <Route path="/heloc" element={<Heloc />} />
            <Route path="/refinance" element={<Refinance />} />
            <Route path="/cash-out-refinance" element={<CashOutRefi />} />
            <Route path="/affordability" element={<Affordability />} />
            <Route path="/qualification" element={<Qualification />} />
            <Route path="/rent-or-buy" element={<RentOrBuy />} />
            <Route path="/extra-payments" element={<ExtraPayments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
