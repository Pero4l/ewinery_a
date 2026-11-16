"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSalesTrend } from "@/hooks/use-dashboard";
import { formatCurrency, asArray } from "@/lib/utils";
import type { SalesTrend } from "@/types";

const GOLD = "#c9a13b";
const INK = "#3a342b";
const AXIS = "#8a8274";

export function SalesChart() {
  const { data: salesData, isLoading } = useSalesTrend();

  const chartData = useMemo(() => {
    return asArray<SalesTrend>(salesData).map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      }),
      revenue: item.revenue,
      orders: item.orders,
    }));
  }, [salesData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Sales Trend</CardTitle>
        <CardDescription>Revenue and order volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No sales data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#ece7dc" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: AXIS }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 12, fill: AXIS }}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: AXIS }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: GOLD, strokeOpacity: 0.4 }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #ece7dc",
                  boxShadow: "0 8px 24px rgba(60, 45, 10, 0.08)",
                  fontSize: 12,
                }}
                formatter={(value, name) => {
                  const numeric = Number(value ?? 0);
                  return name === "Revenue"
                    ? [formatCurrency(numeric), "Revenue"]
                    : [numeric, "Orders"];
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={GOLD}
                strokeWidth={2.5}
                fill="url(#revenueFill)"
                dot={false}
                activeDot={{ r: 5, fill: GOLD, stroke: "#fff", strokeWidth: 2 }}
                name="Revenue"
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke={INK}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: INK, stroke: "#fff", strokeWidth: 2 }}
                name="Orders"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}