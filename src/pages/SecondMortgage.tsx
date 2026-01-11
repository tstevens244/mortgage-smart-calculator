import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SecondMortgageCalculator from "@/components/SecondMortgageCalculator";

const SecondMortgage = () => {
  const canonicalUrl = "https://mortgagecalc.example.com/second-mortgage";

  return (
    <>
      <Helmet>
        <title>Second Mortgage Calculator | PMI vs Piggyback Loan Comparison</title>
        <meta
          name="description"
          content="Compare the cost of PMI versus a second mortgage (piggyback loan). Calculate if an 80/10/10 or 80/20 loan structure saves you money."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Second Mortgage Calculator | PMI vs Piggyback Loan" />
        <meta
          property="og:description"
          content="Should you pay PMI or take a second mortgage? Use our calculator to compare costs and find the best option for your home purchase."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Second Mortgage Calculator" />
        <meta
          name="twitter:description"
          content="Compare PMI costs vs second mortgage to find the best financing option."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Second Mortgage Calculator",
            applicationCategory: "FinanceApplication",
            description:
              "Free calculator to compare PMI costs versus taking a second mortgage (piggyback loan) to avoid PMI.",
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
                Second Mortgage Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Compare obtaining a piggyback home equity loan versus the cost of PMI. 
                Find out which option saves you more money.
              </p>
            </header>

            <SecondMortgageCalculator />

            <section className="mt-12 prose prose-slate max-w-none">
              <h2 className="text-2xl font-display font-semibold mb-4">Should I Pay PMI or Take a Second Mortgage?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Is property mortgage insurance (PMI) too expensive? Some home owners obtain a low-rate second mortgage 
                from another lender to bypass PMI payment requirements. Use this calculator to see if this option would 
                save you money on your home loan.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">What is a Piggyback Loan?</h3>
              <p className="text-muted-foreground leading-relaxed">
                A piggyback loan, also known as an 80/10/10 or 80/20 loan, involves taking out two mortgages simultaneously. 
                The first mortgage covers 80% of the home's value (avoiding PMI requirements), while the second mortgage 
                covers part or all of the remaining amount. Your down payment covers whatever is left.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">How Does This Calculator Work?</h3>
              <p className="text-muted-foreground leading-relaxed">
                This calculator compares two scenarios: (1) taking a single mortgage with PMI, and (2) taking an 80% first 
                mortgage plus a second mortgage to avoid PMI. It calculates total costs including closing costs, monthly 
                payments, and total interest over the life of the loans to help you determine which option is more economical.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">When Does a Second Mortgage Make Sense?</h3>
              <p className="text-muted-foreground leading-relaxed">
                A second mortgage typically makes sense when: the interest rate on the second mortgage is competitive, 
                you plan to stay in the home long enough to recoup higher upfront costs, PMI rates in your area are 
                particularly high, or you want to avoid the hassle of canceling PMI later.
              </p>
            </section>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SecondMortgage;
