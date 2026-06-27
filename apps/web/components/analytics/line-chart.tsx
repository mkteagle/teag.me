import { format } from "date-fns";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "../qr-codes/utils";

interface Scan {
  id: string;
  timestamp: string;
  country?: string;
  city?: string;
  region?: string;
}

interface ChartData {
  date: string;
  scans: number;
}

interface LineChartProps {
  data: Scan[];
}

export function LineChart({ data }: LineChartProps) {
  // Process data into daily counts
  const chartData = data.reduce((acc: { [key: string]: number }, scan) => {
    const date = formatDate(scan.timestamp, "yyyy-MM-dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Convert to array format for Recharts
  const formattedData: ChartData[] = Object.entries(chartData)
    .map(([date, count]) => ({
      date,
      scans: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (formattedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No scan data available
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatDate(value, "MMM d")}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelFormatter={(value) => formatDate(value, "MMMM d, yyyy")}
          />
          <Line
            type="monotone"
            dataKey="scans"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))" }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
