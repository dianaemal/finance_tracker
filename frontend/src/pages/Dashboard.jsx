import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";


export default function Dashboard(){
  //get today's date:
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const [stats, setStats] = useState({
    "count": 0,
    "total": 0,
    "expense": 0,
    "income": 0,
    "net": 0,
    "monthly": 0,
    "remaining": 0
  })
  const [accountsList, setAccounts] = useState([])
  const [categoriesList, setCategories] = useState([])
  const [summary, setSummary] = useState([])
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [transactionTotal, setTransactionTotal] = useState(0);


  const [filters, setFilters] = useState({
    type: "all",
    month: month,
    year: year,
    account: "",
    category: "",
    description: "",
    dateFrom: "",
    dateTo: ""
  });
 

  const headerDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const fetchTotal = async ()=>{
    try {
      const res = await api.get("/accounts/balance/total/");
      setStats((prev)=> ({
        ...prev,
        "count": res.data.count,
        "total": res.data.total
      }));
     
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to load dashboard totals.");
    }
  }

    const fetchCategories = async ()=>{
            try{
                const res = await api.get("/categories/")
                if (res.status === 200){
                    setCategories(res.data || [])
                }
            }catch(err){
                console.log(err)
                setErrorMessage("Failed to load categories.");
            }
        }
    const fetchAccounts = async ()=>{
              try{
                  const res = await api.get("/accounts/")
                  if (res.status === 200){
                      setAccounts(res.data || [])
                  }
              }catch(err){
                  console.log(err)
                  setErrorMessage("Failed to load accounts.");
              }
          }
    const fetchTransactions = async (activeFilters = filters) => {
    try {
      const params = {};
      if (activeFilters.type && activeFilters.type !== "all") params.type = activeFilters.type;
      if (activeFilters.account) params.account_id = Number(activeFilters.account);
      if (activeFilters.category) params.category_id = Number(activeFilters.category);
      if (activeFilters.description?.trim()) params.description = activeFilters.description.trim();
      if (activeFilters.dateFrom) params.date_from = activeFilters.dateFrom;
      if (activeFilters.dateTo) params.date_to = activeFilters.dateTo;
      params.page = transactionPage;
      params.page_size = 10;

      const res = await api.get(`/transactions/`, { params });
      setTransactions(res.data.items || []);
      setTransactionTotalPages(res.data.total_pages || 1);
      setTransactionTotal(res.data.total || 0);
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to load transactions.");
    }
  };

  const fetchStats = async ()=>{
    try {
      const res = await api.get(`/transactions/income/stats/?month=${month}&year=${year}`);
      setStats((prev)=> ({
        ...prev,
        "income": res.data.income,
        "expense": res.data.expense,
        "net": res.data.net,
        "monthly": res.data.monthly_budget,
        "remaining": res.data.remaining
      }));
      console.log(res.data)
     
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to load monthly stats.");
    }
  }
  
  useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await Promise.all([
        fetchTotal(),
        fetchStats(),
        fetchSummary(),
        fetchAccounts(),
        fetchCategories()
      ]);
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  loadData();
  }, []);

  useEffect(() => {
    fetchTransactions(filters);
  }, [
    filters.type,
    filters.account,
    filters.category,
    filters.description,
    filters.dateFrom,
    filters.dateTo,
    transactionPage
  ]);

  const filteredTransactions = transactions;

  
  const formatMoney = (price)=>{
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

  }

  const fetchSummary = async ()=>{
    try {
      const res = await api.get(`/budgets/budgets-summary/?month=${month}&year=${year}`);
      const sorted = sortBySpent(res.data)
      setSummary(sorted)
      console.log(res.data)
     
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to load budget summary.");
    }
  }

  const budgetStatus = (budget, remaining)=>{
      if (budget === 0){
        return ({
          "status": "No Budget set"
        })
      }
      else if (budget >= remaining){
        return ({
          "status": "Under Budget"
        })
      }
      else if (budget < remaining){
        return ({
          "status": "Over Budget"
        })
      }
  }

  // sort the dictionary array by amount spend per category:
  const sortBySpent = (array)=>(
    array.sort((a, b) => b.spent - a.spent)
  )

  // sum spendings with and without budget:
  const sumDict = (array)=>
    array.reduce((acc, currentVale)=>{
      if (currentVale.budget !== 0){
        acc.withBudget += currentVale.spent
      }
      else{
        acc.withoutBudget += currentVale.spent
      }
      return acc
    },  { withBudget: 0, withoutBudget: 0 })
  
    console.log(sumDict(summary))

  const sumBudget = (array)=>
    array.reduce(
  (accumulator, currentValue) => accumulator + currentValue.budget,
  0,
);

