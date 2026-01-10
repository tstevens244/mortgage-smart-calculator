import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface AmortizationEntry {
  month: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface AmortizationChartProps {
  data: AmortizationEntry[];
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
}

const AmortizationChart = ({
  data,
  monthlyTax,
  monthlyInsurance,
  monthlyPMI,
  monthlyHOA,
}: AmortizationChartProps) => {
  // Aggregate data by year for cleaner visualization
  const yearlyData = useMemo(() => {
    const years: Record<
      number,
      {
        year: number;
        principal: number;
        interest: number;
        taxesAndFees: number;
        balance: number;
        totalPayment: number;
      }
    > = {};

    const monthlyTaxesAndFees = monthlyTax + monthlyInsurance + monthlyPMI + monthlyHOA;

    data.forEach((entry) => {
      const year = entry.date.getFullYear();
      if (!years[year]) {
        years[year] = {
          year,
          principal: 0,
          interest: 0,
          taxesAndFees: 0,
          balance: entry.balance,
          totalPayment: 0,
        };
      }
      years[year].principal += entry.principal;
      years[year].interest += entry.interest;
      years[year].taxesAndFees += monthlyTaxesAndFees;
      years[year].balance = entry.balance; // Keep the last balance of the year
      years[year].totalPayment =
        years[year].principal + years[year].interest + years[year].taxesAndFees;
    });

    return Object.values(years).sort((a, b) => a.year - b.year);
  }, [data, monthlyTax, monthlyInsurance, monthlyPMI, monthlyHOA]);

  const formatYAxisCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="chart-container" aria-labelledby="amortization-chart-heading">
      <h3 id="amortization-chart-heading" className="text-lg font-semibold mb-4">
        Amortization Chart
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Visualize how your payments and balance change over the life of the loan
      </p>

      <div
        className="h-[400px] sm:h-[450px]"
        role="img"
        aria-label="Stacked area chart showing yearly principal, interest, taxes and fees with balance line"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={yearlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="year"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatYAxisCurrency}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Payments",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatYAxisCurrency}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Balance",
                angle: 90,
                position: "insideRight",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="taxesAndFees"
              stackId="1"
              name="Taxes & Fees"
              fill="hsl(var(--chart-tertiary))"
              stroke="hsl(var(--chart-tertiary))"
              fillOpacity={0.8}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="interest"
              stackId="1"
              name="Interest"
              fill="hsl(var(--chart-secondary))"
              stroke="hsl(var(--chart-secondary))"
              fillOpacity={0.8}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="principal"
              stackId="1"
              name="Principal"
              fill="hsl(var(--chart-primary))"
              stroke="hsl(var(--chart-primary))"
              fillOpacity={0.8}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--foreground))", r: 3 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs text-muted-foreground">Total Principal</p>
          <p className="font-semibold text-sm">
            {formatCurrency(yearlyData.reduce((sum, y) => sum + y.principal, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs text-muted-foreground">Total Interest</p>
          <p className="font-semibold text-sm">
            {formatCurrency(yearlyData.reduce((sum, y) => sum + y.interest, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs text-muted-foreground">Total Taxes & Fees</p>
          <p className="font-semibold text-sm">
            {formatCurrency(yearlyData.reduce((sum, y) => sum + y.taxesAndFees, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs text-muted-foreground">Total Paid</p>
          <p className="font-semibold text-sm">
            {formatCurrency(yearlyData.reduce((sum, y) => sum + y.totalPayment, 0))}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AmortizationChart;
