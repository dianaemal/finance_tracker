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

  // 🔹 Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setAccount((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Fetch accounts
  const fetchAccounts = async () => {
    try {
      const res = await api.get("/accounts/");
      setAccountList(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🔹 Create account
  const handleSubmit = async (e) => {
    e.preventDefault();

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
    }
  };

  // 🔹 Open edit modal
  const handleEdit = (acc) => {
    setMode("edit");
    setEditAccount({
      id: acc.id,
      name: acc.name,
      balance: acc.balance
    });
    setShowModal(true);
  };

  // 🔹 Submit edit
  const handleSubmitEdit = async () => {
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
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account?")) return;

    try {
      const res = await api.delete(`/accounts/${id}`);

      if (res.status === 200 || res.status === 204) {
        setAccountList((prev) =>
          prev.filter((a) => a.id !== id)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="card">
        <h4>Add Account</h4>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="name"
              value={account.name}
              onChange={handleChange}
              placeholder="Account Name (e.g. Checking)"
            />
          </div>

          <div className="form-group">
            <input
              name="balance"
              value={account.balance}
              onChange={handleChange}
              type="number"
              step="0.01"
              placeholder="Balance ($)"
            />
          </div>

          <button className="btn">Add Account</button>
        </form>

        {/* 🔥 Accounts List */}
        <h4 style={{ marginTop: "2rem" }}>Your Accounts</h4>

        {accountsList.length > 0 ? (
          <table>
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
                  <td>${a.balance}</td>
                  <td>
                    <button onClick={() => handleEdit(a)}>Edit</button>
                    <button onClick={() => handleDelete(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No accounts yet</p>
        )}
      </div>

      {/* 🔥 Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Edit Account</h4>

            <input
              value={editAccount.name}
              onChange={(e) =>
                setEditAccount((prev) => ({
                  ...prev,
                  name: e.target.value
                }))
              }
              placeholder="Account name"
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
            />

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button onClick={handleSubmitEdit}>Update</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}