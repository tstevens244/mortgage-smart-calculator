import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BiWeeklyCalculator from "@/components/BiWeeklyCalculator";

const BiWeeklyPayments = () => {
  return (
    <>
      <Helmet>
        <title>Bi-Weekly Mortgage Payment Calculator | Pay Off Your Loan Faster</title>
        <meta
          name="description"
          content="Calculate how bi-weekly mortgage payments can save you thousands in interest and pay off your loan years early. Compare standard vs bi-weekly payment schedules."
        />
        <link rel="canonical" href="https://mortgagecalc.example.com/bi-weekly-payments" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container py-8 md:py-12">
            <div className="max-w-5xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                  Bi-Weekly Mortgage Payment Calculator
                </h1>
                <p className="text-muted-foreground text-lg">
                  See how switching to bi-weekly payments can save you thousands and shave years off your mortgage.
                </p>
              </header>

              <BiWeeklyCalculator />
              
              <section className="mt-12 prose prose-sm max-w-none">
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  How Bi-Weekly Payments Work
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    With bi-weekly payments, you pay half your monthly mortgage payment every two weeks. 
                    Since there are 52 weeks in a year, you make 26 half-payments, which equals 13 full 
                    monthly payments instead of 12. That extra payment goes directly toward your principal, 
                    reducing your loan balance faster and saving you money on interest.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-foreground mt-6">Benefits of Bi-Weekly Payments</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Pay Off Faster:</strong> You'll pay off a 30-year mortgage 4-6 years early.</li>
                    <li><strong>Save on Interest:</strong> Less time paying means less interest charged.</li>
                    <li><strong>Build Equity Faster:</strong> More frequent principal payments accelerate equity growth.</li>
                    <li><strong>Budget-Friendly:</strong> Smaller, more frequent payments may align better with paychecks.</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-foreground mt-6">Important Considerations</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Lender Setup:</strong> Some lenders offer official bi-weekly programs, while others don't. Check with your lender.</li>
                    <li><strong>DIY Approach:</strong> You can simulate bi-weekly payments by adding 1/12 of your payment to each monthly payment.</li>
                    <li><strong>Watch for Fees:</strong> Some third-party bi-weekly services charge setup or processing fees.</li>
                    <li><strong>Tax Implications:</strong> Paying less interest means a smaller mortgage interest deduction if you itemize.</li>
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

export default BiWeeklyPayments;
