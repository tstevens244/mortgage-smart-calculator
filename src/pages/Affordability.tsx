import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";

const Affordability = () => {
  return (
    <>
      <Helmet>
        <title>How Much House Can I Afford? | Mortgage Affordability Calculator</title>
        <meta
          name="description"
          content="Calculate how much house you can afford based on your income, debts, and monthly budget. Estimate your maximum home price with our free affordability calculator."
        />
        <link rel="canonical" href="https://mortgagecalc.com/affordability" />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              How Much House Can I Afford?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estimate your maximum home price based on income or monthly budget
            </p>
          </header>
          <AffordabilityCalculator />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Affordability;
