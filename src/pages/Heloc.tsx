import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HelocCalculator from "@/components/HelocCalculator";

const Heloc = () => {
  const canonicalUrl = "https://mortgagecalc.example.com/heloc";

  return (
    <>
      <Helmet>
        <title>HELOC Calculator | Home Equity Line of Credit vs Debt Consolidation</title>
        <meta
          name="description"
          content="Should you use a HELOC to consolidate debts? Compare keeping existing debts vs home equity line of credit. Calculate monthly savings and total costs."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="HELOC Calculator | Home Equity Line of Credit" />
        <meta
          property="og:description"
          content="Calculate if a HELOC makes sense for debt consolidation. Compare interest rates, monthly payments, and total costs."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HELOC Calculator" />
        <meta
          name="twitter:description"
          content="Compare HELOC debt consolidation vs keeping existing debts."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "HELOC Calculator",
            applicationCategory: "FinanceApplication",
            description:
              "Free calculator to compare using a home equity line of credit (HELOC) for debt consolidation versus keeping existing debts.",
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
                HELOC Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Should you use a Home Equity Loan, HELOC, or Cash Out Refinance to consolidate your debts? 
                Compare your options and find out which saves you more.
              </p>
            </header>

            <HelocCalculator />

            <section className="mt-12 prose prose-slate max-w-none">
              <h2 className="text-2xl font-display font-semibold mb-4">Home Equity Line of Credit Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">
                Do you currently carry high interest revolving credit on credit cards, cars & other personal loans? 
                You may be able to leverage a home equity line of credit (HELOC) to lower your monthly debt payments. 
                Lenders typically allow borrowers to receive up to 80% of their home equity, though the precise LTV limit 
                will depend on broader market conditions, your credit score, and how valuable your customer relationship is to the bank.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">When Does a HELOC Make Sense?</h3>
              <p className="text-muted-foreground leading-relaxed">
                A HELOC for debt consolidation typically makes sense when: you have significant home equity, 
                your current debts carry high interest rates (especially credit cards), you need lower monthly payments 
                to improve cash flow, and you're disciplined enough not to run up new credit card balances after consolidating.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Risks to Consider</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unlike credit cards and personal loans, a HELOC is secured by your home. If you can't make payments, 
                you risk foreclosure. Additionally, HELOCs typically have variable interest rates that can increase over time. 
                The longer repayment period means you may pay more total interest, even at a lower rate.
              </p>

              <h3 className="text-xl font-display font-semibold mt-8 mb-3">Tax Implications</h3>
              <p className="text-muted-foreground leading-relaxed">
                Prior to 2017, HELOC interest was tax deductible regardless of how funds were used. 
                Now, interest is only deductible if used for home improvements. If you're consolidating credit card debt, 
                set the tax rate to 0% in this calculator to get accurate results.
              </p>
            </section>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Heloc;
