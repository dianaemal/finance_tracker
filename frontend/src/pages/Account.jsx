import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function Accounts() {
  const [account, setAccount] = useState({
    name: "",
    balance: ""
  });

  const [accountsList, setAccountList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [editAccount, setEditAccount] = useState({
    id: null,
    name: "",
    balance: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isEditError, setEditError] = useState(false);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setAccount((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await api.get("/accounts/");
      setAccountList(res.data || []);
      console.log(res.data)
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🔹 Create account
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!account.name) nextErrors.name = "Account name is required.";
    if (account.balance === "") nextErrors.balance = "Balance is required.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setErrorMessage("");
    try {
      const res = await api.post("/accounts/", {
        ...account,
        balance: parseFloat(account.balance)
      });

      if (res.status === 201) {
        setAccount({ name: "", balance: "" });
        fetchAccounts();
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to create account.");
    } finally {
      setSaving(false);
    }
  };

  //  Open edit modal
  const handleEdit = (acc) => {
    setMode("edit");
    setEditAccount({
      id: acc.id,
      name: acc.name,
      balance: acc.balance
    });
    setShowModal(true);
  };

  //  Submit edit
  const handleSubmitEdit = async () => {
    if (!editAccount.name || editAccount.balance === "") {
      setEditError(true);
      setErrorMessage("Account name and balance are required.");
      return;
    }
    setSaving(true);
    setEditError(false)
    setErrorMessage("");
    try {
      const res = await api.put(`/accounts/${editAccount.id}`, {
        name: editAccount.name,
        balance: parseFloat(editAccount.balance)
      });

      if (res.status === 200) {
        setShowModal(false);
        fetchAccounts();
      }
    } catch (err) {
      console.log(err);
      setEditError(true);
      setErrorMessage("Failed to update account.");
      
    } finally {
      setSaving(false);
    }
  };

  //  Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account?")) return;

    try {
      setErrorMessage("");
      const res = await api.delete(`/accounts/${id}`);

      if (res.status === 200 || res.status === 204) {
        setAccountList((prev) =>
          prev.filter((a) => a.id !== id)
        );
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to delete account.");
    }
  };
  
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
      <div className="card">
        <h4>Add Account</h4>
        {!isEditError && errorMessage && <div className="error-message">{errorMessage}</div>}
      
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="name"
              value={account.name}
              onChange={(e) => {
                handleChange(e);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Account Name (e.g. Checking)"
              required
            />
            {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
          </div>

          <div className="form-group">
            <input
              name="balance"
              value={account.balance}
              onChange={(e) => {
                handleChange(e);
                if (fieldErrors.balance) setFieldErrors((prev) => ({ ...prev, balance: "" }));
              }}
              type="number"
              step="0.01"
              placeholder="Balance ($)"
              required
            />
            {fieldErrors.balance && <p className="field-error">{fieldErrors.balance}</p>}
          </div>

          <button className="btn" disabled={saving}>{saving ? "Saving..." : "Add Account"}</button>
        </form>

        {/* Accounts List */}
        <h3 className="card-section-title">Your Accounts</h3>
        {loading && <div className="page-loading"><span className="loading-spinner" />Loading accounts...</div>}

        {accountsList.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {accountsList.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.balance < 0 ? `-$${-(a.balance)}`: `$${a.balance}`}</td>
                  <td>
                    <button onClick={() => handleEdit(a)}>Edit</button>
                    <button onClick={() => handleDelete(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-hint">No accounts yet</p>
        )}
      </div>

      {/*  Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Edit Account</h4>
            {isEditError && errorMessage && <div className="error-message">{errorMessage}</div>}
            <input
              value={editAccount.name}
              onChange={(e) =>
                setEditAccount((prev) => ({
                  ...prev,
                  name: e.target.value
                }))
              }
              placeholder="Account name"
              required
            />

            <input
              type="number"
              step="0.01"
              value={editAccount.balance || ""}
              onChange={(e) =>
                setEditAccount((prev) => ({
                  ...prev,
                  balance: e.target.value
                }))
              }
              placeholder="Balance"
              required
            />

            <div className="modal-actions">
              <button type="button" onClick={handleSubmitEdit} disabled={saving}>{saving ? "Saving..." : "Update"}</button>
              <button type="button" className="btn-secondary" onClick={() =>{ setShowModal(false); setErrorMessage("");}} disabled={saving}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}