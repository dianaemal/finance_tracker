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
          [name]: value.trim()
        }))


    }
    const handleEditChange = (e)=>{
        const{name, value} = e.target
        
        setEditTransaction((prev)=>({
          ...prev,
          [name]: value.trim()
        }))


    }

    const handleClick = async ()=>{
      
        try{
          const res = await api.post("/transactions/", {
            ...transaction,
            amount: parseFloat(transaction.amount),
            category_id: Number(transaction.category_id),
            account_id: Number(transaction.account_id),
            date: new Date(transaction.date).toISOString()

          })
          if (res.status === 201){
            fetchTransactions()
          }
        }catch(err){
          console.log(err)
        }
    }
    console.log(transaction.date + ":15.691Z")

    const fetchTransactions = async ()=>{
        try{
            const res = await api.get("/transactions/")
            if (res.status === 200){
                setTransactionsList(res.data || [])
            }
        }catch(err){
            console.log(err)
        }
    }
    useEffect(()=>{
        fetchTransactions()
    }, [])

    const handleEdit = (transaction)=>{
      setEditTransaction(transaction)
      setModal(true)
    }

    const handleSubmitEdit = async ()=>{
        try {
            const res = await api.put(`/transactions/${editTransaction.id}`, editTransaction);
        
            if (res.status === 200) {
                setModal(false);
                fetchTransactions();
              }
            } catch (err) {
              console.log(err);
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
            }
    }

    return(
    <div id="transactions" className="section" style={{ display: "flex" }}>
        <Sidebar />

  <div className="card">
    <h2>Transactions</h2>

    {/* 🔹 Add Transaction Form */}
    <div className="form-card">
      <input
            name="description"
            value={transaction.description}
            onChange={handleChange}
            placeholder="Transaction name/description"
        />
      <input type="datetime-local"
            name="date"
            value = {transaction.date}
            onChange={handleChange}
      />

      <input type="number" step="0.01" placeholder="Amount ($)"
              name="amount"
              value = {transaction.amount}
              onChange={handleChange}
      
      />

      {/* Type */}
      <select name="type" value={transaction.type} onChange={handleChange}>
        <option>Select Type</option>
        <option key="1" value="Income">Income</option>
        <option key="2" value="Expense">Expense</option>
      </select>

      {/* Account */}
      <select name="account_id" value={transaction.account_id} onChange={handleChange}>
        <option>Select Account</option>
        {accountsList.map((account)=>(
            <option key={account.id} value={account.id}>{account.name}</option>
        ))}
      </select>

      {/* Category */}
      <select name="category_id" value={transaction.category_id} onChange={handleChange}>
        <option>Select Category</option>
        {categoriesList.map((cat)=>(
            <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <button onClick={handleClick}>Add Transaction</button>
    </div>

    {/* 🔥 Transactions List */}
    <h3 style={{ marginTop: "2rem" }}>All Transactions</h3>

    <table>
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
            <th>
              <button onClick={() => handleEdit(transaction)}>Edit</button>
              <button onClick={() => handleDelete(transaction.id)}>Delete</button>
            </th>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
   {/* 🔥 Edit Modal */}
  { showModal && <div className="modal-overlay">
    <div className="modal">
      <h4>Edit Transaction</h4>

      <div className="form-card">
      <input
            name="description"
            value={editTransaction.description || ""}
            onChange={handleEditChange}
            placeholder="Transaction name/description"
        />
      <input type="datetime-local"
            name="date"
            value = {editTransaction.date || ""}
            onChange={handleEditChange}
      />

      <input type="number" step="0.01" placeholder="Amount ($)"
              name="amount"
              value = {editTransaction.amount || ""}
              onChange={handleEditChange}
      
      />


      {/* Type */}
      <select name="type" value={editTransaction.type} onChange={handleEditChange}>
        <option>Select Type</option>
        <option key="1" value="Income">Income</option>
        <option key="2" value="Expense">Expense</option>
      </select>

      {/* Account */}
      <select name="account_id" value={editTransaction.account_id} onChange={handleEditChange}>
        <option>Select Account</option>
        {accountsList.map((account)=>(
            <option key={account.id} value={account.id}>{account.name}</option>
        ))}
      </select>

      {/* Category */}
      <select name="category_id" value={editTransaction.category_id} onChange={handleEditChange}>
        <option>Select Category</option>
        {categoriesList.map((cat)=>(
            <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button onClick = {handleSubmitEdit}>Update</button>
        <button onClick={()=> setModal(false)}>Cancel</button>
      </div>
      </div>
  </div>
  </div>
  }
    </div>
    )
}