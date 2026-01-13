import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";

const AI = () => {
  const canonicalUrl = "https://mortgagecalc.example.com/ai";

  return (
    <>
      <Helmet>
        <title>AI Mortgage Assistant | Get Personalized Calculator Recommendations</title>
        <meta
          name="description"
          content="Chat with our AI assistant to find the right mortgage calculator for your needs. Get personalized recommendations and answers to your mortgage questions."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="AI Mortgage Assistant" />
        <meta
          property="og:description"
          content="Get personalized mortgage calculator recommendations with our AI assistant."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 container px-3 sm:px-4 py-2 sm:py-8 flex flex-col">
          <article className="flex flex-col flex-1">
            {/* Hide header on mobile to prioritize chat */}
            <header className="text-center mb-3 sm:mb-10 hidden sm:block">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold text-foreground mb-2 sm:mb-4">
                AI Mortgage Assistant
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Tell me about your mortgage needs and I'll help you find the right calculator.
              </p>
            </header>

            <AIChatbot />

            {/* Hide extra content on mobile */}
            <section className="mt-8 sm:mt-12 prose prose-slate max-w-none px-1 hidden sm:block">
              <h2 className="text-xl sm:text-2xl font-display font-semibold mb-3 sm:mb-4">How Can I Help You?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Our AI assistant can guide you to the right mortgage calculator based on your specific needs.
                Whether you're buying your first home, refinancing, or exploring options like HELOCs and
                second mortgages, I'm here to help you find the tools you need.
              </p>

              <h3 className="text-lg sm:text-xl font-display font-semibold mt-6 sm:mt-8 mb-2 sm:mb-3">Available Calculators</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We offer calculators for standard mortgages, second mortgages, HELOCs, refinancing,
                cash-out refinancing, affordability analysis, qualification estimates, rent vs. buy comparisons,
                extra payment strategies, and bi-weekly payment schedules.
              </p>
            </section>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AI;
