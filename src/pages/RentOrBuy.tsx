import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RentOrBuyCalculator from "@/components/RentOrBuyCalculator";

const RentOrBuy = () => {
  return (
    <>
      <Helmet>
        <title>Rent or Buy Calculator | Compare Renting vs Buying a Home</title>
        <meta
          name="description"
          content="Compare the financial costs and benefits of renting vs buying a home. Analyze rent appreciation, home appreciation, tax benefits, and ownership costs."
        />
        <link rel="canonical" href="https://mortgagecalc.example.com/rent-or-buy" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container py-8 md:py-12">
            <div className="max-w-5xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                  Rent or Buy Calculator
                </h1>
                <p className="text-muted-foreground text-lg">
                  Should you rent or buy? Compare the long-term financial impact of renting versus purchasing a home.
                </p>
              </header>

              <RentOrBuyCalculator />
              
              <section className="mt-12 prose prose-sm max-w-none">
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  Understanding the Rent vs Buy Decision
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    The decision to rent or buy a home is one of the most significant financial choices you'll make. 
                    This calculator helps you compare the true costs of each option by considering multiple factors 
                    including monthly payments, appreciation, tax benefits, and transaction costs.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-foreground mt-6">Key Factors to Consider</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Time Horizon:</strong> Buying generally makes more sense if you plan to stay for 5+ years.</li>
                    <li><strong>Home Appreciation:</strong> Markets vary widely; research local trends carefully.</li>
                    <li><strong>Rent Increases:</strong> Consider how rent typically increases in your area annually.</li>
                    <li><strong>Transaction Costs:</strong> Selling a home typically costs 6-10% of the sale price.</li>
                    <li><strong>Maintenance:</strong> Homeowners should budget 1-2% of home value annually for repairs.</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-foreground mt-6">Tax Considerations</h3>
                  <p>
                    The mortgage interest deduction can provide significant tax benefits for homeowners who itemize. 
                    However, with the increased standard deduction, fewer taxpayers now benefit from itemizing. 
                    Enter your marginal tax rate only if you plan to itemize deductions.
                  </p>
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

export default RentOrBuy;
