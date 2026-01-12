import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QualificationCalculator from "@/components/QualificationCalculator";

const Qualification = () => {
  return (
    <>
      <Helmet>
        <title>Mortgage Qualification Calculator | How Much Income Do I Need?</title>
        <meta
          name="description"
          content="Calculate the minimum income required to qualify for a mortgage. Estimate your required annual salary based on home price, down payment, and debt-to-income ratios."
        />
        <link rel="canonical" href="https://mortgagecalc.com/qualification" />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Mortgage Qualification Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate the minimum income needed to qualify for your desired home
            </p>
          </header>
          <QualificationCalculator />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Qualification;
