import { useEffect, useState, useCallback } from "react";
import { transactionApi } from "../api/api";
import TransactionList from "../components/TransactionList";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState("");

  const load = useCallback(async () => {
    const res = await transactionApi.list(month ? { month } : {});
    setTransactions(res.data);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      <TransactionList transactions={transactions} onChanged={load} />
    </div>
  );
}
