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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Section */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-accent" />
                Price & Down Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Home Value
                  </Label>
                  <CurrencyInput value={homeValue} onChange={setHomeValue} />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Down Payment
                  </Label>
                  <CurrencyInput value={downPayment} onChange={setDownPayment} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Loan Amount ({formatPercent(100 - results.downPaymentPercent)})</span>
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
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Loan Term
                  </Label>
                  <Select value={loanTerm} onValueChange={setLoanTerm}>
                    <SelectTrigger className="h-8 sm:h-10 text-sm flex-1">
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

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Interest Rate
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                      step="0.125"
                      min="0"
                      max="20"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Property Tax
                  </Label>
                  <CurrencyInput value={annualTaxes} onChange={setAnnualTaxes} />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Insurance
                  </Label>
                  <CurrencyInput value={annualInsurance} onChange={setAnnualInsurance} />
                </div>

                <div className="flex items-center gap-2 sm:col-span-2 sm:w-1/2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                    Annual PMI
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Private Mortgage Insurance, typically required when down payment is less than 20%.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <CurrencyInput value={annualPMI} onChange={setAnnualPMI} />
                </div>
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
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                    Front-End
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Maximum percentage of gross income for housing expenses (PITI). Conventional loans typically use 28%.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={frontEndRatio}
                      onChange={(e) => setFrontEndRatio(parseFloat(e.target.value) || 0)}
                      step="1"
                      min="0"
                      max="100"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                    Back-End
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Maximum percentage of gross income for all debts including housing. Conventional loans typically use 36%.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={backEndRatio}
                      onChange={(e) => setBackEndRatio(parseFloat(e.target.value) || 0)}
                      step="1"
                      min="0"
                      max="100"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2 sm:w-1/2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                    Other Debts
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Monthly payments for car loans, student loans, credit cards, and other recurring debts.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <CurrencyInput value={monthlyDebts} onChange={setMonthlyDebts} />
                </div>
              </div>

              {/* DTI Presets */}
              <div className="pt-4 mt-4 border-t border-border">
                <Label className="text-xs sm:text-sm text-muted-foreground mb-2 block">Quick DTI Presets</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
        <div className="space-y-6 lg:col-span-2">
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

          {/* Payment Breakdown Chart */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Monthly Housing Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Principal & Interest', value: results.monthlyPI, color: 'hsl(var(--primary))' },
                        { name: 'Property Tax', value: results.monthlyTaxes, color: 'hsl(var(--accent))' },
                        { name: 'Insurance', value: results.monthlyInsurance, color: 'hsl(var(--muted-foreground))' },
                        ...(results.monthlyPMI > 0 ? [{ name: 'PMI', value: results.monthlyPMI, color: 'hsl(var(--destructive))' }] : []),
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { name: 'Principal & Interest', value: results.monthlyPI, color: 'hsl(var(--primary))' },
                        { name: 'Property Tax', value: results.monthlyTaxes, color: 'hsl(var(--accent))' },
                        { name: 'Insurance', value: results.monthlyInsurance, color: 'hsl(var(--muted-foreground))' },
                        ...(results.monthlyPMI > 0 ? [{ name: 'PMI', value: results.monthlyPMI, color: 'hsl(var(--destructive))' }] : []),
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px' }}
                      formatter={(value) => <span className="text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center py-3 bg-secondary/50 rounded-lg px-3 mt-4">
                <span className="font-medium">Total Housing Payment</span>
                <span className="font-bold text-lg text-accent">{formatCurrency(results.totalHousingPayment)}</span>
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
