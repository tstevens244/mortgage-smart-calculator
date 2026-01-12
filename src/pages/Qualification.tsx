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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <article>
            <header className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Mortgage Qualification Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Calculate the minimum income needed to qualify for your desired home
              </p>
            </header>

            <QualificationCalculator />

            <section className="mt-12 prose prose-slate max-w-none">
              <h2 className="text-2xl font-display font-semibold mb-4">How Much Income Do You Need for a Mortgage?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mortgage lenders use debt-to-income (DTI) ratios to determine how much you can borrow. This calculator 
                works backward from your desired home price to show the minimum annual income required to qualify. 
                Understanding these requirements helps you set realistic home-buying goals.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Understanding Debt-to-Income Ratios</h3>
              <p className="text-muted-foreground leading-relaxed">
                Lenders typically look at two DTI ratios: the front-end ratio (housing costs divided by gross income) 
                and the back-end ratio (all monthly debts divided by gross income). Common limits are 28% front-end 
                and 36% back-end for conventional loans, though FHA loans may allow up to 31%/43%.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Factors That Affect Qualification</h3>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Credit score:</strong> Higher scores may qualify for better rates and higher loan amounts.</li>
                <li><strong>Down payment:</strong> Larger down payments reduce the loan amount needed.</li>
                <li><strong>Existing debts:</strong> Car loans, student loans, and credit cards reduce borrowing power.</li>
                <li><strong>Interest rate:</strong> Lower rates mean lower monthly payments and easier qualification.</li>
                <li><strong>Loan type:</strong> FHA, VA, and USDA loans have different qualification requirements.</li>
              </ul>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Tips for Improving Your Qualification</h3>
              <p className="text-muted-foreground leading-relaxed">
                To qualify for a larger mortgage or improve your chances of approval: pay down existing debts to 
                lower your DTI, improve your credit score, save for a larger down payment, consider a longer loan 
                term to reduce monthly payments, or look for homes in a lower price range. Getting pre-approved 
                shows sellers you're a serious buyer.
              </p>
            </section>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Qualification;
