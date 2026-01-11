import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { HelpCircle, Home, DollarSign, PiggyBank, TrendingUp } from "lucide-react";
import CurrencyInput from "./CurrencyInput";
import { formatCurrency } from "@/lib/formatters";

const AffordabilityCalculator = () => {
  // Income-based calculator state
  const [annualIncome, setAnnualIncome] = useState(120000);
  const [loanTerm, setLoanTerm] = useState("30");
  const [interestRate, setInterestRate] = useState(6.5);
  const [monthlyDebts, setMonthlyDebts] = useState(500);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.5);
  const [hoaFee, setHoaFee] = useState(0);
  const [insuranceRate, setInsuranceRate] = useState(0.5);
  const [dtiRule, setDtiRule] = useState("28/36");

  // Budget-based calculator state
  const [monthlyBudget, setMonthlyBudget] = useState(3500);
  const [budgetLoanTerm, setBudgetLoanTerm] = useState("30");
  const [budgetInterestRate, setBudgetInterestRate] = useState(6.5);
  const [budgetDownPaymentPercent, setBudgetDownPaymentPercent] = useState(20);
  const [budgetPropertyTaxRate, setBudgetPropertyTaxRate] = useState(1.5);
  const [budgetHoaFee, setBudgetHoaFee] = useState(0);
  const [budgetInsuranceRate, setBudgetInsuranceRate] = useState(0.5);

  // Income-based calculation
  const incomeResults = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    
    // Get DTI limits based on rule
    let frontEndLimit = 0.28;
    let backEndLimit = 0.36;
    
    switch (dtiRule) {
      case "28/36":
        frontEndLimit = 0.28;
        backEndLimit = 0.36;
        break;
      case "31/43":
        frontEndLimit = 0.31;
        backEndLimit = 0.43;
        break;
      case "41":
        frontEndLimit = 0.41;
        backEndLimit = 0.41;
        break;
      default:
        const customRate = parseInt(dtiRule) / 100;
        frontEndLimit = customRate;
        backEndLimit = customRate;
    }
    
    // Max housing payment based on front-end ratio
    const maxHousingFromFrontEnd = monthlyIncome * frontEndLimit;
    
    // Max housing payment based on back-end ratio (total debt)
    const maxHousingFromBackEnd = (monthlyIncome * backEndLimit) - monthlyDebts;
    
    // Use the lower of the two
    const maxMonthlyPayment = Math.max(0, Math.min(maxHousingFromFrontEnd, maxHousingFromBackEnd));
    
    // Calculate how much of the payment goes to taxes, insurance, HOA
    // We need to iterate to find the home price since taxes/insurance depend on it
    let homePrice = 0;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = parseInt(loanTerm) * 12;
    
    // Iterative approach to find home price
    for (let price = 10000; price <= 5000000; price += 1000) {
      const loanAmount = price * (1 - downPaymentPercent / 100);
      
      // Monthly P&I
      let monthlyPI = 0;
      if (monthlyRate > 0) {
        monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      } else {
        monthlyPI = loanAmount / numberOfPayments;
      }
      
      // Monthly taxes, insurance, HOA
      const monthlyTaxes = (price * propertyTaxRate / 100) / 12;
      const monthlyInsurance = (price * insuranceRate / 100) / 12;
      const monthlyHOA = hoaFee / 12;
      
      const totalMonthly = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyHOA;
      
      if (totalMonthly > maxMonthlyPayment) {
        homePrice = price - 1000;
        break;
      }
      homePrice = price;
    }
    
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    
    // Calculate final monthly payment breakdown
    let monthlyPI = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    
    const monthlyTaxes = (homePrice * propertyTaxRate / 100) / 12;
    const monthlyInsurance = (homePrice * insuranceRate / 100) / 12;
    const monthlyHOA = hoaFee / 12;
    const totalMonthlyPayment = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyHOA;

    return {
      homePrice: Math.max(0, homePrice),
      downPayment,
      loanAmount,
      monthlyPayment: totalMonthlyPayment,
      monthlyPI,
      monthlyTaxes,
      monthlyInsurance,
      monthlyHOA,
    };
  }, [annualIncome, loanTerm, interestRate, monthlyDebts, downPaymentPercent, propertyTaxRate, hoaFee, insuranceRate, dtiRule]);

  // Budget-based calculation
  const budgetResults = useMemo(() => {
    const monthlyRate = budgetInterestRate / 100 / 12;
    const numberOfPayments = parseInt(budgetLoanTerm) * 12;
    
    // Iterate to find home price that fits budget
    let homePrice = 0;
    
    for (let price = 10000; price <= 5000000; price += 1000) {
      const loanAmount = price * (1 - budgetDownPaymentPercent / 100);
      
      // Monthly P&I
      let monthlyPI = 0;
      if (monthlyRate > 0) {
        monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      } else {
        monthlyPI = loanAmount / numberOfPayments;
      }
      
      // Monthly taxes, insurance, HOA
      const monthlyTaxes = (price * budgetPropertyTaxRate / 100) / 12;
      const monthlyInsurance = (price * budgetInsuranceRate / 100) / 12;
      const monthlyHOA = budgetHoaFee / 12;
      
      const totalMonthly = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyHOA;
      
      if (totalMonthly > monthlyBudget) {
        homePrice = price - 1000;
        break;
      }
      homePrice = price;
    }
    
    const downPayment = homePrice * (budgetDownPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    
    // Calculate final monthly payment breakdown
    let monthlyPI = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    
    const monthlyTaxes = (homePrice * budgetPropertyTaxRate / 100) / 12;
    const monthlyInsurance = (homePrice * budgetInsuranceRate / 100) / 12;
    const monthlyHOA = budgetHoaFee / 12;
    const totalMonthlyPayment = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyHOA;

    return {
      homePrice: Math.max(0, homePrice),
      downPayment,
      loanAmount,
      monthlyPayment: totalMonthlyPayment,
      monthlyPI,
      monthlyTaxes,
      monthlyInsurance,
      monthlyHOA,
    };
  }, [monthlyBudget, budgetLoanTerm, budgetInterestRate, budgetDownPaymentPercent, budgetPropertyTaxRate, budgetHoaFee, budgetInsuranceRate]);

  const ResultsCard = ({ results, title }: { results: typeof incomeResults; title: string }) => (
    <div className="space-y-6">
      {/* Main Result */}
      <Card className="bg-primary border-0 rounded-xl p-6 shadow-xl">
        <CardContent className="p-0">
          <div className="text-center space-y-2">
            <p className="text-white/80 text-sm font-medium">
              {title}
            </p>
            <p className="text-4xl md:text-5xl font-bold text-white number-pop">
              {formatCurrency(results.homePrice)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card className="calculator-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Monthly Payment Breakdown
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
            {results.monthlyHOA > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">HOA Fee</span>
                <span className="font-semibold">{formatCurrency(results.monthlyHOA)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-secondary/50 rounded-lg px-3 -mx-3">
              <span className="font-medium">Total Monthly Payment</span>
              <span className="font-bold text-lg text-accent">{formatCurrency(results.monthlyPayment)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Summary */}
      <Card className="calculator-card bg-secondary/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Down Payment</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(results.downPayment)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(results.loanAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          Use this calculator to estimate how much house you can afford. Calculate based on your annual income 
          and debt-to-income ratios, or based on a fixed monthly housing budget.
        </p>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="income" className="text-sm">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Income-Based</span>
            <span className="sm:hidden">Income</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-sm">
            <PiggyBank className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Budget-Based</span>
            <span className="sm:hidden">Budget</span>
          </TabsTrigger>
        </TabsList>

        {/* Income-Based Calculator */}
        <TabsContent value="income">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="calculator-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5 text-accent" />
                  Income & Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Annual Income */}
                <div className="input-group">
                  <Label className="input-label">
                    Annual Household Income
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Your total household income before taxes, including salary and other income sources.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <CurrencyInput value={annualIncome} onChange={setAnnualIncome} />
                </div>

                {/* Monthly Debts */}
                <div className="input-group">
                  <Label className="input-label">
                    Monthly Debt Payments
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Total monthly payments for existing debts: car loans, student loans, credit cards, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <CurrencyInput value={monthlyDebts} onChange={setMonthlyDebts} />
                </div>

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

                {/* Down Payment */}
                <div className="input-group">
                  <Label className="input-label">Down Payment</Label>
                  <div className="relative">
                    <input
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                      step="1"
                      min="0"
                      max="100"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* Property Tax Rate */}
                <div className="input-group">
                  <Label className="input-label">Property Tax Rate (per year)</Label>
                  <div className="relative">
                    <input
                      type="number"
                      value={propertyTaxRate}
                      onChange={(e) => setPropertyTaxRate(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="10"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* HOA Fee */}
                <div className="input-group">
                  <Label className="input-label">HOA Fee (per year)</Label>
                  <CurrencyInput value={hoaFee} onChange={setHoaFee} />
                </div>

                {/* Insurance Rate */}
                <div className="input-group">
                  <Label className="input-label">Home Insurance Rate (per year)</Label>
                  <div className="relative">
                    <input
                      type="number"
                      value={insuranceRate}
                      onChange={(e) => setInsuranceRate(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="5"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* DTI Rule */}
                <div className="input-group">
                  <Label className="input-label">
                    Debt-to-Income (DTI) Ratio
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The maximum percentage of your income that can go toward housing (front-end) and total debts (back-end).</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select value={dtiRule} onValueChange={setDtiRule}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="28/36">Conventional (28/36 rule)</SelectItem>
                      <SelectItem value="31/43">FHA (31/43 rule)</SelectItem>
                      <SelectItem value="41">VA (41%)</SelectItem>
                      <SelectItem value="25">Conservative (25%)</SelectItem>
                      <SelectItem value="30">Moderate (30%)</SelectItem>
                      <SelectItem value="35">Aggressive (35%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <ResultsCard results={incomeResults} title="You Can Afford a Home Up To" />
          </div>
        </TabsContent>

        {/* Budget-Based Calculator */}
        <TabsContent value="budget">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="calculator-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-accent" />
                  Monthly Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Monthly Budget */}
                <div className="input-group">
                  <Label className="input-label">
                    Monthly Housing Budget
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The maximum amount you want to spend on housing each month, including mortgage, taxes, insurance, and HOA.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <CurrencyInput value={monthlyBudget} onChange={setMonthlyBudget} />
                </div>

                {/* Loan Term */}
                <div className="input-group">
                  <Label className="input-label">Loan Term</Label>
                  <Select value={budgetLoanTerm} onValueChange={setBudgetLoanTerm}>
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
                      value={budgetInterestRate}
                      onChange={(e) => setBudgetInterestRate(parseFloat(e.target.value) || 0)}
                      step="0.125"
                      min="0"
                      max="20"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* Down Payment */}
                <div className="input-group">
                  <Label className="input-label">Down Payment</Label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budgetDownPaymentPercent}
                      onChange={(e) => setBudgetDownPaymentPercent(parseFloat(e.target.value) || 0)}
                      step="1"
                      min="0"
                      max="100"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* Property Tax Rate */}
                <div className="input-group">
                  <Label className="input-label">Property Tax Rate (per year)</Label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budgetPropertyTaxRate}
                      onChange={(e) => setBudgetPropertyTaxRate(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="10"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                {/* HOA Fee */}
                <div className="input-group">
                  <Label className="input-label">HOA Fee (per year)</Label>
                  <CurrencyInput value={budgetHoaFee} onChange={setBudgetHoaFee} />
                </div>

                {/* Insurance Rate */}
                <div className="input-group">
                  <Label className="input-label">Home Insurance Rate (per year)</Label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budgetInsuranceRate}
                      onChange={(e) => setBudgetInsuranceRate(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="5"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ResultsCard results={budgetResults} title="You Can Afford a Home Up To" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        This calculator provides estimates for educational purposes only. Actual affordability depends on 
        credit score, debt levels, and lender requirements. Consult with a mortgage professional for accurate pre-approval.
      </p>
    </div>
  );
};

export default AffordabilityCalculator;
