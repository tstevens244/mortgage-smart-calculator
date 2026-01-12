import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, TrendingUp, DollarSign, Percent, Home } from "lucide-react";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency, formatPercent } from "@/lib/formatters";

const CashOutRefiCalculator = () => {
  const [homeValue, setHomeValue] = useState(400000);
  const [currentMortgageBalance, setCurrentMortgageBalance] = useState(200000);
  const [loanTerm, setLoanTerm] = useState("30");
  const [interestRate, setInterestRate] = useState(6.5);
  const [desiredCashOut, setDesiredCashOut] = useState(50000);
  const [refinanceFees, setRefinanceFees] = useState(5000);
  const [rollFeesIntoLoan, setRollFeesIntoLoan] = useState(false);

  const results = useMemo(() => {
    // Maximum LTV is typically 80% for cash-out refi
    const maxLTV = 0.80;
    const maxLoanAmount = homeValue * maxLTV;
    const maxCashOut = maxLoanAmount - currentMortgageBalance;
    
    // Adjusted cash out (capped at max)
    const actualCashOut = Math.min(Math.max(0, desiredCashOut), maxCashOut);
    
    // New loan balance
    let newLoanBalance = currentMortgageBalance + actualCashOut;
    if (rollFeesIntoLoan) {
      newLoanBalance += refinanceFees;
    }
    
    // Combined LTV
    const combinedLTV = (newLoanBalance / homeValue) * 100;
    
    // Monthly payment calculation
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = parseInt(loanTerm) * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment =
        (newLoanBalance * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = newLoanBalance / numberOfPayments;
    }
    
    // Total interest over life of loan
    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - newLoanBalance;
    
    // Adjusted estimate (cash out minus fees if not rolled in)
    const adjustedCashOut = rollFeesIntoLoan ? actualCashOut : actualCashOut - refinanceFees;

    return {
      maxCashOut: Math.max(0, maxCashOut),
      actualCashOut,
      adjustedCashOut: Math.max(0, adjustedCashOut),
      newLoanBalance,
      combinedLTV: Math.min(combinedLTV, 100),
      monthlyPayment,
      totalInterest,
      equity: homeValue - currentMortgageBalance,
    };
  }, [homeValue, currentMortgageBalance, loanTerm, interestRate, desiredCashOut, refinanceFees, rollFeesIntoLoan]);

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          A cash-out refinance allows you to leverage the equity in your home to pull out cash for other expenses, 
          like a home remodel or to pay off high-interest credit cards. Use this calculator to estimate your 
          maximum cash-out amount and new loan balance with or without refinance fees.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <Card className="lg:col-span-2 calculator-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Home className="h-5 w-5 text-accent" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Home Value */}
            <div className="input-group">
              <Label className="input-label">
                Home Value
              </Label>
              <CurrencyInput
                value={homeValue}
                onChange={setHomeValue}
              />
            </div>

            {/* Current Mortgage Balance */}
            <div className="input-group">
              <Label className="input-label">
                Current Mortgage Balance
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The remaining balance on your current mortgage.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <CurrencyInput
                value={currentMortgageBalance}
                onChange={setCurrentMortgageBalance}
              />
            </div>

            {/* Loan Term */}
            <div className="input-group">
              <Label className="input-label">
                New Loan Term
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The length of your new refinanced mortgage.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select value={loanTerm} onValueChange={setLoanTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30-year fixed</SelectItem>
                  <SelectItem value="20">20-year fixed</SelectItem>
                  <SelectItem value="15">15-year fixed</SelectItem>
                  <SelectItem value="10">10-year fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interest Rate */}
            <div className="input-group">
              <Label className="input-label">
                New Interest Rate
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The interest rate for your new refinanced loan.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="relative">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  step="0.125"
                  min="0"
                  max="20"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>

            {/* Desired Cash Out */}
            <div className="input-group">
              <Label className="input-label">
                Desired Cash-Out Amount
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The amount of cash you'd like to receive. This will be capped at your maximum available equity (80% LTV).</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <CurrencyInput
                value={desiredCashOut}
                onChange={setDesiredCashOut}
              />
            </div>

            {/* Refinance Fees */}
            <div className="input-group">
              <Label className="input-label">
                Refinance Fees
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Closing costs and fees associated with refinancing. Typically 2-5% of the loan amount.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <CurrencyInput
                value={refinanceFees}
                onChange={setRefinanceFees}
              />
            </div>

            {/* Roll Fees Checkbox */}
            <div className="flex items-center space-x-3 pt-2">
              <Checkbox
                id="rollFees"
                checked={rollFeesIntoLoan}
                onCheckedChange={(checked) => setRollFeesIntoLoan(checked === true)}
              />
              <Label htmlFor="rollFees" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                Roll fees into new loan
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>If checked, refinance fees will be added to your new loan balance instead of being paid upfront or deducted from your cash-out.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Main Result */}
          <Card className="bg-primary border-0 rounded-xl p-6 shadow-xl">
            <CardContent className="p-0">
              <div className="text-center space-y-2">
                <p className="text-white/80 text-sm font-medium">
                  Estimated Max Cash-Out Amount
                </p>
                <p className="text-4xl md:text-5xl font-bold text-white number-pop">
                  {formatCurrency(results.maxCashOut)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Cash-Out Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Adjusted Estimate
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Your cash-out amount after accounting for refinance fees (if not rolled into loan).</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="font-semibold text-lg">{formatCurrency(results.adjustedCashOut)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Combined Loan-to-Value
                  </span>
                  <span className="font-semibold text-lg">{formatPercent(results.combinedLTV)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    New Loan Balance
                  </span>
                  <span className="font-semibold text-lg">{formatCurrency(results.newLoanBalance)}</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    New Monthly Payment
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Principal and interest only. Does not include taxes, insurance, or other fees.</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="font-semibold text-lg text-accent">{formatCurrency(results.monthlyPayment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equity Info */}
          <Card className="calculator-card bg-secondary/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Equity</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(results.equity)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(results.totalInterest)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        This calculator is for educational purposes only. Actual cash-out amounts, rates, and terms may vary. 
        Consult with a mortgage professional for accurate quotes.
      </p>
    </div>
  );
};

export default CashOutRefiCalculator;
