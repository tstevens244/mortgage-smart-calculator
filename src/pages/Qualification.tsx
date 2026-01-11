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
        <main className="flex-1 container py-6 md:py-10">
          <div className="max-w-5xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Mortgage Qualification Calculator
              </h1>
              <p className="text-muted-foreground">
                Calculate the minimum income needed to qualify for your desired home
              </p>
            </header>
            <QualificationCalculator />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Qualification;
