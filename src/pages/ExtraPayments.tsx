import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExtraPaymentsCalculator from "@/components/ExtraPaymentsCalculator";

const ExtraPayments = () => {
  return (
    <>
      <Helmet>
        <title>Extra Mortgage Payments Calculator | Save on Interest</title>
        <meta
          name="description"
          content="Calculate how extra mortgage payments can save you thousands in interest and pay off your loan years early. See the impact of additional monthly or lump-sum payments."
        />
        <link rel="canonical" href="https://mortgagecalc.example.com/extra-payments" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container py-8 md:py-12">
            <div className="max-w-5xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                  Extra Mortgage Payments Calculator
                </h1>
                <p className="text-muted-foreground text-lg">
                  See how paying a little extra each month can save you thousands and help you become mortgage-free years sooner.
                </p>
              </header>

              <ExtraPaymentsCalculator />
              
              <section className="mt-12 prose prose-sm max-w-none">
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  The Power of Extra Mortgage Payments
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Making extra payments on your mortgage is one of the most effective ways to build equity faster 
                    and reduce the total cost of your home. Even small additional amounts can make a significant 
                    difference over time.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-foreground mt-6">Strategies for Extra Payments</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Round Up:</strong> Round your monthly payment to the nearest $100 for easy, painless extra payments.</li>
                    <li><strong>Bi-Weekly Payments:</strong> Pay half your mortgage every two weeks instead of monthly to make 13 full payments per year.</li>
                    <li><strong>Annual Lump Sum:</strong> Use tax refunds or bonuses to make yearly lump-sum payments.</li>
                    <li><strong>Refinance Savings:</strong> If you refinance to a lower rate, continue paying the original amount.</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-foreground mt-6">Important Considerations</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Verify your lender applies extra payments to principal, not future interest.</li>
                    <li>Check for prepayment penalties before making large extra payments.</li>
                    <li>Consider whether the money might be better used for higher-interest debt or investments.</li>
                    <li>Maintain an emergency fund before aggressively paying down your mortgage.</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ExtraPayments;
