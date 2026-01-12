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
import { HelpCircle, Home, DollarSign, TrendingDown, Calendar, PiggyBank, TableIcon, ChartLine } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency } from "@/lib/formatters";

const ExtraPaymentsCalculator = () => {
  // Loan Information
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState("30");

  // Extra Payments
  const [initialExtraPayment, setInitialExtraPayment] = useState(0);
  const [monthlyExtraPayment, setMonthlyExtraPayment] = useState(200);

  const loanAmount = Math.max(0, homePrice - downPayment);

  const results = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = parseInt(loanTerm) * 12;

    // Calculate standard monthly P&I
    let standardMonthlyPI = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      standardMonthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else if (loanAmount > 0) {
      standardMonthlyPI = loanAmount / totalPayments;
    }

    // ========== ORIGINAL SCHEDULE ==========
    let originalBalance = loanAmount;
    let originalTotalPayments = 0;
    let originalTotalInterest = 0;
    const originalSchedule: Array<{
      year: number;
      principal: number;
      interest: number;
      balance: number;
      totalPaid: number;
    }> = [];

    for (let month = 1; month <= totalPayments && originalBalance > 0; month++) {
      const interestPayment = originalBalance * monthlyRate;
      const principalPayment = Math.min(standardMonthlyPI - interestPayment, originalBalance);
      
      originalBalance -= principalPayment;
      originalTotalPayments += standardMonthlyPI;
      originalTotalInterest += interestPayment;

      // Record yearly data
      if (month % 12 === 0 || originalBalance <= 0) {
        const year = Math.ceil(month / 12);
        originalSchedule.push({
          year,
          principal: loanAmount - originalBalance,
          interest: originalTotalInterest,
          balance: Math.max(0, originalBalance),
          totalPaid: originalTotalPayments,
        });
      }
    }

    const originalMonths = totalPayments;
    const originalYears = Math.floor(originalMonths / 12);
    const originalRemainingMonths = originalMonths % 12;

    // ========== EXTRA PAYMENT SCHEDULE ==========
    let extraBalance = loanAmount - initialExtraPayment;
    let extraTotalPayments = initialExtraPayment;
    let extraTotalInterest = 0;
    let extraMonths = 0;
    const extraSchedule: Array<{
      year: number;
      principal: number;
      interest: number;
      balance: number;
      totalPaid: number;
    }> = [];

    let yearlyPrincipal = initialExtraPayment;
    let yearlyInterest = 0;

    for (let month = 1; month <= totalPayments && extraBalance > 0.01; month++) {
      const interestPayment = extraBalance * monthlyRate;
      const standardPrincipal = standardMonthlyPI - interestPayment;
      const totalPrincipalPayment = Math.min(standardPrincipal + monthlyExtraPayment, extraBalance);
      const actualPayment = interestPayment + totalPrincipalPayment;

      extraBalance -= totalPrincipalPayment;
      extraTotalPayments += actualPayment;
      extraTotalInterest += interestPayment;
      yearlyPrincipal += totalPrincipalPayment;
      yearlyInterest += interestPayment;
      extraMonths = month;

      // Record yearly data
      if (month % 12 === 0 || extraBalance <= 0.01) {
        const year = Math.ceil(month / 12);
        extraSchedule.push({
          year,
          principal: loanAmount - extraBalance,
          interest: extraTotalInterest,
          balance: Math.max(0, extraBalance),
          totalPaid: extraTotalPayments,
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }

    const extraYears = Math.floor(extraMonths / 12);
    const extraRemainingMonths = extraMonths % 12;

    // Calculate savings
    const interestSavings = originalTotalInterest - extraTotalInterest;
    const monthsSaved = originalMonths - extraMonths;
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonthsSaved = monthsSaved % 12;

    // Create comparison chart data
    const chartData = [];
    const maxYears = Math.max(originalSchedule.length, extraSchedule.length);
    
    for (let i = 0; i < maxYears; i++) {
      const year = i + 1;
      chartData.push({
        year: `Year ${year}`,
        originalBalance: originalSchedule[i]?.balance ?? 0,
        extraBalance: extraSchedule[i]?.balance ?? 0,
      });
    }

    return {
      // Original schedule
      originalMonthlyPayment: standardMonthlyPI,
      originalTotalPayments,
      originalTotalInterest,
      originalYears,
      originalRemainingMonths,
      originalSchedule,

      // Extra payment schedule
      extraMonthlyPayment: standardMonthlyPI + monthlyExtraPayment,
      extraTotalPayments,
      extraTotalInterest,
      extraYears,
      extraRemainingMonths,
      extraSchedule,

      // Savings
      interestSavings,
      yearsSaved,
      remainingMonthsSaved,
      
      // Chart
      chartData,
    };
  }, [loanAmount, interestRate, loanTerm, initialExtraPayment, monthlyExtraPayment]);

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          See how extra payments can save you thousands in interest and pay off your mortgage years early. 
          Enter your loan details and additional payment amounts to see the impact.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
          {/* Loan Information */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-accent" />
                Loan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="input-group">
                <Label className="input-label">Home Price</Label>
                <CurrencyInput value={homePrice} onChange={setHomePrice} />
              </div>

              <div className="input-group">
                <Label className="input-label">Down Payment</Label>
                <CurrencyInput value={downPayment} onChange={setDownPayment} />
                <p className="text-xs text-muted-foreground mt-1">
                  {((downPayment / homePrice) * 100).toFixed(1)}% down
                </p>
              </div>

              <div className="input-group">
                <Label className="input-label">Loan Amount</Label>
                <div className="h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm flex items-center">
                  {formatCurrency(loanAmount)}
                </div>
              </div>

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

              <div className="input-group">
                <Label className="input-label">Loan Term</Label>
                <Select value={loanTerm} onValueChange={setLoanTerm}>
                  <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Extra Payments */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-accent" />
                Extra Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="input-group">
                <Label className="input-label">
                  Initial Extra Payment
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>A one-time lump sum payment made at the start of the loan.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <CurrencyInput value={initialExtraPayment} onChange={setInitialExtraPayment} />
              </div>

              <div className="input-group">
                <Label className="input-label">
                  Additional Monthly Payment
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Extra amount added to your regular monthly payment, applied directly to principal.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <CurrencyInput value={monthlyExtraPayment} onChange={setMonthlyExtraPayment} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Interest Savings Highlight */}
          <Card className="bg-primary border-0 rounded-xl p-6 shadow-xl">
            <CardContent className="p-0">
              <div className="text-center space-y-2">
                <TrendingDown className="h-8 w-8 mx-auto text-white/80" />
                <p className="text-white/80 text-sm font-medium">
                  Total Interest Savings
                </p>
                <p className="text-4xl md:text-5xl font-bold text-white number-pop">
                  {formatCurrency(results.interestSavings)}
                </p>
                <p className="text-white/80 text-sm">
                  Pay off {results.yearsSaved} years {results.remainingMonthsSaved > 0 ? `${results.remainingMonthsSaved} months` : ''} early
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Payment Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium pb-2 border-b border-border">
                  <span></span>
                  <span className="text-center">Original</span>
                  <span className="text-center">With Extra</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Monthly P&I</span>
                  <span className="text-center">{formatCurrency(results.originalMonthlyPayment)}</span>
                  <span className="text-center">{formatCurrency(results.extraMonthlyPayment)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Total Payments</span>
                  <span className="text-center">{formatCurrency(results.originalTotalPayments)}</span>
                  <span className="text-center">{formatCurrency(results.extraTotalPayments)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="text-center">{formatCurrency(results.originalTotalInterest)}</span>
                  <span className="text-center">{formatCurrency(results.extraTotalInterest)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Loan Length</span>
                  <span className="text-center">
                    {results.originalYears} yrs {results.originalRemainingMonths > 0 ? `${results.originalRemainingMonths} mo` : ''}
                  </span>
                  <span className="text-center">
                    {results.extraYears} yrs {results.extraRemainingMonths > 0 ? `${results.extraRemainingMonths} mo` : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-3 bg-secondary/50 rounded-lg px-3 -mx-3">
                  <span className="font-medium">Interest Savings</span>
                  <span className="text-center">—</span>
                  <span className="text-center font-bold text-accent">{formatCurrency(results.interestSavings)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Saved */}
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
                  <p className="text-sm text-muted-foreground mb-1">Extra/Month</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(monthlyExtraPayment)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Amortization Tabs */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="chart" className="text-sm">
            <ChartLine className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Balance Comparison</span>
            <span className="sm:hidden">Chart</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-sm">
            <TableIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Amortization Schedule</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Loan Balance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fontSize: 12 }} 
                      className="text-muted-foreground"
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="originalBalance"
                      name="Original Schedule"
                      stroke="hsl(var(--muted-foreground))"
                      fill="hsl(var(--muted))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="extraBalance"
                      name="With Extra Payments"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Yearly Amortization Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Year</TableHead>
                      <TableHead className="text-right">Original Balance</TableHead>
                      <TableHead className="text-right">Extra Payment Balance</TableHead>
                      <TableHead className="text-right">Savings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.originalSchedule.map((item, index) => {
                      const extraItem = results.extraSchedule[index];
                      const savings = item.balance - (extraItem?.balance ?? 0);
                      
                      return (
                        <TableRow key={item.year}>
                          <TableCell className="text-center font-medium">{item.year}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.balance)}</TableCell>
                          <TableCell className="text-right">
                            {extraItem ? formatCurrency(extraItem.balance) : "—"}
                          </TableCell>
                          <TableCell className="text-right text-accent font-medium">
                            {extraItem ? formatCurrency(savings) : formatCurrency(item.balance)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExtraPaymentsCalculator;
