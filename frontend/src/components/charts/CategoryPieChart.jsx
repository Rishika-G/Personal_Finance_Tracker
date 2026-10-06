import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#6C63FF", "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0",
  "#118AB2", "#EF476F", "#A0C4FF", "#B5838D", "#9C89B8",
];

export default function CategoryPieChart({ data }) {
  if (!data || data.length === 0) return <p className="chart-empty">No spending data yet.</p>;

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  };

  return <Pie data={chartData} options={{ plugins: { legend: { position: "right" } } }} />;
}
