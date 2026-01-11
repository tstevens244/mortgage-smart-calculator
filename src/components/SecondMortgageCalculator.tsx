import { useState, useMemo } from "react";
import { Home, Percent, Calendar, DollarSign, Shield, Building, Users, Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency } from "@/lib/formatters";

interface SecondMortgageInputs {
  homeValue: number;
  downPayment: number;
  downPaymentPercent: number;
  annualPMI: number;
  propertyTax: number;
  homeInsurance: number;
  hoaFees: number;
  // With PMI scenario
  pmiInterestRate: number;
  pmiLoanTerm: number;
  pmiDiscountPoints: number;
  pmiClosingCosts: number;
  // 80% First Mortgage
  firstMortInterestRate: number;
  firstMortLoanTerm: number;
  firstMortDiscountPoints: number;
  firstMortClosingCosts: number;
  // Second Mortgage
  secondMortInterestRate: number;
  secondMortLoanTerm: number;
  secondMortDiscountPoints: number;
  secondMortClosingCosts: number;
}

const SecondMortgageCalculator = () => {
  const [inputs, setInputs] = useState<SecondMortgageInputs>({
    homeValue: 400000,
    downPayment: 20000,
    downPaymentPercent: 5,
    annualPMI: 0.5,
    propertyTax: 2700,
    homeInsurance: 2400,
    hoaFees: 0,
    // With PMI
    pmiInterestRate: 6.0,
    pmiLoanTerm: 30,
    pmiDiscountPoints: 1.0,
    pmiClosingCosts: 1200,
    // 80% First
    firstMortInterestRate: 6.0,
    firstMortLoanTerm: 30,
    firstMortDiscountPoints: 2.0,
    firstMortClosingCosts: 700,
    // Second Mortgage
    secondMortInterestRate: 8.0,
    secondMortLoanTerm: 15,
    secondMortDiscountPoints: 1.0,
    secondMortClosingCosts: 1000,
  });

  const updateInput = (field: keyof SecondMortgageInputs, value: number) => {
    setInputs((prev) => {
      const updated = { ...prev, [field]: value };
      
      if (field === "downPayment") {
        updated.downPaymentPercent = (value / prev.homeValue) * 100;
      } else if (field === "downPaymentPercent") {
        updated.downPayment = (value / 100) * prev.homeValue;
      } else if (field === "homeValue") {
        updated.downPayment = (prev.downPaymentPercent / 100) * value;
      }

      return updated;
    });
  };

  const calculations = useMemo(() => {
    const homeValue = inputs.homeValue;
    const downPayment = inputs.downPayment;
    const downPaymentPercent = inputs.downPaymentPercent;

    // Calculate monthly payment helper
    const calcMonthlyPayment = (principal: number, rate: number, years: number) => {
      const monthlyRate = rate / 100 / 12;
      const numPayments = years * 12;
      if (monthlyRate === 0) return principal / numPayments;
      return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
             (Math.pow(1 + monthlyRate, numPayments) - 1);
    };

    // Scenario 1: With PMI (full loan amount)
    const pmiLoanAmount = homeValue - downPayment;
    const pmiMonthlyPI = calcMonthlyPayment(pmiLoanAmount, inputs.pmiInterestRate, inputs.pmiLoanTerm);
    const pmiPointsCost = (inputs.pmiDiscountPoints / 100) * pmiLoanAmount;
    const pmiTotalClosing = pmiPointsCost + inputs.pmiClosingCosts;
    const pmiMonthlyPMI = (pmiLoanAmount * (inputs.annualPMI / 100)) / 12;
    const pmiMonthlyPayment = pmiMonthlyPI + pmiMonthlyPMI;
    const pmiTotalInterest = (pmiMonthlyPI * inputs.pmiLoanTerm * 12) - pmiLoanAmount;
    // Assume PMI drops after 20% equity (simplified: calculate PMI for first X months)
    const monthsUntil20Percent = Math.ceil(((pmiLoanAmount - (homeValue * 0.8)) / (pmiMonthlyPI - (pmiLoanAmount * inputs.pmiInterestRate / 100 / 12))) || 0);
    const totalPMIPaid = Math.max(0, monthsUntil20Percent) * pmiMonthlyPMI;

    // Scenario 2: 80% First + Second Mortgage (Piggyback)
    const firstMortAmount = homeValue * 0.8; // 80% LTV
    const secondMortAmount = homeValue - downPayment - firstMortAmount; // Remaining after 80% + down payment
    
    const firstMortMonthlyPI = calcMonthlyPayment(firstMortAmount, inputs.firstMortInterestRate, inputs.firstMortLoanTerm);
    const firstMortPointsCost = (inputs.firstMortDiscountPoints / 100) * firstMortAmount;
    const firstMortTotalClosing = firstMortPointsCost + inputs.firstMortClosingCosts;
    const firstMortTotalInterest = (firstMortMonthlyPI * inputs.firstMortLoanTerm * 12) - firstMortAmount;

    const secondMortMonthlyPI = secondMortAmount > 0 ? 
      calcMonthlyPayment(secondMortAmount, inputs.secondMortInterestRate, inputs.secondMortLoanTerm) : 0;
    const secondMortPointsCost = (inputs.secondMortDiscountPoints / 100) * secondMortAmount;
    const secondMortTotalClosing = secondMortPointsCost + inputs.secondMortClosingCosts;
    const secondMortTotalInterest = secondMortAmount > 0 ? 
      (secondMortMonthlyPI * inputs.secondMortLoanTerm * 12) - secondMortAmount : 0;

    const piggybackMonthlyPayment = firstMortMonthlyPI + secondMortMonthlyPI;
    const piggybackTotalClosing = firstMortTotalClosing + secondMortTotalClosing;

    // Monthly costs (same for both scenarios)
    const monthlyTax = inputs.propertyTax / 12;
    const monthlyInsurance = inputs.homeInsurance / 12;
    const monthlyHOA = inputs.hoaFees;
    const monthlyOther = monthlyTax + monthlyInsurance + monthlyHOA;

    // Total monthly costs
    const pmiTotalMonthly = pmiMonthlyPayment + monthlyOther;
    const piggybackTotalMonthly = piggybackMonthlyPayment + monthlyOther;

    // Total costs over loan life (using first mortgage term for comparison)
    const termMonths = inputs.pmiLoanTerm * 12;
    const pmiTotalCost = (pmiMonthlyPI * termMonths) + totalPMIPaid + pmiTotalClosing + downPayment;
    const piggybackTotalCost = (firstMortMonthlyPI * inputs.firstMortLoanTerm * 12) + 
                               (secondMortMonthlyPI * inputs.secondMortLoanTerm * 12) + 
                               piggybackTotalClosing + downPayment;

    const savings = pmiTotalCost - piggybackTotalCost;
    const betterOption = savings > 0 ? "piggyback" : "pmi";

    return {
      pmi: {
        loanAmount: pmiLoanAmount,
        monthlyPI: pmiMonthlyPI,
        monthlyPMI: pmiMonthlyPMI,
        monthlyPayment: pmiMonthlyPayment,
        totalMonthly: pmiTotalMonthly,
        pointsCost: pmiPointsCost,
        closingCosts: inputs.pmiClosingCosts,
        totalClosing: pmiTotalClosing,
        upfrontCost: pmiTotalClosing + downPayment,
        totalInterest: pmiTotalInterest,
        totalPMIPaid,
        totalCost: pmiTotalCost,
      },
      firstMort: {
        loanAmount: firstMortAmount,
        monthlyPI: firstMortMonthlyPI,
        pointsCost: firstMortPointsCost,
        closingCosts: inputs.firstMortClosingCosts,
        totalClosing: firstMortTotalClosing,
        totalInterest: firstMortTotalInterest,
      },
      secondMort: {
        loanAmount: secondMortAmount,
        monthlyPI: secondMortMonthlyPI,
        pointsCost: secondMortPointsCost,
        closingCosts: inputs.secondMortClosingCosts,
        totalClosing: secondMortTotalClosing,
        totalInterest: secondMortTotalInterest,
      },
      piggyback: {
        monthlyPayment: piggybackMonthlyPayment,
        totalMonthly: piggybackTotalMonthly,
        totalClosing: piggybackTotalClosing,
        upfrontCost: piggybackTotalClosing + downPayment,
        totalCost: piggybackTotalCost,
      },
      monthlyOther,
      monthlyTax,
      monthlyInsurance,
      monthlyHOA,
      savings: Math.abs(savings),
      betterOption,
      downPayment,
    };
  }, [inputs]);

  return (
    <div className="fade-in">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="first-mort">First Mort</TabsTrigger>
          <TabsTrigger value="second-mort">Second Mort</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <section className="calculator-card p-4 sm:p-6" aria-labelledby="home-details-heading">
              <h2 id="home-details-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                Home Price & Down Payment
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[120px]">
                    Home Value
                  </Label>
                  <CurrencyInput
                    value={inputs.homeValue}
                    onChange={(value) => updateInput("homeValue", value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[120px] flex items-center gap-1">
                    Down Payment
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Values below 20 will be treated as a percent
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex gap-2 flex-1">
                    <CurrencyInput
                      value={inputs.downPayment}
                      onChange={(value) => updateInput("downPayment", value)}
                    />
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={inputs.downPaymentPercent.toFixed(1)}
                      onChange={(e) => updateInput("downPaymentPercent", parseFloat(e.target.value) || 0)}
                      className="h-8 sm:h-10 w-16 text-center text-xs sm:text-sm"
                    />
                    <span className="flex items-center text-muted-foreground text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[120px]">
                    Annual PMI Rate
                  </Label>
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={inputs.annualPMI}
                      onChange={(e) => updateInput("annualPMI", parseFloat(e.target.value) || 0)}
                      className="h-8 sm:h-10 text-sm"
                    />
                    <span className="flex items-center text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>

              <h2 className="text-base sm:text-xl font-display font-semibold mt-6 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                Other Ownership Costs
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[120px]">
                    Annual Property Tax
                  </Label>
                  <CurrencyInput
                    value={inputs.propertyTax}
                    onChange={(value) => updateInput("propertyTax", value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[120px]">
                    Annual Insurance
                  </Label>
                  <CurrencyInput
                    value={inputs.homeInsurance}
                    onChange={(value) => updateInput("homeInsurance", value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[120px]">
                    Monthly HOA
                  </Label>
                  <CurrencyInput
                    value={inputs.hoaFees}
                    onChange={(value) => updateInput("hoaFees", value)}
                  />
                </div>
              </div>
            </section>

            {/* Loan Scenarios */}
            <section className="calculator-card p-4 sm:p-6" aria-labelledby="scenarios-heading">
              <h2 id="scenarios-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                Loan Scenarios
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Scenario</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">With PMI</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">80% Loan</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">2nd Loan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2">Interest Rate</td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={inputs.pmiInterestRate}
                            onChange={(e) => updateInput("pmiInterestRate", parseFloat(e.target.value) || 0)}
                            className="h-7 w-14 text-center text-xs"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={inputs.firstMortInterestRate}
                            onChange={(e) => updateInput("firstMortInterestRate", parseFloat(e.target.value) || 0)}
                            className="h-7 w-14 text-center text-xs"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={inputs.secondMortInterestRate}
                            onChange={(e) => updateInput("secondMortInterestRate", parseFloat(e.target.value) || 0)}
                            className="h-7 w-14 text-center text-xs"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">Loan Term</td>
                      <td className="py-2 text-center">
                        <Select
                          value={inputs.pmiLoanTerm.toString()}
                          onValueChange={(v) => updateInput("pmiLoanTerm", parseInt(v))}
                        >
                          <SelectTrigger className="h-7 w-20 text-xs mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 yrs</SelectItem>
                            <SelectItem value="15">15 yrs</SelectItem>
                            <SelectItem value="20">20 yrs</SelectItem>
                            <SelectItem value="30">30 yrs</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 text-center">
                        <Select
                          value={inputs.firstMortLoanTerm.toString()}
                          onValueChange={(v) => updateInput("firstMortLoanTerm", parseInt(v))}
                        >
                          <SelectTrigger className="h-7 w-20 text-xs mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 yrs</SelectItem>
                            <SelectItem value="15">15 yrs</SelectItem>
                            <SelectItem value="20">20 yrs</SelectItem>
                            <SelectItem value="30">30 yrs</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 text-center">
                        <Select
                          value={inputs.secondMortLoanTerm.toString()}
                          onValueChange={(v) => updateInput("secondMortLoanTerm", parseInt(v))}
                        >
                          <SelectTrigger className="h-7 w-20 text-xs mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 yrs</SelectItem>
                            <SelectItem value="10">10 yrs</SelectItem>
                            <SelectItem value="15">15 yrs</SelectItem>
                            <SelectItem value="20">20 yrs</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">Discount Points</td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={inputs.pmiDiscountPoints}
                            onChange={(e) => updateInput("pmiDiscountPoints", parseFloat(e.target.value) || 0)}
                            className="h-7 w-14 text-center text-xs"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={inputs.firstMortDiscountPoints}
                            onChange={(e) => updateInput("firstMortDiscountPoints", parseFloat(e.target.value) || 0)}
                            className="h-7 w-14 text-center text-xs"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={inputs.secondMortDiscountPoints}
                            onChange={(e) => updateInput("secondMortDiscountPoints", parseFloat(e.target.value) || 0)}
                            className="h-7 w-14 text-center text-xs"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">Other Closing</td>
                      <td className="py-2 text-center">
                        <CurrencyInput
                          value={inputs.pmiClosingCosts}
                          onChange={(value) => updateInput("pmiClosingCosts", value)}
                          className="h-7 w-20 text-center text-xs mx-auto"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <CurrencyInput
                          value={inputs.firstMortClosingCosts}
                          onChange={(value) => updateInput("firstMortClosingCosts", value)}
                          className="h-7 w-20 text-center text-xs mx-auto"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <CurrencyInput
                          value={inputs.secondMortClosingCosts}
                          onChange={(value) => updateInput("secondMortClosingCosts", value)}
                          className="h-7 w-20 text-center text-xs mx-auto"
                        />
                      </td>
                    </tr>
                    <tr className="bg-muted/50">
                      <td className="py-2 font-medium">Loan Amount</td>
                      <td className="py-2 text-center font-medium">{formatCurrency(calculations.pmi.loanAmount)}</td>
                      <td className="py-2 text-center font-medium">{formatCurrency(calculations.firstMort.loanAmount)}</td>
                      <td className="py-2 text-center font-medium">{formatCurrency(calculations.secondMort.loanAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Results Comparison */}
          <section className="calculator-card p-4 sm:p-6" aria-labelledby="results-heading">
            <h2 id="results-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
              Financial Analysis
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-primary text-primary-foreground">
                    <th className="text-left py-3 px-4 font-medium">Comparison</th>
                    <th className="text-right py-3 px-4 font-medium">With PMI</th>
                    <th className="text-right py-3 px-4 font-medium">80% + 2nd Mort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Amount Financed</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.loanAmount)}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(calculations.firstMort.loanAmount + calculations.secondMort.loanAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Down Payment</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.downPayment)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.downPayment)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Cost of Discount Points</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.pointsCost)}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(calculations.firstMort.pointsCost + calculations.secondMort.pointsCost)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Other Closing Costs</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.closingCosts)}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(inputs.firstMortClosingCosts + inputs.secondMortClosingCosts)}
                    </td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Total Closing Costs</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.totalClosing)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.piggyback.totalClosing)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Total Upfront w/ Down Payment</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.upfrontCost)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.piggyback.upfrontCost)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Monthly Principal & Interest</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.monthlyPI)}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(calculations.firstMort.monthlyPI)} + {formatCurrency(calculations.secondMort.monthlyPI)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Monthly PMI</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.monthlyPMI)}</td>
                    <td className="py-3 px-4 text-right font-medium text-accent">$0.00</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Monthly Loan Payment</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.monthlyPayment)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.piggyback.monthlyPayment)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Monthly Property Taxes</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.monthlyTax)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.monthlyTax)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Monthly Insurance</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.monthlyInsurance)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.monthlyInsurance)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Monthly HOA</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.monthlyHOA)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.monthlyHOA)}</td>
                  </tr>
                  <tr className="bg-primary/10 font-semibold">
                    <td className="py-3 px-4">Total Monthly Cost</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(calculations.pmi.totalMonthly)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(calculations.piggyback.totalMonthly)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Total Interest Paid</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.pmi.totalInterest)}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(calculations.firstMort.totalInterest + calculations.secondMort.totalInterest)}
                    </td>
                  </tr>
                  <tr className="bg-primary/10 font-semibold">
                    <td className="py-3 px-4">Total Financed Cost</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(calculations.pmi.totalCost)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(calculations.piggyback.totalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className={`mt-6 p-4 rounded-lg ${calculations.betterOption === 'piggyback' ? 'bg-accent/10 border border-accent' : 'bg-primary/10 border border-primary'}`}>
              <p className="text-sm sm:text-base">
                {calculations.betterOption === 'piggyback' ? (
                  <>
                    <strong className="text-accent">The second mortgage option saves you {formatCurrency(calculations.savings)}!</strong>
                    <span className="text-muted-foreground"> Your upfront costs are higher, but your monthly payments are lower and you avoid PMI entirely.</span>
                  </>
                ) : (
                  <>
                    <strong className="text-primary">The PMI option saves you {formatCurrency(calculations.savings)}!</strong>
                    <span className="text-muted-foreground"> In this scenario, paying PMI is more cost-effective than taking out a second mortgage.</span>
                  </>
                )}
              </p>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="first-mort">
          <section className="calculator-card p-4 sm:p-6">
            <h2 className="text-xl font-display font-semibold mb-4">First Mortgage Details (80% LTV)</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.firstMort.loanAmount)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly P&I</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.firstMort.monthlyPI)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.firstMort.totalInterest)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Closing Costs</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.firstMort.totalClosing)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                The first mortgage covers 80% of the home value at {inputs.firstMortInterestRate}% interest over {inputs.firstMortLoanTerm} years. 
                By keeping this loan at 80% LTV, you avoid PMI requirements.
              </p>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="second-mort">
          <section className="calculator-card p-4 sm:p-6">
            <h2 className="text-xl font-display font-semibold mb-4">Second Mortgage Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.secondMort.loanAmount)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly P&I</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.secondMort.monthlyPI)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.secondMort.totalInterest)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Closing Costs</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.secondMort.totalClosing)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                The second mortgage covers the gap between your down payment and the 80% first mortgage. 
                At {inputs.secondMortInterestRate}% interest over {inputs.secondMortLoanTerm} years, this "piggyback" loan helps you avoid PMI.
              </p>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecondMortgageCalculator;