const renderStatus = (budgetSum, sumWithBudget, sumWithoutBudget )=>{
    if (budgetSum === 0){
      return (
      <>
        <div>No budget limit set</div>
        <div>{formatMoney(sumWithoutBudget)} spent in categories without cap. Add budget to track limits.</div>
      </>
    );
    }
    else if (budgetSum < sumWithBudget){
      return (
      <>
        <div>Over budget by {formatMoney(sumWithBudget - budgetSum)}</div>
        <div>{formatMoney(sumWithBudget)} spent in budgeted categories vs {formatMoney(budgetSum)} planned. Another {formatMoney(sumWithoutBudget)} has no category budget.</div>
      </>
    );
    }
    else{
      return (
      <>
        <div>Within budget. {formatMoney(budgetSum - sumWithBudget)} remaining</div>
        <div>{formatMoney(sumWithBudget)} of {formatMoney(budgetSum)} use in categories with a limit. planned. {formatMoney(sumWithoutBudget)} extra with categories with no budget.</div>
      </>
    );
    }
}
  const { withBudget, withoutBudget } = sumDict(summary);
  const budgetSum = sumBudget(summary);
  const monthlyBudgetLabel = budgetStatus(stats.monthly, stats.expense).status;
  const monthlyBudgetTone = monthlyBudgetLabel === "Over Budget" ? "danger" : monthlyBudgetLabel === "Under Budget" ? "success" : "neutral";
  const categoryBudgetTone = budgetSum === 0 ? "neutral" : budgetSum < withBudget ? "danger" : "success";

  if (loading){
    return (
    <div className="page-loading">
      <span className="loading-spinner" />Loading dashboard data...
    </div>
    )
  }




  return(
    <div className="app-shell dashboard-page">
      <Sidebar/>
      <main className="main-area">
        <header className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{headerDate}</p>
        </header>

        <div className="card dashboard-card">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
      
          <section className="dashboard-stats">
            <div className="dashboard-stat dashboard-stat--balance">
              <div className="dashboard-stat-label">Total Balance</div>
              <div className="dashboard-stat-value">{formatMoney(stats.total)}</div>
              <div className="dashboard-stat-sub">{stats.count} {stats.count === 1 ? "account": "accounts"}</div>
            </div>

            <div className="dashboard-stat dashboard-stat--income">
              <div className="dashboard-stat-label">Income (This Month)</div>
              <div className="dashboard-stat-value">{formatMoney(stats.income)}</div>
              <div className="dashboard-stat-sub">Recorded transactions</div>
            </div>

            <div className="dashboard-stat dashboard-stat--expense">
              <div className="dashboard-stat-label">Expense (This Month)</div>
              <div className="dashboard-stat-value">{formatMoney(stats.expense)}</div>
              <div className="dashboard-stat-sub">All categories</div>
            </div>

            <div className={`dashboard-stat ${stats.net >= 0 ? "dashboard-stat--success" : "dashboard-stat--danger"}`}>
              <div className="dashboard-stat-label">Net</div>
              <div className="dashboard-stat-value">{formatMoney(stats.net)}</div>
              <div className="dashboard-stat-sub">(income - expense)</div>
            </div>
          </section>

          <div className="dashboard-section-header">
            <h3 className="card-section-title">Monthly Budget Summary</h3>
            <Link to="/budget" className="btn-link dashboard-section-link">Edit monthly budget</Link>
          </div>
          <div className={`dashboard-budget-status dashboard-budget-status--${monthlyBudgetTone}`}>
            {monthlyBudgetLabel}
          </div>
          <table className="data-table">
            <thead>
            <tr>
              <th>Monthly Budget</th>
              <th>Spent</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{stats.monthly > 0 ? formatMoney(stats.monthly) : "--"}</td>
              <td>{formatMoney(stats.expense)}</td>
              <td>{stats.monthly > 0 ? formatMoney(stats.remaining) : "No cap . tracking only"}</td>
            </tr>
          </tbody>

          </table>

          <div className="dashboard-section-header">
            <h3 className="card-section-title">Budget Summary By Category</h3>
            <Link to="/budget" className="btn-link dashboard-section-link">Go to budgets</Link>
          </div>
          <div className={`dashboard-budget-status dashboard-budget-status--${categoryBudgetTone}`}>
            {renderStatus(budgetSum, withBudget, withoutBudget)}
          </div>

    { summary.length > 0 &&
    <table className="data-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Status</th>
        <th>Spent</th>
        <th>Budget</th>
        <th>Remaining</th>
      </tr>
    </thead>

    <tbody>
  {summary.map((item) => (
    <tr key={item.category_id}>
      <td>{item.category}</td>
      <td>
        <span className={`status-pill ${
          budgetStatus(item.budget, item.spent).status === "Over Budget"
            ? "status-pill--danger"
            : budgetStatus(item.budget, item.spent).status === "Under Budget"
              ? "status-pill--success"
              : "status-pill--neutral"
        }`}>
          {budgetStatus(item.budget, item.spent).status}
        </span>
      </td>
      <td>{formatMoney(item.spent)}</td>
      <td>{item.budget !== 0 ? formatMoney(item.budget) : "--"}</td>
      <td>
        {item.budget === 0
          ? "No cap · tracking only"
          : formatMoney(item.remaining)}
      </td>
    </tr>
  ))}
</tbody>
  </table>
}

      
      <div className="dashboard-transactions">
  <div className="dashboard-section-header">
    <h3 className="card-section-title">Transactions</h3>
    <Link to="/transaction" className="btn-link dashboard-section-link">Open transactions page</Link>
  </div>

  {/* FILTERS */}
  <div className="dashboard-filters">
    <select
      value={filters.type}
      onChange={(e) =>
        setFilters({ ...filters, type: e.target.value })
      }
    >
      <option value="all">All</option>
      <option value="income">income</option>
      <option value="expense">expense</option>
    </select>

    <input
      value={filters.description}
      onChange={(e) => setFilters({ ...filters, description: e.target.value })}
      placeholder="Search description"
    />

    <select
      value={filters.account}
      onChange={(e) => setFilters({ ...filters, account: e.target.value })}
    >
      <option value="">All accounts</option>
      {accountsList.map((a) => (
        <option key={a.id} value={a.id}>{a.name}</option>
      ))}
    </select>

    <select
      value={filters.category}
      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
    >
      <option value="">All categories</option>
      {categoriesList.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>

    <input
      type="date"
      value={filters.dateFrom}
      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
      aria-label="From date"
      title="From date"
    />

    <input
      type="date"
      value={filters.dateTo}
      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
      aria-label="To date"
      title="To date"
    />

    <button
      type="button"
      className="btn-secondary"
      onClick={() =>
        setFilters({
          ...filters,
          type: "all",
          account: "",
          category: "",
          description: "",
          dateFrom: "",
          dateTo: "",
        })
      }
    >
      Clear
    </button>
  </div>

  {/* LIST */}
  <table className="data-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Date</th>
      </tr>
    </thead>

    <tbody>
      {filteredTransactions.length === 0 ? (
        <tr>
          <td colSpan="4">No transactions found</td>
        </tr>
      ) : (
        filteredTransactions.map((t) => (
          <tr key={t.id}>
            <td>{t.description}</td>
            <td>{(t.type || "")}</td>
            <td>{formatMoney(t.amount)}</td>
            <td>{new Date(t.date).toLocaleDateString()}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
  <div className="dashboard-pagination">
    <span>Page {transactionPage} of {transactionTotalPages} ({transactionTotal} total)</span>
    <div className="dashboard-pagination-actions">
      <button
        type="button"
        className="btn-secondary"
        disabled={transactionPage <= 1}
        onClick={() => setTransactionPage((prev) => Math.max(1, prev - 1))}
      >
        ◀
      </button>
      <button
        type="button"
        className="btn-secondary"
        disabled={transactionPage >= transactionTotalPages}
        onClick={() => setTransactionPage((prev) => Math.min(transactionTotalPages, prev + 1))}
      >
        ▶
      </button>
    </div>
  </div>
</div>
        </div>
      </main>
    </div>
  )
};