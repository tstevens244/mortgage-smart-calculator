import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RefinanceCalculator from "@/components/RefinanceCalculator";

const Refinance = () => {
  const canonicalUrl = "https://mortgagecalc.example.com/refinance";

  return (
    <>
      <Helmet>
        <title>Refinance Calculator | Should I Refinance My Mortgage?</title>
        <meta
          name="description"
          content="Calculate if refinancing your mortgage makes sense. Compare interest savings, closing costs, and break-even timeline to make an informed decision."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Refinance Calculator | Mortgage Refinancing Analysis" />
        <meta
          property="og:description"
          content="Should you refinance your mortgage? Calculate potential savings, compare monthly payments, and find your break-even point."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Refinance Calculator" />
        <meta
          name="twitter:description"
          content="Calculate if refinancing your mortgage will save you money."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Refinance Calculator",
            applicationCategory: "FinanceApplication",
            description:
              "Free calculator to determine if refinancing your mortgage makes financial sense by comparing interest savings against closing costs.",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 container py-8">
          <article>
            <header className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Refinance Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unsure if you should refinance? Let us help calculate your options. 
                Compare interest savings and equity gains against closing costs.
              </p>
            </header>

            <RefinanceCalculator />

            <section className="mt-12 prose prose-slate max-w-none">
              <h2 className="text-2xl font-display font-semibold mb-4">Calculate Interest Savings & Additional Homeowner Equity</h2>
              <p className="text-muted-foreground leading-relaxed">
                This calculator is for homeowners who are looking to make a strictly economic decision in terms of 
                which loan will be better based upon comparing the interest expense and home equity against the 
                closing costs associated with refinancing their home.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Keys to Consider When Calculating Potential Refi Savings</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <strong>Years before sell:</strong> This setting runs both loans from present until that date. If you don't plan on 
                  selling the home or refinancing again until after the loan is paid off, set this figure to match your new loan term.
                </li>
                <li>
                  <strong>Standard deductions:</strong> If you're going to use standard deductions when filing your income taxes, 
                  set the state & federal tax rates to zero to remove that feature from your calculation.
                </li>
                <li>
                  <strong>Break-even point:</strong> Consider how long it takes to recover closing costs through savings. 
                  If you plan to move before reaching break-even, refinancing may not be worthwhile.
                </li>
              </ul>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Should I Refinance My Mortgage?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Is your current interest rate on your house too high? Refinancing can help you save money by reducing 
                your interest rate, shortening your loan term to build equity faster, or switching from an adjustable 
                to a fixed rate for payment stability. Use this calculator to estimate your savings at a lower APR 
                and determine if refinancing makes sense for your situation.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">When Does Refinancing Make Sense?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Refinancing typically makes sense when: you can lower your interest rate by at least 0.5-1%, 
                you plan to stay in your home long enough to recover closing costs, you want to switch from an 
                adjustable-rate to a fixed-rate mortgage, or you want to shorten your loan term to pay off your 
                home faster and save on total interest.
              </p>
            </section>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Refinance;
