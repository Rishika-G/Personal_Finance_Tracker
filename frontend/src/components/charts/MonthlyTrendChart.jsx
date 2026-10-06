import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export default function MonthlyTrendChart({ data }) {
  if (!data || data.length === 0) return <p className="chart-empty">No trend data yet.</p>;

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Monthly spend (₹)",
        data: data.map((d) => d.total),
        backgroundColor: "#6C63FF",
        borderRadius: 4,
      },
    ],
  };

  return <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} />;
}
