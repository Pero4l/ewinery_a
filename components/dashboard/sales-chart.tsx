"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesTrend } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";

export function SalesChart() {
  const { data: salesData, isLoading } = useSalesTrend();

  const chartData = useMemo(() => {
    if (!salesData) return [];
    return salesData.map((item) => ({
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
        <CardTitle className="text-base">Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No sales data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                className="text-muted-foreground"
              />
              <Tooltip
                formatter={(value, name) => {
                  const numeric = Number(value ?? 0);
                  return (
                    name === "revenue"
                      ? [formatCurrency(numeric), "Revenue"]
                      : [numeric, "Orders"]
                  );
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#722f37"
                strokeWidth={2}
                dot={{ fill: "#722f37" }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}