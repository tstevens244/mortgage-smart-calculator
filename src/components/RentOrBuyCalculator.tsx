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
import { HelpCircle, Home, Building2, TrendingUp, DollarSign, PiggyBank, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from "recharts";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency } from "@/lib/formatters";

const RentOrBuyCalculator = () => {
  // Rent Info
  const [monthlyRent, setMonthlyRent] = useState(2000);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3);

  // Property Info
  const [homePrice, setHomePrice] = useState(400000);
  const [annualAppreciation, setAnnualAppreciation] = useState(5);
  const [yearsBeforeSell, setYearsBeforeSell] = useState("7");
  const [sellingCost, setSellingCost] = useState(6);

  // Loan Information
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState("30");
  const [annualPMIPercent, setAnnualPMIPercent] = useState(0.5);

  // Ownership Costs
  const [annualPropertyTaxRate, setAnnualPropertyTaxRate] = useState(1.25);
  const [annualInsuranceRate, setAnnualInsuranceRate] = useState(0.5);
  const [annualMaintenance, setAnnualMaintenance] = useState(2000);

  // Tax Info
  const [incomeTaxRate, setIncomeTaxRate] = useState(25);

  const results = useMemo(() => {
    const years = parseInt(yearsBeforeSell);
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = parseInt(loanTerm) * 12;
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;

    // Monthly P&I calculation
    let monthlyPI = 0;
    if (monthlyRate > 0) {
      monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPI = loanAmount / totalPayments;
    }

    // Monthly ownership costs
    const monthlyPropertyTax = (homePrice * annualPropertyTaxRate / 100) / 12;
    const monthlyInsurance = (homePrice * annualInsuranceRate / 100) / 12;
    const monthlyMaintenance = annualMaintenance / 12;
    
    // PMI (only if down payment < 20%)
    const hasPMI = downPaymentPercent < 20;
    const monthlyPMI = hasPMI ? (loanAmount * annualPMIPercent / 100) / 12 : 0;

    const monthlyOwnershipTotal = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyPMI;

    // ========== RENTAL CALCULATIONS ==========
    let totalRentPaid = 0;
    let currentRent = monthlyRent;
    
    for (let year = 1; year <= years; year++) {
      totalRentPaid += currentRent * 12;
      currentRent *= (1 + annualRentIncrease / 100);
    }

    const avgMonthlyRent = totalRentPaid / (years * 12);

    // ========== PURCHASE CALCULATIONS ==========
    
    // Total ownership payments over the period
    let totalOwnershipPayments = 0;
    let totalInterestPaid = 0;
    let remainingBalance = loanAmount;
    let totalPMIPaid = 0;
    let currentLTV = (loanAmount / homePrice) * 100;
    
    for (let month = 1; month <= years * 12; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPI - interestPayment;
      
      totalInterestPaid += interestPayment;
      remainingBalance -= principalPayment;
      
      // Update LTV and check if PMI should stop
      const currentHomeValue = homePrice * Math.pow(1 + annualAppreciation / 100, month / 12);
      currentLTV = (remainingBalance / currentHomeValue) * 100;
      
      if (currentLTV > 80 && hasPMI) {
        totalPMIPaid += monthlyPMI;
      }
      
      totalOwnershipPayments += monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance;
      if (currentLTV > 80 && hasPMI) {
        totalOwnershipPayments += monthlyPMI;
      }
    }

    // Total taxes and insurance
    const totalTaxesAndInsurance = (homePrice * annualPropertyTaxRate / 100 + homePrice * annualInsuranceRate / 100) * years;
    const totalMaintenance = annualMaintenance * years;

    // Tax deduction (simplified - based on interest paid)
    const avgAnnualInterest = totalInterestPaid / years;
    const avgAnnualTaxDeduction = avgAnnualInterest; // Interest is deductible
    const totalTaxDeduction = totalInterestPaid;
    const avgAnnualTaxSavings = avgAnnualTaxDeduction * (incomeTaxRate / 100);
    const totalTaxSavings = totalTaxDeduction * (incomeTaxRate / 100);

    // Home appreciation
    const futureHomeValue = homePrice * Math.pow(1 + annualAppreciation / 100, years);
    const sellingCosts = futureHomeValue * (sellingCost / 100);
    const proceedsMinusCosts = futureHomeValue - sellingCosts;
    const loanBalance = remainingBalance;
    const equityAppreciation = proceedsMinusCosts - loanBalance - downPayment;

    // Net benefit comparison
    // Total cost of buying = all payments made - equity gained - tax savings
    const totalBuyingCost = totalOwnershipPayments + downPayment - (proceedsMinusCosts - loanBalance);
    
    // Simple comparison: which option costs less over the time period?
    const shouldBuy = totalBuyingCost < totalRentPaid;
    const netBenefitOfBuying = totalRentPaid - totalBuyingCost;

    return {
      // Rent
      totalRentPaid,
      avgMonthlyRent,
      
      // Purchase costs
      totalOwnershipPayments,
      monthlyOwnershipTotal,
      totalTaxesAndInsurance,
      totalPMIPaid,
      totalMaintenance,
      
      // Tax benefits
      avgAnnualTaxDeduction,
      totalTaxDeduction,
      avgAnnualTaxSavings,
      totalTaxSavings,
      
      // Appreciation
      costDifference: Math.abs(totalRentPaid - totalBuyingCost),
      isRentCheaper: totalRentPaid < totalBuyingCost,
      futureHomeValue,
      proceedsMinusCosts,
      loanBalance,
      equityAppreciation,
      homePurchaseBenefit: netBenefitOfBuying,
      
      // Recommendation
      shouldBuy,
      netBenefitOfBuying,
      
      // For display
      downPayment,
      loanAmount,
      monthlyPI,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyMaintenance,
      monthlyPMI,
    };
  }, [
    monthlyRent, annualRentIncrease, homePrice, annualAppreciation, 
    yearsBeforeSell, sellingCost, downPaymentPercent, interestRate, 
    loanTerm, annualPMIPercent, annualPropertyTaxRate, annualInsuranceRate,
    annualMaintenance, incomeTaxRate
  ]);

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          Use this calculator to compare the financial costs and benefits of renting versus buying a home. 
          This analysis considers rent appreciation, real estate appreciation, income tax deductions, and transaction costs.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6 lg:col-span-3">
          {/* Rent Information */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-accent" />
                Rent Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Monthly Rent
                  </Label>
                  <CurrencyInput value={monthlyRent} onChange={setMonthlyRent} />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                    Rent Increase
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Expected average annual rent increase percentage.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={annualRentIncrease}
                      onChange={(e) => setAnnualRentIncrease(parseFloat(e.target.value) || 0)}
                      step="0.5"
                      min="0"
                      max="20"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-accent" />
                Property Information
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
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                    Appreciation
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Expected annual home value appreciation rate.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={annualAppreciation}
                      onChange={(e) => setAnnualAppreciation(parseFloat(e.target.value) || 0)}
                      step="0.5"
                      min="-10"
                      max="20"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Years to Sell
                  </Label>
                  <Select value={yearsBeforeSell} onValueChange={setYearsBeforeSell}>
                    <SelectTrigger className="h-8 sm:h-10 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year} {year === 1 ? "year" : "years"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                    Selling Cost
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Typical selling costs include agent commission (5-6%) and closing costs.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={sellingCost}
                      onChange={(e) => setSellingCost(parseFloat(e.target.value) || 0)}
                      step="0.5"
                      min="0"
                      max="15"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Information */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Loan Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Down Payment
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                      step="1"
                      min="0"
                      max="100"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
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
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="10">10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {downPaymentPercent < 20 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1 min-w-[80px] sm:min-w-[100px]">
                      PMI Rate
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Private Mortgage Insurance is required when down payment is less than 20%.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="flex gap-1 sm:gap-2 flex-1">
                      <input
                        type="number"
                        value={annualPMIPercent}
                        onChange={(e) => setAnnualPMIPercent(parseFloat(e.target.value) || 0)}
                        step="0.1"
                        min="0"
                        max="3"
                        className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Down Payment Amount</span>
                  <span className="font-semibold">{formatCurrency(homePrice * downPaymentPercent / 100)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Costs */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-accent" />
                Ownership Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Property Tax
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={annualPropertyTaxRate}
                      onChange={(e) => setAnnualPropertyTaxRate(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="5"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Insurance
                  </Label>
                  <div className="flex gap-1 sm:gap-2 flex-1">
                    <input
                      type="number"
                      value={annualInsuranceRate}
                      onChange={(e) => setAnnualInsuranceRate(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="3"
                      className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="flex items-center text-muted-foreground text-xs sm:text-sm">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2 sm:w-1/2">
                  <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                    Maintenance
                  </Label>
                  <CurrencyInput value={annualMaintenance} onChange={setAnnualMaintenance} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="input-group">
                <Label className="input-label">
                  Income Tax Rate
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Enter your marginal tax rate if you itemize deductions. Enter 0 if you take the standard deduction.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    value={incomeTaxRate}
                    onChange={(e) => setIncomeTaxRate(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="50"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Most taxpayers use standard deductions. If you're not itemizing, enter 0% for an accurate comparison.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recommendation Card */}
          <Card className={`border-0 rounded-xl p-6 shadow-xl ${results.shouldBuy ? 'bg-primary' : 'bg-accent'}`}>
            <CardContent className="p-0">
              <div className="text-center space-y-3">
                <Scale className="h-10 w-10 mx-auto text-white/80" />
                <p className="text-white/80 text-sm font-medium">
                  Based on your inputs, it's better to
                </p>
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {results.shouldBuy ? "BUY" : "RENT"}
                </p>
                <p className="text-white/80 text-sm">
                  Net benefit: {formatCurrency(Math.abs(results.netBenefitOfBuying))}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cost Comparison Chart */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Total Cost Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Rent', value: results.totalRentPaid, fill: 'hsl(var(--accent))' },
                      { name: 'Buy', value: results.totalOwnershipPayments, fill: 'hsl(var(--primary))' },
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
                  >
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                      width={40}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {[
                        { name: 'Rent', value: results.totalRentPaid, fill: 'hsl(var(--accent))' },
                        { name: 'Buy', value: results.totalOwnershipPayments, fill: 'hsl(var(--primary))' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center py-3 bg-secondary/50 rounded-lg px-3 mt-4">
                <span className="font-medium">Difference</span>
                <span className="font-bold text-accent">
                  {results.isRentCheaper ? "Rent saves " : "Buying saves "} 
                  {formatCurrency(results.costDifference)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Expenses */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium pb-2 border-b border-border">
                  <span></span>
                  <span className="text-center">Rental</span>
                  <span className="text-center">Purchase</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Avg Monthly Payment</span>
                  <span className="text-center">{formatCurrency(results.avgMonthlyRent)}</span>
                  <span className="text-center">{formatCurrency(results.monthlyOwnershipTotal)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-2 font-semibold">
                  <span>Monthly Difference</span>
                  <span className="col-span-2 text-center text-accent">
                    {results.isRentCheaper ? "Rent saves " : "Buying saves "} 
                    {formatCurrency(Math.abs(results.avgMonthlyRent - results.monthlyOwnershipTotal))}/mo
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Benefits */}
          {incomeTaxRate > 0 && (
            <Card className="calculator-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Tax Benefits (Purchase)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground text-sm">Avg Annual Tax Deduction</span>
                    <span className="font-semibold">{formatCurrency(results.avgAnnualTaxDeduction)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground text-sm">Total Tax Deduction</span>
                    <span className="font-semibold">{formatCurrency(results.totalTaxDeduction)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground text-sm">Avg Annual Tax Savings</span>
                    <span className="font-semibold">{formatCurrency(results.avgAnnualTaxSavings)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-secondary/50 rounded-lg px-3 -mx-3">
                    <span className="font-medium text-sm">Total Tax Savings</span>
                    <span className="font-bold text-accent">{formatCurrency(results.totalTaxSavings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appreciation */}
          <Card className="calculator-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Home Appreciation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Future Home Value</span>
                  <span className="font-semibold">{formatCurrency(results.futureHomeValue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Proceeds Minus Costs</span>
                  <span className="font-semibold">{formatCurrency(results.proceedsMinusCosts)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Remaining Loan Balance</span>
                  <span className="font-semibold">{formatCurrency(results.loanBalance)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-secondary/50 rounded-lg px-3 -mx-3">
                  <span className="font-medium text-sm">Equity Appreciation</span>
                  <span className="font-bold text-accent">{formatCurrency(results.equityAppreciation)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Payment Breakdown */}
          <Card className="calculator-card bg-secondary/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Monthly Ownership Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Principal & Interest</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyPI)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Property Tax</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyPropertyTax)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Home Insurance</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyInsurance)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Maintenance</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyMaintenance)}</span>
                </div>
                {results.monthlyPMI > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground text-sm">PMI</span>
                    <span className="font-semibold">{formatCurrency(results.monthlyPMI)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-primary/10 rounded-lg px-3 -mx-3">
                  <span className="font-medium">Total Monthly</span>
                  <span className="font-bold text-lg text-accent">{formatCurrency(results.monthlyOwnershipTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RentOrBuyCalculator;
