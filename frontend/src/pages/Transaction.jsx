import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function Transaction(){
    const [accountsList, setAccounts] = useState([])
    const [categoriesList, setCategories] = useState([])
    const [transaction, setTranaction] = useState({
        category_id: "",
        account_id: "",
        type: "",
        date: "",
        amount: "",
        description: ""

    })
    const [transactionsList, setTransactionsList] = useState([])
    const [editTransaction, setEditTransaction] = useState({
        id: null,
        category_id: "",
        account_id: "",
        type: "",
        date: "",
        amount: "",
        description: ""
    })
    const [showModal, setModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isEditError, setEditError] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({})
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const fetchAccounts = async ()=>{
        try{
            const res = await api.get("/accounts/")
            if (res.status === 200){
                setAccounts(res.data || [])
            }
        }catch(err){
            console.log(err)
        }
    }
    useEffect(()=>{
        fetchAccounts()
    }, [])

    const fetchCategories = async ()=>{
        try{
            const res = await api.get("/categories/")
            if (res.status === 200){
                setCategories(res.data || [])
            }
        }catch(err){
            console.log(err)
        }
    }
    useEffect(()=>{
        fetchCategories()
    }, [])

    const handleChange = (e)=>{
        const{name, value} = e.target
        
        setTranaction((prev)=>({
          ...prev,
          [name]: value
        }))
        if (fieldErrors[name]) {
          setFieldErrors((prev) => ({ ...prev, [name]: "" }))
        }


    }
    const handleEditChange = (e)=>{
        const{name, value} = e.target
        
        setEditTransaction((prev)=>({
          ...prev,
          [name]: value
        }))


    }

    const handleClick = async ()=>{
        const nextErrors = {}
        if (!transaction.description) nextErrors.description = "Description is required."
        if (!transaction.date) nextErrors.date = "Date is required."
        if (!transaction.amount) nextErrors.amount = "Amount is required."
        if (!transaction.type) nextErrors.type = "Type is required."
        if (!transaction.account_id) nextErrors.account_id = "Account is required."
        if (!transaction.category_id) nextErrors.category_id = "Category is required."
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) return
      
        setSaving(true)
        setErrorMessage("")
        try{
          const res = await api.post("/transactions/", {
            ...transaction,
            amount: parseFloat(transaction.amount),
            category_id: Number(transaction.category_id),
            account_id: Number(transaction.account_id),
            date: transaction.date

          })
          if (res.status === 201){
            setPage(1)
            setTranaction({
              category_id: "",
              account_id: "",
              type: "",
              date: "",
              amount: "",
              description: ""
            })
            fetchTransactions()
          }
        }catch(err){
          console.log(err)
          setErrorMessage("Failed to create transaction.")
        } finally {
          setSaving(false)
        }
    }
    

    const fetchTransactions = async ()=>{
        setLoading(true)
        setErrorMessage("")
        try{
            const res = await api.get("/transactions/")
            if (res.status === 200){
                setTransactionsList(res.data.items || [])
                setTotalPages(res.data.total_pages || 1)
            }
        }catch(err){
            console.log(err)
            setErrorMessage("Failed to load transactions.")
        } finally {
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchTransactions()
    }, [page])

    const handleEdit = (transaction)=>{
      setEditTransaction(transaction)
      setModal(true)
    }

    const handleSubmitEdit = async ()=>{
        if (!editTransaction.description || !editTransaction.amount || !editTransaction.date || !editTransaction.type
          || !editTransaction.account_id || !editTransaction.type
        ) {
          setErrorMessage("All feilds are required.")
          setEditError(true);
          return
        }
        setSaving(true)
        setEditError(false)
        setErrorMessage("")
        try {
            const res = await api.put(`/transactions/${editTransaction.id}`, editTransaction);
        
            if (res.status === 200) {
                setModal(false);
                fetchTransactions();
              }
            } catch (err) {
              console.log(err);
              setErrorMessage("Failed to update transaction.")
              setEditError(true)
            } finally {
              setSaving(false)
            }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this transaction?")) return;
        
            try {
              const res = await api.delete(`/transactions/${id}`);
        
              if (res.status === 200 || res.status === 204) {
                setTransactionsList((prev) =>
                  prev.filter((a) => a.id !== id)
                );
              }
            } catch (err) {
              console.log(err);
              setErrorMessage("Failed to delete transaction.")
            }
    }

    return(
    <div id="transactions" className="app-shell">
        <Sidebar />

  <main className="main-area">
  <div className="card">
    <h2>Transactions</h2>
    {!isEditError && errorMessage && <div className="error-message">{errorMessage}</div>}
   

    {/* Add Transaction Form */}
    <div className="form-card">
      <input
            name="description"
            value={transaction.description}
            onChange={handleChange}
            placeholder="Transaction name/description"
            required
        />
      {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
      <input type="date"
            name="date"
            value = {transaction.date}
            onChange={handleChange}
            required
      />
      {fieldErrors.date && <p className="field-error">{fieldErrors.date}</p>}

      <input type="number" step="0.01" placeholder="Amount ($)"
              name="amount"
              value = {transaction.amount}
              onChange={handleChange}
              required
      
      />
      {fieldErrors.amount && <p className="field-error">{fieldErrors.amount}</p>}

      {/* Type */}
      <select name="type" value={transaction.type} onChange={handleChange} required>
        <option value="">Select Type</option>
        <option key="1" value="Income">Income</option>
        <option key="2" value="Expense">Expense</option>
      </select>
      {fieldErrors.type && <p className="field-error">{fieldErrors.type}</p>}

      {/* Account */}
      <select name="account_id" value={transaction.account_id} onChange={handleChange} required>
        <option value="">Select Account</option>
        {accountsList.map((account)=>(
            <option key={account.id} value={account.id}>{account.name}</option>
        ))}
      </select>
      {fieldErrors.account_id && <p className="field-error">{fieldErrors.account_id}</p>}

      {/* Category */}
      <select name="category_id" value={transaction.category_id} onChange={handleChange} required>
        <option value="">Select Category</option>
        {categoriesList.map((cat)=>(
            <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      {fieldErrors.category_id && <p className="field-error">{fieldErrors.category_id}</p>}

      <button onClick={handleClick} disabled={saving}>{saving ? "Saving..." : "Add Transaction"}</button>
    </div>

    {/*  Transactions List */}

    <h3 className="card-section-title">All Transactions</h3>
     {loading && <div className="page-loading"><span className="loading-spinner" />Loading transactions...</div>}
    {transactionsList.length > 0 ? (

  
    <table className="data-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Type</th>
          <th>Account</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        
        {transactionsList.map((transaction)=>(
          <tr key={transaction.id}>
            <td>{transaction.description}</td>
            <td>{transaction.date}</td>
            <td>${transaction.amount}</td>
            <td>{transaction.type}</td>
            <td>{transaction.account.name}</td>
            <td>{transaction.category.name}</td>
            <td>
              <button type="button" onClick={() => handleEdit(transaction)}>Edit</button>
              <button type="button" onClick={() => handleDelete(transaction.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>  ): (
          <p className="empty-hint">No transactions yet</p>
      )}
      <div className="dashboard-pagination">
        <span>Page {page} of {totalPages}</span>
        <div className="dashboard-pagination-actions">
          <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>  ◀</button>
          <button type="button" className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>▶</button>
        </div>
      </div>
      </div>
   {/* Edit Modal */}
  { showModal && <div className="modal-overlay">
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h4>Edit Transaction</h4>
       {isEditError && errorMessage && <div className="error-message">{errorMessage}</div>}
   


      <div className="form-card">
      <input
            name="description"
            value={editTransaction.description || ""}
            onChange={handleEditChange}
            placeholder="Transaction name/description"
            required
        />
      <input type="date"
            name="date"
            value = {editTransaction.date || ""}
            onChange={handleEditChange}
            required
      />

      <input type="number" step="0.01" placeholder="Amount ($)"
              name="amount"
              value = {editTransaction.amount || ""}
              onChange={handleEditChange}
              required
      
      />


      {/* Type */}
      <select name="type" value={editTransaction.type} onChange={handleEditChange} required>
        <option value="">Select Type</option>
        <option key="1" value="Income">Income</option>
        <option key="2" value="Expense">Expense</option>
      </select>

      {/* Account */}
      <select name="account_id" value={editTransaction.account_id} onChange={handleEditChange} required>
        <option>Select Account</option>
        {accountsList.map((account)=>(
            <option key={account.id} value={account.id}>{account.name}</option>
        ))}
      </select>

      {/* Category */}
      <select name="category_id" value={editTransaction.category_id} onChange={handleEditChange} required>
        <option>Select Category</option>
        {categoriesList.map((cat)=>(
            <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <div className="modal-actions">
      <button type="button" onClick = {handleSubmitEdit} disabled={saving}>{saving ? "Saving..." : "Update"}</button>
        <button type="button" className="btn-secondary" onClick={() =>{ setModal(false); setErrorMessage("");}} disabled={saving}>Cancel</button>
      </div>
      </div>
  </div>
  </div>
  }
    </main>
    </div>
    )
}