import { useState, useMemo } from "react";
import { Calculator, Home, Percent, Calendar, DollarSign, Shield, Building, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentBreakdown from "./PaymentBreakdown";
import AmortizationSchedule from "./AmortizationSchedule";
import AmortizationChart from "./AmortizationChart";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/formatters";

interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanTerm: number;
  interestRate: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoaFees: number;
  startDate: string;
}

const MortgageCalculator = () => {
  const [inputs, setInputs] = useState<MortgageInputs>({
    homePrice: 300000,
    downPayment: 60000,
    downPaymentPercent: 20,
    loanTerm: 30,
    interestRate: 6.5,
    propertyTax: 3600,
    homeInsurance: 1200,
    pmi: 0,
    hoaFees: 0,
    startDate: new Date().toISOString().slice(0, 7),
  });

  const updateInput = (field: keyof MortgageInputs, value: number | string) => {
    setInputs((prev) => {
      const updated = { ...prev, [field]: value };
      
      if (field === "downPayment") {
        updated.downPaymentPercent = (Number(value) / prev.homePrice) * 100;
      } else if (field === "downPaymentPercent") {
        updated.downPayment = (Number(value) / 100) * prev.homePrice;
      } else if (field === "homePrice") {
        updated.downPayment = (prev.downPaymentPercent / 100) * Number(value);
      }

      // Auto-calculate PMI if down payment < 20%
      if (updated.downPaymentPercent < 20) {
        const loanAmount = updated.homePrice - updated.downPayment;
        updated.pmi = (loanAmount * 0.005) / 12 * 12; // 0.5% annual PMI
      } else {
        updated.pmi = 0;
      }

      return updated;
    });
  };

  const calculations = useMemo(() => {
    const loanAmount = inputs.homePrice - inputs.downPayment;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;

    // Monthly principal & interest
    const monthlyPI =
      monthlyRate > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)
        : loanAmount / numPayments;

    const monthlyTax = inputs.propertyTax / 12;
    const monthlyInsurance = inputs.homeInsurance / 12;
    const monthlyPMI = inputs.pmi / 12;
    const monthlyHOA = inputs.hoaFees;

    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + monthlyHOA;
    const totalInterest = monthlyPI * numPayments - loanAmount;
    const totalPayment = totalMonthly * numPayments;

    return {
      loanAmount,
      monthlyPI,
      monthlyTax,
      monthlyInsurance,
      monthlyPMI,
      monthlyHOA,
      totalMonthly,
      totalInterest,
      totalPayment,
      numPayments,
    };
  }, [inputs]);

  const amortizationData = useMemo(() => {
    const data = [];
    let balance = calculations.loanAmount;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const startDate = new Date(inputs.startDate + "-01");

    for (let i = 1; i <= calculations.numPayments && balance > 0; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(calculations.monthlyPI - interestPayment, balance);
      balance = Math.max(0, balance - principalPayment);

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      data.push({
        month: i,
        date: paymentDate,
        payment: calculations.monthlyPI,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });
    }

    return data;
  }, [calculations, inputs.interestRate, inputs.startDate]);

  return (
    <div className="fade-in">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-2">
          <section className="calculator-card p-3 sm:p-6" aria-labelledby="loan-details-heading">
            <h2 id="loan-details-heading" className="text-base sm:text-xl font-display font-semibold mb-3 sm:mb-6 flex items-center gap-2">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
              Loan Details
            </h2>

            <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {/* Home Price */}
              <div className="flex items-center gap-2">
                <Label htmlFor="home-price" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Home Price</span>
                  <span className="sm:hidden">Price</span>
                </Label>
                <Input
                  id="home-price"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.homePrice)}
                  onChange={(e) => updateInput("homePrice", parseNumber(e.target.value))}
                  className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1"
                  aria-describedby="home-price-desc"
                />
                <span id="home-price-desc" className="sr-only">Enter the total price of the home</span>
              </div>

              {/* Down Payment */}
              <div className="flex items-center gap-2">
                <Label htmlFor="down-payment" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Percent className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Down Payment</span>
                  <span className="sm:hidden">Down</span>
                </Label>
                <div className="flex gap-1 sm:gap-2 flex-1">
                  <Input
                    id="down-payment"
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(inputs.downPayment)}
                    onChange={(e) => updateInput("downPayment", parseNumber(e.target.value))}
                    className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1"
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={inputs.downPaymentPercent.toFixed(1)}
                    onChange={(e) => updateInput("downPaymentPercent", parseFloat(e.target.value) || 0)}
                    className="h-8 sm:h-10 w-12 sm:w-16 text-center text-xs sm:text-sm"
                    aria-label="Down payment percentage"
                  />
                  <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div className="flex items-center gap-2">
                <Label htmlFor="loan-term" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Loan Term</span>
                  <span className="sm:hidden">Term</span>
                </Label>
                <Select
                  value={inputs.loanTerm.toString()}
                  onValueChange={(v) => updateInput("loanTerm", parseInt(v))}
                >
                  <SelectTrigger id="loan-term" className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                    <SelectItem value="30">30 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Rate */}
              <div className="flex items-center gap-2">
                <Label htmlFor="interest-rate" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Percent className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Interest Rate</span>
                  <span className="sm:hidden">Rate</span>
                </Label>
                <div className="flex gap-1 sm:gap-2 flex-1">
                  <Input
                    id="interest-rate"
                    type="text"
                    inputMode="decimal"
                    value={inputs.interestRate}
                    onChange={(e) => updateInput("interestRate", parseFloat(e.target.value) || 0)}
                    className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1"
                  />
                  <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                </div>
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-2">
                <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Start Date</span>
                  <span className="sm:hidden">Start</span>
                </Label>
                <div className="flex gap-1 sm:gap-2 flex-1">
                  <Select
                    value={inputs.startDate.split("-")[1]}
                    onValueChange={(month) => {
                      const year = inputs.startDate.split("-")[0];
                      updateInput("startDate", `${year}-${month}`);
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm flex-1">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">January</SelectItem>
                      <SelectItem value="02">February</SelectItem>
                      <SelectItem value="03">March</SelectItem>
                      <SelectItem value="04">April</SelectItem>
                      <SelectItem value="05">May</SelectItem>
                      <SelectItem value="06">June</SelectItem>
                      <SelectItem value="07">July</SelectItem>
                      <SelectItem value="08">August</SelectItem>
                      <SelectItem value="09">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={inputs.startDate.split("-")[0]}
                    onValueChange={(year) => {
                      const month = inputs.startDate.split("-")[1];
                      updateInput("startDate", `${year}-${month}`);
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm w-20 sm:w-24">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Costs Section */}
            <h2 id="additional-costs-heading" className="text-base sm:text-xl font-display font-semibold mt-4 sm:mt-6 mb-3 sm:mb-6 flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
              Additional Costs
            </h2>

            <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {/* Property Tax */}
              <div className="flex items-center gap-2">
                <Label htmlFor="property-tax" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Building className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Property Tax</span>
                  <span className="sm:hidden">Tax</span>
                </Label>
                <Input
                  id="property-tax"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.propertyTax)}
                  onChange={(e) => updateInput("propertyTax", parseNumber(e.target.value))}
                  className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1"
                />
              </div>

              {/* Home Insurance */}
              <div className="flex items-center gap-2">
                <Label htmlFor="home-insurance" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Insurance</span>
                  <span className="sm:hidden">Ins.</span>
                </Label>
                <Input
                  id="home-insurance"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.homeInsurance)}
                  onChange={(e) => updateInput("homeInsurance", parseNumber(e.target.value))}
                  className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1"
                />
              </div>

              {/* PMI */}
              <div className="flex items-center gap-2">
                <Label htmlFor="pmi" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Percent className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  PMI
                  {inputs.downPaymentPercent < 20 && (
                    <span className="text-[10px] sm:text-xs text-accent ml-1">Auto</span>
                  )}
                </Label>
                <Input
                  id="pmi"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(Math.round(inputs.pmi))}
                  onChange={(e) => updateInput("pmi", parseNumber(e.target.value))}
                  className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1"
                />
              </div>

              {/* HOA Fees */}
              <div className="flex items-center gap-2">
                <Label htmlFor="hoa-fees" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  HOA
                </Label>
                <Input
                  id="hoa-fees"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.hoaFees)}
                  onChange={(e) => updateInput("hoaFees", parseNumber(e.target.value))}
                  className="h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Results Section */}
        <aside className="space-y-6" aria-label="Calculation Results">
          <div className="result-highlight">
            <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wide">
              Monthly Payment
            </p>
            <p className="text-4xl lg:text-5xl font-display font-bold mt-2 number-pop">
              {formatCurrency(calculations.totalMonthly)}
            </p>
          </div>

          <div className="calculator-card p-6 space-y-4">
            <h3 className="font-semibold text-lg">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-medium">{formatCurrency(calculations.loanAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Principal & Interest</span>
                <span className="font-medium">{formatCurrency(calculations.monthlyPI)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Property Tax</span>
                <span className="font-medium">{formatCurrency(calculations.monthlyTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Home Insurance</span>
                <span className="font-medium">{formatCurrency(calculations.monthlyInsurance)}</span>
              </div>
              {calculations.monthlyPMI > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PMI</span>
                  <span className="font-medium">{formatCurrency(calculations.monthlyPMI)}</span>
                </div>
              )}
              {calculations.monthlyHOA > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">HOA Fees</span>
                  <span className="font-medium">{formatCurrency(calculations.monthlyHOA)}</span>
                </div>
              )}
              <hr className="border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Interest ({inputs.loanTerm} years)</span>
                <span className="font-medium">{formatCurrency(calculations.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total of All Payments</span>
                <span className="font-medium">{formatCurrency(calculations.totalPayment)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Charts and Schedule */}
      <div className="mt-8">
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="mb-6 w-full flex justify-start overflow-x-auto">
            <TabsTrigger value="breakdown" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Payment Breakdown</span>
              <span className="sm:hidden">Breakdown</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Amortization Chart</span>
              <span className="sm:hidden">Chart</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Amortization Schedule</span>
              <span className="sm:hidden">Schedule</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown">
            <PaymentBreakdown
              principal={calculations.monthlyPI - (calculations.loanAmount * (inputs.interestRate / 100 / 12))}
              interest={calculations.loanAmount * (inputs.interestRate / 100 / 12)}
              tax={calculations.monthlyTax}
              insurance={calculations.monthlyInsurance}
              pmi={calculations.monthlyPMI}
              hoa={calculations.monthlyHOA}
            />
          </TabsContent>

          <TabsContent value="chart">
            <AmortizationChart
              data={amortizationData}
              monthlyTax={calculations.monthlyTax}
              monthlyInsurance={calculations.monthlyInsurance}
              monthlyPMI={calculations.monthlyPMI}
              monthlyHOA={calculations.monthlyHOA}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <AmortizationSchedule data={amortizationData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MortgageCalculator;
