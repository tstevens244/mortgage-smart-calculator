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
        <main className="flex-1 container py-8">
          <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Cash-Out Refinance Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how much equity you can access from your home
            </p>
          </header>
          <CashOutRefiCalculator />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CashOutRefi;
