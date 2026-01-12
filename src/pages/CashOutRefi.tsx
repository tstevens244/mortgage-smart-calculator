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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <article>
            <header className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Cash-Out Refinance Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how much equity you can access from your home
              </p>
            </header>

            <CashOutRefiCalculator />

            <section className="mt-12 prose prose-slate max-w-none">
              <h2 className="text-2xl font-display font-semibold mb-4">What is a Cash-Out Refinance?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A cash-out refinance replaces your existing mortgage with a new, larger loan. The difference 
                between your old loan balance and the new loan amount is paid to you in cash. This allows 
                homeowners to tap into their home equity for major expenses like home improvements, debt 
                consolidation, or other financial goals.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">How Does Cash-Out Refinancing Work?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Lenders typically allow you to borrow up to 80% of your home's current value. For example, 
                if your home is worth $400,000 and you owe $200,000, you could potentially access up to 
                $120,000 in cash ($400,000 × 80% = $320,000, minus $200,000 owed = $120,000). Your new loan 
                amount would be $320,000, and you'd receive $120,000 after paying off your existing mortgage.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">When Does a Cash-Out Refi Make Sense?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cash-out refinancing may be a good option when: you have significant home equity, current 
                interest rates are favorable compared to your existing rate, you need funds for home improvements 
                (which can add value), or you want to consolidate high-interest debt. It typically makes less sense 
                if rates have risen significantly or you plan to move soon.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Important Considerations</h3>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Closing costs:</strong> Expect to pay 2-5% of the loan amount in closing costs.</li>
                <li><strong>Higher monthly payment:</strong> A larger loan means higher monthly payments.</li>
                <li><strong>Equity reduction:</strong> You're converting equity to debt, reducing your ownership stake.</li>
                <li><strong>Risk:</strong> Your home secures the loan—failure to pay could mean foreclosure.</li>
              </ul>
            </section>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CashOutRefi;
