import { useState, useMemo } from "react";
import { Home, Percent, DollarSign, Calculator, Calendar, TrendingDown, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency } from "@/lib/formatters";

interface RefinanceInputs {
  // Original loan
  originalHomePrice: number;
  originalDownPayment: number;
  originalLoanTerm: number;
  originalInterestRate: number;
  monthsAlreadyPaid: number;
  // New loan
  newLoanTerm: number;
  newInterestRate: number;
  yearsBeforeSell: number;
  // Fees
  discountPoints: number;
  originationFees: number;
  otherClosingCosts: number;
  // Tax rates
  federalTaxRate: number;
  stateTaxRate: number;
}

const RefinanceCalculator = () => {
  const [inputs, setInputs] = useState<RefinanceInputs>({
    originalHomePrice: 400000,
    originalDownPayment: 80000,
    originalLoanTerm: 30,
    originalInterestRate: 6.5,
    monthsAlreadyPaid: 60,
    newLoanTerm: 15,
    newInterestRate: 5.75,
    yearsBeforeSell: 7,
    discountPoints: 1.0,
    originationFees: 0.5,
    otherClosingCosts: 1200,
    federalTaxRate: 25,
    stateTaxRate: 5,
  });

  const updateInput = (field: keyof RefinanceInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const calculations = useMemo(() => {
    // Original loan calculations
    const originalLoanAmount = inputs.originalHomePrice - inputs.originalDownPayment;
    const originalMonthlyRate = inputs.originalInterestRate / 100 / 12;
    const originalTotalPayments = inputs.originalLoanTerm * 12;

    const originalMonthlyPayment =
      originalMonthlyRate > 0
        ? (originalLoanAmount * originalMonthlyRate * Math.pow(1 + originalMonthlyRate, originalTotalPayments)) /
          (Math.pow(1 + originalMonthlyRate, originalTotalPayments) - 1)
        : originalLoanAmount / originalTotalPayments;

    // Calculate remaining balance after months paid
    let remainingBalance = originalLoanAmount;
    let totalInterestPaidSoFar = 0;
    for (let i = 0; i < inputs.monthsAlreadyPaid; i++) {
      const interestPayment = remainingBalance * originalMonthlyRate;
      const principalPayment = originalMonthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      totalInterestPaidSoFar += interestPayment;
    }
    remainingBalance = Math.max(0, remainingBalance);

    // Remaining months on original loan
    const remainingMonthsOriginal = originalTotalPayments - inputs.monthsAlreadyPaid;

    // Calculate original loan balance at "years before sell" point
    const monthsUntilSell = inputs.yearsBeforeSell * 12;
    let originalBalanceAtSell = remainingBalance;
    let originalInterestOverPeriod = 0;
    let originalPaymentsOverPeriod = 0;

    for (let i = 0; i < monthsUntilSell && i < remainingMonthsOriginal; i++) {
      const interestPayment = originalBalanceAtSell * originalMonthlyRate;
      const principalPayment = Math.min(originalMonthlyPayment - interestPayment, originalBalanceAtSell);
      originalBalanceAtSell = Math.max(0, originalBalanceAtSell - principalPayment);
      originalInterestOverPeriod += interestPayment;
      originalPaymentsOverPeriod += originalMonthlyPayment;
    }

    // New loan calculations (refinance)
    const newLoanAmount = remainingBalance;
    const newMonthlyRate = inputs.newInterestRate / 100 / 12;
    const newTotalPayments = inputs.newLoanTerm * 12;

    const newMonthlyPayment =
      newMonthlyRate > 0
        ? (newLoanAmount * newMonthlyRate * Math.pow(1 + newMonthlyRate, newTotalPayments)) /
          (Math.pow(1 + newMonthlyRate, newTotalPayments) - 1)
        : newLoanAmount / newTotalPayments;

    // Closing costs
    const discountPointsCost = (inputs.discountPoints / 100) * newLoanAmount;
    const originationFeesCost = (inputs.originationFees / 100) * newLoanAmount;
    const totalClosingCosts = discountPointsCost + originationFeesCost + inputs.otherClosingCosts;

    // Calculate new loan balance at "years before sell" point
    let newBalanceAtSell = newLoanAmount;
    let newInterestOverPeriod = 0;
    let newPaymentsOverPeriod = 0;

    for (let i = 0; i < monthsUntilSell && i < newTotalPayments; i++) {
      const interestPayment = newBalanceAtSell * newMonthlyRate;
      const principalPayment = Math.min(newMonthlyPayment - interestPayment, newBalanceAtSell);
      newBalanceAtSell = Math.max(0, newBalanceAtSell - principalPayment);
      newInterestOverPeriod += interestPayment;
      newPaymentsOverPeriod += newMonthlyPayment;
    }

    // Tax calculations
    const combinedTaxRate = (inputs.federalTaxRate + inputs.stateTaxRate) / 100;
    const originalTaxSavings = originalInterestOverPeriod * combinedTaxRate;
    const newTaxSavings = newInterestOverPeriod * combinedTaxRate;
    const taxSavingsLoss = originalTaxSavings - newTaxSavings;

    // Monthly payment difference
    const monthlyPaymentDiff = newMonthlyPayment - originalMonthlyPayment;
    const additionalMonthlyPayments = monthlyPaymentDiff * monthsUntilSell;

    // Balance difference (equity gained)
    const balanceDifference = originalBalanceAtSell - newBalanceAtSell;

    // Interest savings
    const interestSavings = originalInterestOverPeriod - newInterestOverPeriod;

    // Total refinancing benefit
    const totalBenefit = balanceDifference - taxSavingsLoss - totalClosingCosts;

    // Break-even calculation (months until closing costs are recovered)
    const monthlySavings = originalMonthlyPayment - newMonthlyPayment;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(totalClosingCosts / monthlySavings) : 
                            (totalBenefit > 0 ? Math.ceil(totalClosingCosts / (totalBenefit / monthsUntilSell)) : Infinity);

    return {
      original: {
        loanAmount: originalLoanAmount,
        monthlyPayment: originalMonthlyPayment,
        remainingBalance,
        balanceAtSell: originalBalanceAtSell,
        interestOverPeriod: originalInterestOverPeriod,
        paymentsOverPeriod: originalPaymentsOverPeriod,
        taxSavings: originalTaxSavings,
      },
      refinanced: {
        loanAmount: newLoanAmount,
        monthlyPayment: newMonthlyPayment,
        balanceAtSell: newBalanceAtSell,
        interestOverPeriod: newInterestOverPeriod,
        paymentsOverPeriod: newPaymentsOverPeriod,
        taxSavings: newTaxSavings,
        discountPointsCost,
        originationFeesCost,
        totalClosingCosts,
      },
      comparison: {
        monthlyPaymentDiff,
        additionalMonthlyPayments,
        balanceDifference,
        interestSavings,
        taxSavingsLoss,
        totalBenefit,
        breakEvenMonths,
        shouldRefinance: totalBenefit > 0,
      },
    };
  }, [inputs]);

  return (
    <div className="fade-in">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          {/* Results Summary Card */}
          <section className="calculator-card p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
              Should You Refinance? Here Are Your Results
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Your Savings</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3">Loan Balance Difference in {inputs.yearsBeforeSell} Years, Less Income Tax Shift</td>
                    <td className="py-3 text-right font-bold">
                      {formatCurrency(calculations.comparison.balanceDifference - calculations.comparison.taxSavingsLoss)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3">Less Additional Monthly Payments</td>
                    <td className="py-3 text-right font-bold">
                      {calculations.comparison.additionalMonthlyPayments > 0 ? "-" : ""}
                      {formatCurrency(Math.abs(calculations.comparison.additionalMonthlyPayments))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3">Less Total Closing Costs</td>
                    <td className="py-3 text-right font-bold">
                      -{formatCurrency(calculations.refinanced.totalClosingCosts)}
                    </td>
                  </tr>
                  <tr className={`${calculations.comparison.shouldRefinance ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                    <td className="py-4 font-semibold">
                      Total Refinancing {calculations.comparison.shouldRefinance ? 'Benefit' : 'Cost'} Over Next {inputs.yearsBeforeSell} Years
                    </td>
                    <td className={`py-4 text-right text-xl font-bold ${calculations.comparison.shouldRefinance ? 'text-accent' : 'text-destructive'}`}>
                      {calculations.comparison.shouldRefinance ? '' : '-'}{formatCurrency(Math.abs(calculations.comparison.totalBenefit))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Original Loan Details */}
            <section className="calculator-card p-4 sm:p-6" aria-labelledby="original-loan-heading">
              <h2 id="original-loan-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                Original Loan Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Original Home Price
                  </Label>
                  <CurrencyInput
                    value={inputs.originalHomePrice}
                    onChange={(value) => updateInput("originalHomePrice", value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Original Down Payment
                  </Label>
                  <CurrencyInput
                    value={inputs.originalDownPayment}
                    onChange={(value) => updateInput("originalDownPayment", value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Original Loan Amount
                  </Label>
                  <div className="flex-1 h-8 sm:h-10 flex items-center px-3 bg-muted rounded-md text-sm font-medium">
                    {formatCurrency(inputs.originalHomePrice - inputs.originalDownPayment)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Loan Term
                  </Label>
                  <Select
                    value={inputs.originalLoanTerm.toString()}
                    onValueChange={(v) => updateInput("originalLoanTerm", parseInt(v))}
                  >
                    <SelectTrigger className="h-8 sm:h-10 text-sm flex-1">
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

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Interest Rate
                  </Label>
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={inputs.originalInterestRate}
                      onChange={(e) => updateInput("originalInterestRate", parseFloat(e.target.value) || 0)}
                      className="h-8 sm:h-10 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Months Already Paid
                  </Label>
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={inputs.monthsAlreadyPaid}
                      onChange={(e) => updateInput("monthsAlreadyPaid", parseInt(e.target.value) || 0)}
                      className="h-8 sm:h-10 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">months</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Remaining Balance</span>
                    <span className="font-semibold">{formatCurrency(calculations.original.remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Current Monthly Payment</span>
                    <span className="font-semibold">{formatCurrency(calculations.original.monthlyPayment)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Refinanced Loan Details */}
            <section className="calculator-card p-4 sm:p-6" aria-labelledby="refinance-heading">
              <h2 id="refinance-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                Refinanced Loan Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    New Loan Term
                  </Label>
                  <Select
                    value={inputs.newLoanTerm.toString()}
                    onValueChange={(v) => updateInput("newLoanTerm", parseInt(v))}
                  >
                    <SelectTrigger className="h-8 sm:h-10 text-sm flex-1">
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

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    New Interest Rate
                  </Label>
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={inputs.newInterestRate}
                      onChange={(e) => updateInput("newInterestRate", parseFloat(e.target.value) || 0)}
                      className="h-8 sm:h-10 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Years Before Sell
                  </Label>
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={inputs.yearsBeforeSell}
                      onChange={(e) => updateInput("yearsBeforeSell", parseInt(e.target.value) || 0)}
                      className="h-8 sm:h-10 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">years</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <h3 className="text-sm font-medium mb-2">Fees and Points</h3>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                      Discount Points
                    </Label>
                    <div className="flex gap-2 flex-1 items-center">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={inputs.discountPoints}
                        onChange={(e) => updateInput("discountPoints", parseFloat(e.target.value) || 0)}
                        className="h-8 sm:h-10 text-sm"
                      />
                      <span className="text-muted-foreground text-sm">%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                      Origination Fees
                    </Label>
                    <div className="flex gap-2 flex-1 items-center">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={inputs.originationFees}
                        onChange={(e) => updateInput("originationFees", parseFloat(e.target.value) || 0)}
                        className="h-8 sm:h-10 text-sm"
                      />
                      <span className="text-muted-foreground text-sm">%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                      Other Closing Costs
                    </Label>
                    <CurrencyInput
                      value={inputs.otherClosingCosts}
                      onChange={(value) => updateInput("otherClosingCosts", value)}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">New Monthly Payment</span>
                    <span className="font-semibold">{formatCurrency(calculations.refinanced.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Total Closing Costs</span>
                    <span className="font-semibold">{formatCurrency(calculations.refinanced.totalClosingCosts)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Tax Rates */}
          <section className="calculator-card p-4 sm:p-6" aria-labelledby="tax-heading">
            <h2 id="tax-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
              Federal & State Income Taxes
            </h2>

            <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-600">Are You Itemizing Deductions?</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                With the higher standard deductions from the 2017 TCJA, few filers itemize. If you don't plan on 
                itemizing, set both tax rates to 0% to remove their impact on your calculation.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                  Federal Tax Rate
                </Label>
                <div className="flex gap-2 flex-1 items-center">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={inputs.federalTaxRate}
                    onChange={(e) => updateInput("federalTaxRate", parseFloat(e.target.value) || 0)}
                    className="h-8 sm:h-10 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                  State Tax Rate
                </Label>
                <div className="flex gap-2 flex-1 items-center">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={inputs.stateTaxRate}
                    onChange={(e) => updateInput("stateTaxRate", parseFloat(e.target.value) || 0)}
                    className="h-8 sm:h-10 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          {/* Detailed Breakdown Tables */}
          <section className="calculator-card p-4 sm:p-6">
            <h2 className="text-xl font-display font-semibold mb-4">Detailed Calculation Breakdowns</h2>

            <div className="space-y-6">
              {/* Balance & Closing */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-primary text-primary-foreground">
                      <th className="text-left py-3 px-4 font-medium">Balance & Closing</th>
                      <th className="text-right py-3 px-4 font-medium">Before Refinancing</th>
                      <th className="text-right py-3 px-4 font-medium">After Refinancing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">Balance at Refinance</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.original.remainingBalance)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.loanAmount)}</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-3 px-4 text-muted-foreground">Cost of Discount Points</td>
                      <td className="py-3 px-4 text-right font-medium">—</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.discountPointsCost)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">Origination Fees</td>
                      <td className="py-3 px-4 text-right font-medium">—</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.originationFeesCost)}</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-3 px-4 text-muted-foreground">Other Closing Costs</td>
                      <td className="py-3 px-4 text-right font-medium">—</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(inputs.otherClosingCosts)}</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="py-3 px-4">Total Closing Costs</td>
                      <td className="py-3 px-4 text-right">—</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(calculations.refinanced.totalClosingCosts)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Monthly Payments */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-primary text-primary-foreground">
                      <th className="text-left py-3 px-4 font-medium">Monthly Payments</th>
                      <th className="text-right py-3 px-4 font-medium">Before Refinancing</th>
                      <th className="text-right py-3 px-4 font-medium">After Refinancing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">Monthly Payment</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.original.monthlyPayment)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.monthlyPayment)}</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-3 px-4 text-muted-foreground">Payment Difference Per Month</td>
                      <td className="py-3 px-4 text-right font-medium">—</td>
                      <td className={`py-3 px-4 text-right font-medium ${calculations.comparison.monthlyPaymentDiff < 0 ? 'text-accent' : 'text-destructive'}`}>
                        {calculations.comparison.monthlyPaymentDiff >= 0 ? '+' : ''}{formatCurrency(calculations.comparison.monthlyPaymentDiff)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Period Totals */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-primary text-primary-foreground">
                      <th className="text-left py-3 px-4 font-medium">{inputs.yearsBeforeSell} Year Totals</th>
                      <th className="text-right py-3 px-4 font-medium">Before Refinancing</th>
                      <th className="text-right py-3 px-4 font-medium">After Refinancing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">Total Monthly Payments</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.original.paymentsOverPeriod)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.paymentsOverPeriod)}</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-3 px-4 text-muted-foreground">Total Interest Paid</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.original.interestOverPeriod)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.interestOverPeriod)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">Interest Savings</td>
                      <td className="py-3 px-4 text-right font-medium">—</td>
                      <td className="py-3 px-4 text-right font-medium text-accent">{formatCurrency(calculations.comparison.interestSavings)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax Info */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-primary text-primary-foreground">
                      <th className="text-left py-3 px-4 font-medium">Income Tax Info</th>
                      <th className="text-right py-3 px-4 font-medium">Before Refinancing</th>
                      <th className="text-right py-3 px-4 font-medium">After Refinancing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">Tax Savings (Interest Deduction)</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.original.taxSavings)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.taxSavings)}</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="py-3 px-4 text-muted-foreground">Tax Savings Lost</td>
                      <td className="py-3 px-4 text-right font-medium">—</td>
                      <td className="py-3 px-4 text-right font-medium text-destructive">{formatCurrency(calculations.comparison.taxSavingsLoss)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Final Balance */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-primary text-primary-foreground">
                      <th className="text-left py-3 px-4 font-medium">Final Loan Balance</th>
                      <th className="text-right py-3 px-4 font-medium">Before Refinancing</th>
                      <th className="text-right py-3 px-4 font-medium">After Refinancing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">Loan Balance at Sale in {inputs.yearsBeforeSell} Years</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.original.balanceAtSell)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.refinanced.balanceAtSell)}</td>
                    </tr>
                    <tr className="bg-accent/10">
                      <td className="py-3 px-4 font-semibold">Remaining Balance Difference (Equity Gained)</td>
                      <td className="py-3 px-4 text-right font-medium">—</td>
                      <td className="py-3 px-4 text-right font-bold text-accent">{formatCurrency(calculations.comparison.balanceDifference)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefinanceCalculator;
