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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Home, Calendar, TrendingDown, DollarSign, TableIcon, ChartLine } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency } from "@/lib/formatters";

const BiWeeklyCalculator = () => {
  // Loan Information
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState("30");

  // Tax Info
  const [taxRate, setTaxRate] = useState(25);

  const loanAmount = Math.max(0, homePrice - downPayment);

  const results = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const biWeeklyRate = interestRate / 100 / 26;
    const totalMonthlyPayments = parseInt(loanTerm) * 12;

    // ========== STANDARD MONTHLY SCHEDULE ==========
    let standardMonthlyPI = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      standardMonthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonthlyPayments)) /
        (Math.pow(1 + monthlyRate, totalMonthlyPayments) - 1);
    } else if (loanAmount > 0) {
      standardMonthlyPI = loanAmount / totalMonthlyPayments;
    }

    let standardBalance = loanAmount;
    let standardTotalInterest = 0;
    let standardTotalPayments = 0;
    const standardSchedule: Array<{
      year: number;
      balance: number;
      interest: number;
      principal: number;
    }> = [];

    for (let month = 1; month <= totalMonthlyPayments && standardBalance > 0.01; month++) {
      const interestPayment = standardBalance * monthlyRate;
      const principalPayment = Math.min(standardMonthlyPI - interestPayment, standardBalance);

      standardBalance -= principalPayment;
      standardTotalInterest += interestPayment;
      standardTotalPayments += standardMonthlyPI;

      if (month % 12 === 0 || standardBalance <= 0.01) {
        const year = Math.ceil(month / 12);
        standardSchedule.push({
          year,
          balance: Math.max(0, standardBalance),
          interest: standardTotalInterest,
          principal: loanAmount - standardBalance,
        });
      }
    }

    const standardMonths = totalMonthlyPayments;
    const standardYears = Math.floor(standardMonths / 12);
    const standardRemainingMonths = standardMonths % 12;

    // ========== BI-WEEKLY SCHEDULE ==========
    // Bi-weekly payment is half of the monthly payment
    const biWeeklyPayment = standardMonthlyPI / 2;
    
    let biWeeklyBalance = loanAmount;
    let biWeeklyTotalInterest = 0;
    let biWeeklyTotalPayments = 0;
    let biWeeklyPaymentCount = 0;
    const biWeeklySchedule: Array<{
      year: number;
      balance: number;
      interest: number;
      principal: number;
    }> = [];

    // 26 bi-weekly payments per year
    const maxBiWeeklyPayments = parseInt(loanTerm) * 26 * 2; // Extra buffer

    for (let payment = 1; payment <= maxBiWeeklyPayments && biWeeklyBalance > 0.01; payment++) {
      const interestPayment = biWeeklyBalance * biWeeklyRate;
      const principalPayment = Math.min(biWeeklyPayment - interestPayment, biWeeklyBalance);

      biWeeklyBalance -= principalPayment;
      biWeeklyTotalInterest += interestPayment;
      biWeeklyTotalPayments += biWeeklyPayment;
      biWeeklyPaymentCount = payment;

      // Record yearly data (every 26 payments = 1 year)
      if (payment % 26 === 0 || biWeeklyBalance <= 0.01) {
        const year = Math.ceil(payment / 26);
        biWeeklySchedule.push({
          year,
          balance: Math.max(0, biWeeklyBalance),
          interest: biWeeklyTotalInterest,
          principal: loanAmount - biWeeklyBalance,
        });
      }
    }

    // Calculate bi-weekly term in months
    const biWeeklyTotalMonths = Math.round((biWeeklyPaymentCount / 26) * 12);
    const biWeeklyYears = Math.floor(biWeeklyTotalMonths / 12);
    const biWeeklyRemainingMonths = biWeeklyTotalMonths % 12;

    // Effective monthly payment for bi-weekly (26 payments / 12 months * payment)
    const effectiveMonthlyBiWeekly = (biWeeklyPayment * 26) / 12;

    // Interest savings
    const interestSavings = standardTotalInterest - biWeeklyTotalInterest;

    // Time saved
    const monthsSaved = standardMonths - biWeeklyTotalMonths;
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonthsSaved = monthsSaved % 12;

    // Tax considerations
    const standardTaxSavings = standardTotalInterest * (taxRate / 100);
    const biWeeklyTaxSavings = biWeeklyTotalInterest * (taxRate / 100);
    const taxSavingsLoss = standardTaxSavings - biWeeklyTaxSavings;
    const netBenefit = interestSavings - taxSavingsLoss;

    // Chart data
    const chartData = [];
    const maxYears = Math.max(standardSchedule.length, biWeeklySchedule.length);

    for (let i = 0; i < maxYears; i++) {
      const year = i + 1;
      chartData.push({
        year: `Year ${year}`,
        standardBalance: standardSchedule[i]?.balance ?? 0,
        biWeeklyBalance: biWeeklySchedule[i]?.balance ?? 0,
      });
    }

    return {
      // Standard schedule
      standardMonthlyPayment: standardMonthlyPI,
      standardTotalPayments,
      standardTotalInterest,
      standardYears,
      standardRemainingMonths,
      standardSchedule,
      standardTaxSavings,

      // Bi-weekly schedule
      biWeeklyPayment,
      effectiveMonthlyBiWeekly,
      biWeeklyTotalPayments,
      biWeeklyTotalInterest,
      biWeeklyYears,
      biWeeklyRemainingMonths,
      biWeeklySchedule,
      biWeeklyTaxSavings,

      // Savings
      interestSavings,
      yearsSaved,
      remainingMonthsSaved,
      taxSavingsLoss,
      netBenefit,

      // Chart
      chartData,
    };
  }, [loanAmount, interestRate, loanTerm, taxRate]);

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          Bi-weekly payments can save you thousands in interest and pay off your mortgage years early. 
          By paying half your monthly payment every two weeks, you make 26 half-payments (13 full payments) per year instead of 12.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6 lg:col-span-3">
          {/* Loan Information */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-accent" />
                Loan Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Home Price
                  </Label>
                  <CurrencyInput value={homePrice} onChange={setHomePrice} />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Down Payment
                  </Label>
                  <CurrencyInput value={downPayment} onChange={setDownPayment} />
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
                    Loan Term
                  </Label>
                  <Select value={loanTerm} onValueChange={setLoanTerm}>
                    <SelectTrigger className="h-8 sm:h-10 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 years</SelectItem>
                      <SelectItem value="25">25 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="10">10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">{formatCurrency(loanAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                  Tax Rate
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Enter your combined state & federal marginal tax rate if you itemize deductions. Enter 0 if you take the standard deduction.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex gap-1 sm:gap-2 flex-1">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="50"
                    className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg mt-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Most taxpayers use standard deductions. If you're not itemizing, enter 0% for an accurate comparison.
                </p>
              </div>
            </CardContent>
        </Card>

          {/* Amortization Tabs - Fills remaining space */}
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="chart" className="text-sm">
                <ChartLine className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Balance Comparison</span>
                <span className="sm:hidden">Chart</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-sm">
                <TableIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Yearly Schedule</span>
                <span className="sm:hidden">Schedule</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-0">
              <Card className="calculator-card">
                <CardContent className="pt-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          width={50}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => [formatCurrency(value), '']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px' }}
                          formatter={(value) => value === 'standardBalance' ? 'Standard' : 'Bi-Weekly'}
                        />
                        <Area
                          type="monotone"
                          dataKey="standardBalance"
                          name="standardBalance"
                          stroke="hsl(var(--muted-foreground))"
                          fill="hsl(var(--muted-foreground) / 0.3)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="biWeeklyBalance"
                          name="biWeeklyBalance"
                          stroke="hsl(var(--accent))"
                          fill="hsl(var(--accent) / 0.3)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <Card className="calculator-card">
                <CardContent className="pt-6">
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Year</TableHead>
                          <TableHead className="text-right">Standard Balance</TableHead>
                          <TableHead className="text-right">Bi-Weekly Balance</TableHead>
                          <TableHead className="text-right">Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.chartData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center font-medium">{row.year}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.standardBalance)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.biWeeklyBalance)}</TableCell>
                            <TableCell className="text-right text-accent font-medium">
                              {formatCurrency(row.standardBalance - row.biWeeklyBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6 lg:col-span-2">
          {/* Net Benefit Highlight */}
          <Card className="bg-primary border-0 rounded-xl p-6 shadow-xl">
            <CardContent className="p-0">
              <div className="text-center space-y-2">
                <TrendingDown className="h-8 w-8 mx-auto text-white/80" />
                <p className="text-white/80 text-sm font-medium">
                  {taxRate > 0 ? "Net Benefit (After Tax Consideration)" : "Total Interest Savings"}
                </p>
                <p className="text-4xl md:text-5xl font-bold text-white number-pop">
                  {formatCurrency(taxRate > 0 ? results.netBenefit : results.interestSavings)}
                </p>
                <p className="text-white/80 text-sm">
                  Pay off {results.yearsSaved} years {results.remainingMonthsSaved > 0 ? `${results.remainingMonthsSaved} months` : ''} early
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Comparison */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Payment Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium pb-2 border-b border-border">
                  <span></span>
                  <span className="text-center">Standard</span>
                  <span className="text-center">Bi-Weekly</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Loan Term</span>
                  <span className="text-center">
                    {results.standardYears} yrs {results.standardRemainingMonths > 0 ? `${results.standardRemainingMonths} mo` : ''}
                  </span>
                  <span className="text-center">
                    {results.biWeeklyYears} yrs {results.biWeeklyRemainingMonths > 0 ? `${results.biWeeklyRemainingMonths} mo` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Bi-Weekly Payment</span>
                  <span className="text-center">—</span>
                  <span className="text-center">{formatCurrency(results.biWeeklyPayment)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="text-center">{formatCurrency(results.standardMonthlyPayment)}</span>
                  <span className="text-center">{formatCurrency(results.effectiveMonthlyBiWeekly)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="text-center">{formatCurrency(results.standardTotalInterest)}</span>
                  <span className="text-center">{formatCurrency(results.biWeeklyTotalInterest)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm py-3 bg-secondary/50 rounded-lg px-3 -mx-3">
                  <span className="font-medium">Interest Savings</span>
                  <span className="text-center">—</span>
                  <span className="text-center font-bold text-accent">{formatCurrency(results.interestSavings)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Savings Impact */}
          {taxRate > 0 && (
            <Card className="calculator-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Tax Savings Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium pb-2 border-b border-border">
                    <span></span>
                    <span className="text-center">Standard</span>
                    <span className="text-center">Bi-Weekly</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Tax Savings</span>
                    <span className="text-center">{formatCurrency(results.standardTaxSavings)}</span>
                    <span className="text-center">{formatCurrency(results.biWeeklyTaxSavings)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Tax Savings Loss</span>
                    <span className="text-center">—</span>
                    <span className="text-center text-destructive">{formatCurrency(results.taxSavingsLoss)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm py-3 bg-secondary/50 rounded-lg px-3 -mx-3">
                    <span className="font-medium">Net Benefit</span>
                    <span className="text-center">—</span>
                    <span className="text-center font-bold text-accent">{formatCurrency(results.netBenefit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Saved Summary */}
          <Card className="calculator-card bg-secondary/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground mb-1">Time Saved</p>
                  <p className="text-xl font-bold text-foreground">
                    {results.yearsSaved} yrs {results.remainingMonthsSaved > 0 ? `${results.remainingMonthsSaved} mo` : ''}
                  </p>
                </div>
                <div>
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground mb-1">Extra/Year</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(results.standardMonthlyPayment)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BiWeeklyCalculator;
