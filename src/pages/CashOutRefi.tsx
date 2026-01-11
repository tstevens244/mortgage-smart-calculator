import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CashOutRefiCalculator from "@/components/CashOutRefiCalculator";

const CashOutRefi = () => {
  return (
    <>
      <Helmet>
        <title>Cash-Out Refinance Calculator | MortgageCalc</title>
        <meta
          name="description"
          content="Calculate how much cash you can extract from your home equity with a cash-out refinance. Estimate your new loan balance, monthly payment, and maximum cash-out amount."
        />
        <link rel="canonical" href="https://mortgagecalc.com/cash-out-refinance" />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-6 md:py-10">
          <div className="max-w-5xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Cash-Out Refinance Calculator
              </h1>
              <p className="text-muted-foreground">
                See how much equity you can access from your home
              </p>
            </header>
            <CashOutRefiCalculator />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CashOutRefi;
