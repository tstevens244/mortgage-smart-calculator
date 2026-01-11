import { useState, useMemo } from "react";
import { Home, Percent, DollarSign, Calculator, CreditCard, Car, Wallet, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency } from "@/lib/formatters";

interface Debt {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
  interestRate: number;
}

interface HelocInputs {
  helocTerm: number;
  helocClosingCosts: number;
  helocInterestRate: number;
  federalTaxRate: number;
}

const defaultDebts: Debt[] = [
  { id: "1", name: "Auto Loan", balance: 8000, monthlyPayment: 350, interestRate: 7.5 },
  { id: "2", name: "Credit Card 1", balance: 5000, monthlyPayment: 200, interestRate: 18.99 },
  { id: "3", name: "Credit Card 2", balance: 3000, monthlyPayment: 150, interestRate: 22.99 },
  { id: "4", name: "Personal Loan", balance: 3000, monthlyPayment: 407, interestRate: 12.0 },
];

const HelocCalculator = () => {
  const [debts, setDebts] = useState<Debt[]>(defaultDebts);
  const [inputs, setInputs] = useState<HelocInputs>({
    helocTerm: 15,
    helocClosingCosts: 1200,
    helocInterestRate: 6.0,
    federalTaxRate: 25,
  });

  const updateInput = (field: keyof HelocInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts((prev) =>
      prev.map((debt) => (debt.id === id ? { ...debt, [field]: value } : debt))
    );
  };

  const addDebt = () => {
    const newId = (Math.max(...debts.map((d) => parseInt(d.id)), 0) + 1).toString();
    setDebts((prev) => [
      ...prev,
      { id: newId, name: "Other Debt", balance: 0, monthlyPayment: 0, interestRate: 0 },
    ]);
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts((prev) => prev.filter((debt) => debt.id !== id));
    }
  };

  const calculations = useMemo(() => {
    // Total existing debts
    const totalDebtBalance = debts.reduce((sum, d) => sum + d.balance, 0);
    const totalMonthlyPayment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);

    // Calculate weighted average interest rate
    const weightedInterest = debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0);
    const avgInterestRate = totalDebtBalance > 0 ? weightedInterest / totalDebtBalance : 0;

    // Calculate payoff timeline for existing debts (simplified - assumes all debts paid simultaneously)
    let existingTotalInterest = 0;
    let maxMonthsToPayoff = 0;

    debts.forEach((debt) => {
      if (debt.balance > 0 && debt.monthlyPayment > 0) {
        const monthlyRate = debt.interestRate / 100 / 12;
        if (monthlyRate > 0) {
          // Calculate months to payoff
          const monthsToPayoff = Math.ceil(
            -Math.log(1 - (debt.balance * monthlyRate) / debt.monthlyPayment) / Math.log(1 + monthlyRate)
          );
          maxMonthsToPayoff = Math.max(maxMonthsToPayoff, isFinite(monthsToPayoff) ? monthsToPayoff : 360);
          
          // Total interest paid
          const totalPaid = debt.monthlyPayment * monthsToPayoff;
          existingTotalInterest += totalPaid - debt.balance;
        } else {
          const monthsToPayoff = Math.ceil(debt.balance / debt.monthlyPayment);
          maxMonthsToPayoff = Math.max(maxMonthsToPayoff, monthsToPayoff);
        }
      }
    });

    const existingYears = Math.floor(maxMonthsToPayoff / 12);
    const existingMonths = maxMonthsToPayoff % 12;
    const existingTotalPayments = totalMonthlyPayment * maxMonthsToPayoff;

    // HELOC calculations
    const helocLoanAmount = totalDebtBalance;
    const helocMonthlyRate = inputs.helocInterestRate / 100 / 12;
    const helocNumPayments = inputs.helocTerm * 12;

    const helocMonthlyPayment =
      helocMonthlyRate > 0
        ? (helocLoanAmount * helocMonthlyRate * Math.pow(1 + helocMonthlyRate, helocNumPayments)) /
          (Math.pow(1 + helocMonthlyRate, helocNumPayments) - 1)
        : helocLoanAmount / helocNumPayments;

    const helocTotalPayments = helocMonthlyPayment * helocNumPayments;
    const helocTotalInterest = helocTotalPayments - helocLoanAmount;

    // Tax deduction (only if using for home improvement - we'll calculate potential savings)
    const helocDeductibleInterest = helocTotalInterest;
    const annualTaxSavings = (helocDeductibleInterest / inputs.helocTerm) * (inputs.federalTaxRate / 100);
    const totalTaxSavings = annualTaxSavings * inputs.helocTerm;

    // Comparison
    const existingCostAfterTax = existingTotalPayments; // No tax deduction on consumer debt
    const helocCostAfterTax = helocTotalPayments + inputs.helocClosingCosts - totalTaxSavings;

    const savings = existingCostAfterTax - helocCostAfterTax;
    const monthlySavings = totalMonthlyPayment - helocMonthlyPayment;
    const betterOption = savings > 0 ? "heloc" : "existing";

    return {
      existing: {
        totalBalance: totalDebtBalance,
        monthlyPayment: totalMonthlyPayment,
        avgInterestRate,
        yearsToPayoff: existingYears,
        monthsToPayoff: existingMonths,
        totalPayments: existingTotalPayments,
        totalInterest: existingTotalInterest,
        deductibleInterest: 0,
      },
      heloc: {
        loanAmount: helocLoanAmount,
        monthlyPayment: helocMonthlyPayment,
        interestRate: inputs.helocInterestRate,
        yearsToPayoff: inputs.helocTerm,
        monthsToPayoff: 0,
        totalPayments: helocTotalPayments,
        totalInterest: helocTotalInterest,
        deductibleInterest: helocDeductibleInterest,
        annualTaxSavings,
        totalTaxSavings,
        closingCosts: inputs.helocClosingCosts,
      },
      monthlySavings,
      totalSavings: savings,
      betterOption,
    };
  }, [debts, inputs]);

  return (
    <div className="fade-in">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="details">HELOC Details</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* HELOC Loan Details */}
            <section className="calculator-card p-4 sm:p-6" aria-labelledby="heloc-details-heading">
              <h2 id="heloc-details-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                Home Equity Loan Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Loan Term
                  </Label>
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={inputs.helocTerm}
                      onChange={(e) => updateInput("helocTerm", parseInt(e.target.value) || 0)}
                      className="h-8 sm:h-10 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">Years</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Closing Costs
                  </Label>
                  <CurrencyInput
                    value={inputs.helocClosingCosts}
                    onChange={(value) => updateInput("helocClosingCosts", value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs sm:text-sm text-muted-foreground min-w-[130px]">
                    Interest Rate
                  </Label>
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={inputs.helocInterestRate}
                      onChange={(e) => updateInput("helocInterestRate", parseFloat(e.target.value) || 0)}
                      className="h-8 sm:h-10 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>

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
              </div>

              <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-600">Tax Deduction Notice</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  HELOC interest is only tax deductible if used for home improvements. 
                  Set tax rate to 0% if not using for home improvements or not itemizing deductions.
                </AlertDescription>
              </Alert>
            </section>

            {/* Existing Debts */}
            <section className="calculator-card p-4 sm:p-6" aria-labelledby="debts-heading">
              <h2 id="debts-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                Current Debts
              </h2>

              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium">
                  <div className="col-span-3">Debt</div>
                  <div className="col-span-3">Balance</div>
                  <div className="col-span-3">Payment</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Debt Rows */}
                {debts.map((debt) => (
                  <div key={debt.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <CurrencyInput
                        value={debt.balance}
                        onChange={(value) => updateDebt(debt.id, "balance", value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <CurrencyInput
                        value={debt.monthlyPayment}
                        onChange={(value) => updateDebt(debt.id, "monthlyPayment", value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={debt.interestRate}
                          onChange={(e) => updateDebt(debt.id, "interestRate", parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs w-full"
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeDebt(debt.id)}
                        disabled={debts.length <= 1}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Totals Row */}
                <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t border-border font-medium">
                  <div className="col-span-3 text-sm">Totals</div>
                  <div className="col-span-3 text-sm">{formatCurrency(calculations.existing.totalBalance)}</div>
                  <div className="col-span-3 text-sm">{formatCurrency(calculations.existing.monthlyPayment)}</div>
                  <div className="col-span-2 text-sm">{calculations.existing.avgInterestRate.toFixed(2)}%</div>
                  <div className="col-span-1"></div>
                </div>

                <Button variant="outline" size="sm" onClick={addDebt} className="w-full mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Debt
                </Button>
              </div>
            </section>
          </div>

          {/* Results Comparison */}
          <section className="calculator-card p-4 sm:p-6" aria-labelledby="results-heading">
            <h2 id="results-heading" className="text-base sm:text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
              Financial Analysis
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-primary text-primary-foreground">
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Keep Existing Debts</th>
                    <th className="text-right py-3 px-4 font-medium">HELOC Consolidation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Total Debt Amount</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.existing.totalBalance)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.heloc.loanAmount)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Monthly Payment</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.existing.monthlyPayment)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.heloc.monthlyPayment)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Average Interest Rate</td>
                    <td className="py-3 px-4 text-right font-medium">{calculations.existing.avgInterestRate.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right font-medium">{calculations.heloc.interestRate.toFixed(2)}%</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Payoff Timeline</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {calculations.existing.yearsToPayoff} Yrs {calculations.existing.monthsToPayoff} Mts
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {calculations.heloc.yearsToPayoff} Yrs {calculations.heloc.monthsToPayoff} Mts
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Total Monthly Payments</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.existing.totalPayments)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.heloc.totalPayments)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Total Interest Paid</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.existing.totalInterest)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(calculations.heloc.totalInterest)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-muted-foreground">Tax Deductible Interest</td>
                    <td className="py-3 px-4 text-right font-medium text-muted-foreground">$0.00</td>
                    <td className="py-3 px-4 text-right font-medium text-accent">{formatCurrency(calculations.heloc.deductibleInterest)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="py-3 px-4 text-muted-foreground">Avg Annual Tax Savings</td>
                    <td className="py-3 px-4 text-right font-medium text-muted-foreground">$0.00</td>
                    <td className="py-3 px-4 text-right font-medium text-accent">{formatCurrency(calculations.heloc.annualTaxSavings)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className={`mt-6 p-4 rounded-lg ${calculations.betterOption === 'heloc' ? 'bg-accent/10 border border-accent' : 'bg-amber-500/10 border border-amber-500'}`}>
              {calculations.betterOption === 'heloc' ? (
                <div>
                  <p className="text-sm sm:text-base font-semibold text-accent mb-2">
                    HELOC consolidation could save you money!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your monthly payment drops by <strong>{formatCurrency(calculations.monthlySavings)}</strong>.
                    However, the HELOC will take {calculations.heloc.yearsToPayoff} years to pay off, 
                    compared to {calculations.existing.yearsToPayoff} years {calculations.existing.monthsToPayoff} months 
                    for your current debts. Total interest is higher with HELOC, but potential tax savings may offset this 
                    if used for home improvements.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm sm:text-base font-semibold text-amber-600 mb-2">
                    Keeping your current debts may be more cost-effective.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    While HELOC offers lower monthly payments of <strong>{formatCurrency(calculations.heloc.monthlyPayment)}</strong> vs 
                    <strong> {formatCurrency(calculations.existing.monthlyPayment)}</strong>, the extended payoff period 
                    results in more total interest paid. Consider your cash flow needs and long-term financial goals.
                  </p>
                </div>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="details">
          <section className="calculator-card p-4 sm:p-6">
            <h2 className="text-xl font-display font-semibold mb-4">What is a HELOC?</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A <strong>Home Equity Line of Credit (HELOC)</strong> is a revolving line of credit secured by your home's equity. 
                Unlike a traditional loan, a HELOC works more like a credit card – you can borrow up to a certain limit, 
                repay, and borrow again during the draw period.
              </p>
              
              <h3 className="text-lg font-semibold text-foreground mt-6">How HELOCs Work</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Draw Period:</strong> Typically 5-10 years where you can borrow funds and make interest-only payments</li>
                <li><strong>Repayment Period:</strong> Usually 10-20 years where you repay principal and interest</li>
                <li><strong>Variable Rates:</strong> Most HELOCs have variable interest rates tied to the prime rate</li>
                <li><strong>Credit Limit:</strong> Based on your home equity, typically up to 80-85% of home value minus mortgage balance</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6">HELOC vs Home Equity Loan</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>HELOC:</strong> Revolving credit, variable rate, flexible borrowing</li>
                <li><strong>Home Equity Loan:</strong> Lump sum, fixed rate, predictable payments</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6">Tax Considerations</h3>
              <p>
                Since the Tax Cuts and Jobs Act of 2017, HELOC interest is only tax deductible if the funds are used to 
                "buy, build, or substantially improve" the home securing the loan. Interest on HELOCs used for debt 
                consolidation, vacations, or other purposes is no longer deductible.
              </p>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelocCalculator;
