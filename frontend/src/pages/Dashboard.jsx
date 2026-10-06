import { useEffect, useState, useCallback } from "react";
import { transactionApi, insightApi } from "../api/api";
import TransactionForm from "../components/TransactionForm";
import AlertBanner from "../components/AlertBanner";
import ReviewQueue from "../components/ReviewQueue";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [trend, setTrend] = useState([]);

  const loadInsights = useCallback(async () => {
    const [catRes, trendRes, reviewRes] = await Promise.all([
      insightApi.byCategory({}),
      insightApi.monthlyTrend(),
      transactionApi.reviewQueue(),
    ]);
    setByCategory(catRes.data);
    setTrend(trendRes.data);
    setReviewItems(reviewRes.data);
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  function handleCreated({ alerts }) {
    setAlerts(alerts || []);
    loadInsights();
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <AlertBanner alerts={alerts} />

      <TransactionForm onCreated={handleCreated} />

      <ReviewQueue items={reviewItems} onResolved={loadInsights} />

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spend by category (this month)</h3>
          <CategoryPieChart data={byCategory} />
        </div>
        <div className="chart-card">
          <h3>Monthly trend</h3>
          <MonthlyTrendChart data={trend} />
        </div>
      </div>
    </div>
  );
}
