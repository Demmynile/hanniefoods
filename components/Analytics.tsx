import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Product, Category } from "@/types/product";

interface AnalyticsProps {
  products: Product[];
  categories: Category[];
}

export function Analytics({ products, categories }: AnalyticsProps) {
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const outOfStock = products.filter(p => p.stock === 0).length;
    const avgRating = products.length > 0 
      ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
      : 0;

    const categoryData = categories.map(cat => {
      const count = products.filter(p => p.category.id === cat.id).length;
      return { name: cat.title, value: count };
    }).filter(item => item.value > 0);

    const priceRanges = [
      { range: "Under $15", min: 0, max: 15 },
      { range: "$15-$30", min: 15, max: 30 },
      { range: "$30-$60", min: 30, max: 60 },
      { range: "Over $60", min: 60, max: Infinity },
    ];
    const priceData = priceRanges.map(range => ({
      range: range.range,
      count: products.filter(p => p.price >= range.min && p.price < range.max).length,
    }));

    const stockData = [
      { name: "In Stock", value: products.filter(p => p.stock > 0).length },
      { name: "Out of Stock", value: outOfStock },
    ];

    return {
      totalProducts,
      totalValue: totalValue.toFixed(2),
      outOfStock,
      avgRating,
      categoryData,
      priceData,
      stockData,
    };
  }, [products, categories]);

  const chartConfig = {
    count: {
      label: "Count",
      color: "#8b5cf6",
    },
    value: {
      label: "Products",
      color: "#f59e0b",
    },
  };

  const COLORS = ["#16a34a", "#dc2626", "#f59e0b", "#0891b2"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-600">Total Products</p>
          <p className="text-2xl font-bold text-stone-900">{stats.totalProducts}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-600">Total Value</p>
          <p className="text-2xl font-bold text-green-600">${stats.totalValue}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-600">Avg. Rating</p>
          <p className="text-2xl font-bold text-amber-600">⭐ {stats.avgRating}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Price Distribution</h3>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={stats.priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Stock Status</h3>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={stats.stockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.stockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </div>

        {stats.categoryData.length > 0 && (
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Products by Category</h3>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={stats.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  );
}
