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
        <div className="lg:col-span-2 space-y-6">
          <section className="calculator-card p-6" aria-labelledby="loan-details-heading">
            <h2 id="loan-details-heading" className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <Home className="h-5 w-5 text-accent" aria-hidden="true" />
              Loan Details
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="input-group">
                <Label htmlFor="home-price" className="input-label">
                  <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Home Price
                </Label>
                <Input
                  id="home-price"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.homePrice)}
                  onChange={(e) => updateInput("homePrice", parseNumber(e.target.value))}
                  className="text-lg font-medium"
                  aria-describedby="home-price-desc"
                />
                <span id="home-price-desc" className="sr-only">Enter the total price of the home</span>
              </div>

              <div className="input-group">
                <Label htmlFor="down-payment" className="input-label">
                  <Percent className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Down Payment
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="down-payment"
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(inputs.downPayment)}
                    onChange={(e) => updateInput("downPayment", parseNumber(e.target.value))}
                    className="flex-1 text-lg font-medium"
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={inputs.downPaymentPercent.toFixed(1)}
                    onChange={(e) => updateInput("downPaymentPercent", parseFloat(e.target.value) || 0)}
                    className="w-20 text-center"
                    aria-label="Down payment percentage"
                  />
                  <span className="flex items-center text-muted-foreground">%</span>
                </div>
              </div>

              <div className="input-group">
                <Label htmlFor="loan-term" className="input-label">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Loan Term
                </Label>
                <Select
                  value={inputs.loanTerm.toString()}
                  onValueChange={(v) => updateInput("loanTerm", parseInt(v))}
                >
                  <SelectTrigger id="loan-term" className="text-lg font-medium">
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

              <div className="input-group">
                <Label htmlFor="interest-rate" className="input-label">
                  <Percent className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Interest Rate
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="interest-rate"
                    type="text"
                    inputMode="decimal"
                    value={inputs.interestRate}
                    onChange={(e) => updateInput("interestRate", parseFloat(e.target.value) || 0)}
                    className="text-lg font-medium"
                  />
                  <span className="flex items-center text-muted-foreground">%</span>
                </div>
              </div>

              <div className="input-group sm:col-span-2">
                <Label htmlFor="start-date" className="input-label">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Loan Start Date
                </Label>
                <Input
                  id="start-date"
                  type="month"
                  value={inputs.startDate}
                  onChange={(e) => updateInput("startDate", e.target.value)}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </section>

          <section className="calculator-card p-6" aria-labelledby="additional-costs-heading">
            <h2 id="additional-costs-heading" className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
              Additional Costs
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="input-group">
                <Label htmlFor="property-tax" className="input-label">
                  <Building className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Property Tax (yearly)
                </Label>
                <Input
                  id="property-tax"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.propertyTax)}
                  onChange={(e) => updateInput("propertyTax", parseNumber(e.target.value))}
                  className="text-lg font-medium"
                />
              </div>

              <div className="input-group">
                <Label htmlFor="home-insurance" className="input-label">
                  <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Home Insurance (yearly)
                </Label>
                <Input
                  id="home-insurance"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.homeInsurance)}
                  onChange={(e) => updateInput("homeInsurance", parseNumber(e.target.value))}
                  className="text-lg font-medium"
                />
              </div>

              <div className="input-group">
                <Label htmlFor="pmi" className="input-label">
                  <Percent className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  PMI (yearly)
                  {inputs.downPaymentPercent < 20 && (
                    <span className="text-xs text-accent ml-auto">Auto-calculated</span>
                  )}
                </Label>
                <Input
                  id="pmi"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(Math.round(inputs.pmi))}
                  onChange={(e) => updateInput("pmi", parseNumber(e.target.value))}
                  className="text-lg font-medium"
                />
              </div>

              <div className="input-group">
                <Label htmlFor="hoa-fees" className="input-label">
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  HOA Fees (monthly)
                </Label>
                <Input
                  id="hoa-fees"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(inputs.hoaFees)}
                  onChange={(e) => updateInput("hoaFees", parseNumber(e.target.value))}
                  className="text-lg font-medium"
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
          <TabsList className="mb-6">
            <TabsTrigger value="breakdown">Payment Breakdown</TabsTrigger>
            <TabsTrigger value="chart">Amortization Chart</TabsTrigger>
            <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
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
