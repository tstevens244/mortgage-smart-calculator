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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <article>
            <header className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                How Much House Can I Afford?
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Estimate your maximum home price based on income or monthly budget
              </p>
            </header>

            <AffordabilityCalculator />

            <section className="mt-12 prose prose-slate max-w-none">
              <h2 className="text-2xl font-display font-semibold mb-4">Calculating Home Affordability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Determining how much house you can afford involves more than just your income. This calculator 
                considers your debt-to-income ratio, down payment, interest rate, property taxes, insurance, 
                and HOA fees to give you a realistic maximum home price. Use either the income-based or 
                budget-based approach depending on your situation.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">The 28/36 Rule Explained</h3>
              <p className="text-muted-foreground leading-relaxed">
                The traditional guideline says your monthly housing costs (mortgage, taxes, insurance) shouldn't 
                exceed 28% of your gross monthly income (front-end ratio), and your total monthly debts shouldn't 
                exceed 36% of gross income (back-end ratio). More aggressive ratios like 31/43 (FHA) may allow 
                for a higher purchase price but come with greater financial risk.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Income-Based vs Budget-Based</h3>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Income-based:</strong> Uses DTI rules to calculate maximum housing payment from your income. Best for understanding lender limits.</li>
                <li><strong>Budget-based:</strong> Starts with what you're comfortable paying monthly. Best for personal financial planning.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Don't Forget Hidden Costs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Beyond your mortgage payment, budget for: property taxes (varies widely by location), homeowner's 
                insurance, PMI if your down payment is under 20%, HOA fees for condos or planned communities, 
                maintenance and repairs (typically 1-2% of home value annually), and utilities. These costs can 
                add hundreds or thousands to your monthly housing expenses.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Tips for First-Time Buyers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Just because you qualify for a certain amount doesn't mean you should borrow it all. Consider 
                your lifestyle, savings goals, and job stability. A conservative approach leaves room for 
                unexpected expenses and prevents becoming "house poor." Many financial advisors suggest aiming 
                for the lower end of your affordability range.
              </p>
            </section>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Affordability;
