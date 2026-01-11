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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Home, DollarSign, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency, formatPercent } from "@/lib/formatters";

const QualificationCalculator = () => {
  const [homeValue, setHomeValue] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [loanTerm, setLoanTerm] = useState("30");
  const [interestRate, setInterestRate] = useState(6.5);
  const [annualTaxes, setAnnualTaxes] = useState(4800);
  const [annualInsurance, setAnnualInsurance] = useState(2400);
  const [annualPMI, setAnnualPMI] = useState(0);
  const [frontEndRatio, setFrontEndRatio] = useState(28);
  const [backEndRatio, setBackEndRatio] = useState(36);
  const [monthlyDebts, setMonthlyDebts] = useState(500);

  const results = useMemo(() => {
    const loanAmount = homeValue - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = parseInt(loanTerm) * 12;
    
    // Calculate monthly P&I
    let monthlyPI = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else if (loanAmount > 0) {
      monthlyPI = loanAmount / numberOfPayments;
    }
    
    // Monthly housing expenses
    const monthlyTaxes = annualTaxes / 12;
    const monthlyInsurance = annualInsurance / 12;
    const monthlyPMI = annualPMI / 12;
    
    // Total monthly housing payment (PITI + PMI)
    const totalHousingPayment = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyPMI;
    
    // Calculate required income based on front-end ratio
    // Front-end: housing payment / gross income <= front-end ratio
    const requiredIncomeFromFrontEnd = (totalHousingPayment / (frontEndRatio / 100));
    
    // Calculate required income based on back-end ratio
    // Back-end: (housing payment + other debts) / gross income <= back-end ratio
    const requiredIncomeFromBackEnd = ((totalHousingPayment + monthlyDebts) / (backEndRatio / 100));
    
    // Use the higher of the two (more conservative)
    const requiredMonthlyIncome = Math.max(requiredIncomeFromFrontEnd, requiredIncomeFromBackEnd);
    const requiredAnnualIncome = requiredMonthlyIncome * 12;
    
    // Calculate what the DTI ratios would be at the required income
    const actualFrontEnd = (totalHousingPayment / requiredMonthlyIncome) * 100;
    const actualBackEnd = ((totalHousingPayment + monthlyDebts) / requiredMonthlyIncome) * 100;
    
    // Max allowable debt based on the back-end ratio minus housing
    const maxMonthlyDebtAllowance = (requiredMonthlyIncome * (backEndRatio / 100)) - totalHousingPayment;
    
    // Down payment percentage
    const downPaymentPercent = (downPayment / homeValue) * 100;
    
    // LTV
    const ltv = (loanAmount / homeValue) * 100;

    return {
      loanAmount,
      monthlyPI,
      monthlyTaxes,
      monthlyInsurance,
      monthlyPMI,
      totalHousingPayment,
      requiredMonthlyIncome,
      requiredAnnualIncome,
      actualFrontEnd,
      actualBackEnd,
      maxMonthlyDebtAllowance,
      downPaymentPercent,
      ltv,
    };
  }, [homeValue, downPayment, loanTerm, interestRate, annualTaxes, annualInsurance, annualPMI, frontEndRatio, backEndRatio, monthlyDebts]);

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          This pre-qualification calculator estimates the minimum income required to qualify for a mortgage. 
          Enter the home price and loan details to see how much you need to earn based on debt-to-income (DTI) ratios.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-accent" />
                Price & Down Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Home Value */}
              <div className="input-group">
                <Label className="input-label">Home Value</Label>
                <CurrencyInput value={homeValue} onChange={setHomeValue} />
              </div>

              {/* Down Payment */}
              <div className="input-group">
                <Label className="input-label">Down Payment</Label>
                <CurrencyInput value={downPayment} onChange={setDownPayment} />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercent(results.downPaymentPercent)} of home value
                </p>
              </div>

              {/* Loan Amount Display */}
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">{formatCurrency(results.loanAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Mortgage Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Loan Term */}
              <div className="input-group">
                <Label className="input-label">Loan Term</Label>
                <Select value={loanTerm} onValueChange={setLoanTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Rate */}
              <div className="input-group">
                <Label className="input-label">Interest Rate</Label>
                <div className="relative">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    step="0.125"
                    min="0"
                    max="20"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>

              {/* Annual Taxes */}
              <div className="input-group">
                <Label className="input-label">Annual Property Taxes</Label>
                <CurrencyInput value={annualTaxes} onChange={setAnnualTaxes} />
              </div>

              {/* Annual Insurance */}
              <div className="input-group">
                <Label className="input-label">Annual Home Insurance</Label>
                <CurrencyInput value={annualInsurance} onChange={setAnnualInsurance} />
              </div>

              {/* Annual PMI */}
              <div className="input-group">
                <Label className="input-label">
                  Annual PMI
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Private Mortgage Insurance, typically required when down payment is less than 20%.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <CurrencyInput value={annualPMI} onChange={setAnnualPMI} />
              </div>
            </CardContent>
          </Card>

          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                DTI Limits & Debts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Front End Ratio */}
              <div className="input-group">
                <Label className="input-label">
                  Front-End Ratio (Housing)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Maximum percentage of gross income for housing expenses (PITI). Conventional loans typically use 28%.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    value={frontEndRatio}
                    onChange={(e) => setFrontEndRatio(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="100"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>

              {/* Back End Ratio */}
              <div className="input-group">
                <Label className="input-label">
                  Back-End Ratio (Total Debt)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Maximum percentage of gross income for all debts including housing. Conventional loans typically use 36%.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    value={backEndRatio}
                    onChange={(e) => setBackEndRatio(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="100"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>

              {/* Monthly Other Debts */}
              <div className="input-group">
                <Label className="input-label">
                  Other Monthly Debts
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Monthly payments for car loans, student loans, credit cards, and other recurring debts.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <CurrencyInput value={monthlyDebts} onChange={setMonthlyDebts} />
              </div>

              {/* DTI Presets */}
              <div className="pt-2">
                <Label className="input-label mb-2">Quick DTI Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFrontEndRatio(28); setBackEndRatio(36); }}
                    className="text-xs px-3 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
                  >
                    Conventional (28/36)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFrontEndRatio(31); setBackEndRatio(43); }}
                    className="text-xs px-3 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
                  >
                    FHA (31/43)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFrontEndRatio(41); setBackEndRatio(41); }}
                    className="text-xs px-3 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
                  >
                    VA (41%)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFrontEndRatio(29); setBackEndRatio(41); }}
                    className="text-xs px-3 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
                  >
                    USDA (29/41)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Main Result */}
          <Card className="bg-primary border-0 rounded-xl p-6 shadow-xl">
            <CardContent className="p-0">
              <div className="text-center space-y-4">
                <p className="text-white/80 text-sm font-medium">
                  Minimum Annual Income Required
                </p>
                <p className="text-4xl md:text-5xl font-bold text-white number-pop">
                  {formatCurrency(results.requiredAnnualIncome)}
                </p>
                <p className="text-white/70 text-sm">
                  ({formatCurrency(results.requiredMonthlyIncome)}/month)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Monthly Housing Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Principal & Interest</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyPI)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Property Tax</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyTaxes)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Home Insurance</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyInsurance)}</span>
                </div>
                {results.monthlyPMI > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">PMI</span>
                    <span className="font-semibold">{formatCurrency(results.monthlyPMI)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-secondary/50 rounded-lg px-3 -mx-3">
                  <span className="font-medium">Total Housing Payment</span>
                  <span className="font-bold text-lg text-accent">{formatCurrency(results.totalHousingPayment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DTI Analysis */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                DTI Ratio Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Front-End Ratio</span>
                  </div>
                  <span className="font-semibold">{formatPercent(results.actualFrontEnd)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Back-End Ratio</span>
                  </div>
                  <span className="font-semibold">{formatPercent(results.actualBackEnd)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Max Debt Allowance</span>
                  <span className="font-semibold">{formatCurrency(Math.max(0, results.maxMonthlyDebtAllowance))}/mo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualification Tip */}
          <Card className="calculator-card bg-secondary/30 border-accent/30">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Qualification Tips</p>
                  <p>
                    If your income is below {formatCurrency(results.requiredAnnualIncome)}, consider: 
                    looking for a less expensive home, saving for a larger down payment, 
                    or finding a lender with higher DTI limits (like FHA or VA loans).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        This calculator provides estimates for educational purposes only. Actual qualification depends on 
        credit score, employment history, and lender requirements. Consult with a mortgage professional for accurate pre-approval.
      </p>
    </div>
  );
};

export default QualificationCalculator;
