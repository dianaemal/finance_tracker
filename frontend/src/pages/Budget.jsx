import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
export default function Budget(){
    const [categories, setCategories] = useState([])
    // get the current month and year
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear()
    const [viewMonth, setMonth] = useState(currentMonth)
    const [viewYear, setYear] = useState(currentYear)
    const [budgetList, setBudgetList] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [isEditError, setEditError] = useState(false);
    const budgetObject = Object.freeze({
        category_id: null,
        month: viewMonth,
        year: 2026,
        amount: null
    })
    const [budget, setBudget] = useState(budgetObject)
    const [mode, setMode] = useState("create")
    const [editBudget, setEdit] = useState({
        id: null,
        amount: ""
    })
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})

    const [monthlyBudget, setMonthly] = useState({
        "amount": 0,
        "id": null
    })
    //const [selectedCategory, setSelectedCategory] = useState()
    console.log(budget)
    const fetchCategories = ()=>{
        api.get("/categories/").then(
            (res)=>{
                if (res.status === 200){
                    const data = res.data || []
                    console.log(data)
                    setCategories(data)

                }
            }
        ).catch((err)=>{
            console.log(err)
        })
    }

    useEffect(() =>{
        fetchCategories();
    }, []);

    // fetch budgets by month and year
    const fetchBudget = (month, year) =>{
        setLoading(true)
        setErrorMessage("")
        api.get(`/budgets/?month=${month}&year=${year}`).then(
            (res)=>{
                if(res.status === 200){
                    const data = res.data || []
                    console.log(data)
                    setBudgetList(data)

                }
            }
        ).catch((err)=>{
            console.log(err)
            setErrorMessage("Failed to load budgets.")
        }).finally(()=>{
            setLoading(false)
        })
    }
    const fetchSum = async (month, year)=>{
        
        try{
            const res = await api.get(`budgets/monthly/?month=${month}&year=${year}`)
            if (res.status === 200){
              
               const data = res.data || {"amount": 0, "id": 0}
                setMonthly({
                    "amount": data.amount,
                    "id": data.id 
                })
                
            }
        }catch(err){
            console.log(err)
        }
    }
 
   
    // fetch only when month and year change
    useEffect(()=>{
        fetchBudget(viewMonth, viewYear)
        fetchSum(viewMonth, viewYear)
    }, [viewMonth, viewYear])


    const handleChange = (e)=>{
        const {name, value} = e.target;
        
        const finalValue = value === "" ? null : value
        
        setBudget((prev)=>({
            ...prev,
            [name]: finalValue
        }))
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();
        const nextErrors = {}
        if (!budget.category_id) nextErrors.category_id = "Category is required."
        if (budget.amount === null || budget.amount === "") nextErrors.amount = "Limit is required."
        if (!budget.month) nextErrors.month = "Month is required."
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) return

        setSaving(true)
        setErrorMessage("")
        budget.category_id = budget.category_id === "monthly"? null: budget.category_id
        const payload = {
            ...budget,
            category_id: Number(budget.category_id),
            month: Number(budget.month),
            amount: parseFloat(budget.amount)
        };
        try{
            const response = await api.post("/budgets/", payload)
            if (response.status === 201){
               
                console.log(response.data)
                setBudget({
                    category_id: null,
                    month: viewMonth,
                    year: 2026,
                    amount: null
                });
            }
            fetchBudget(viewMonth, viewYear)
            fetchSum(viewMonth, viewYear)
        }catch (error) {
            console.error("Error creating work experience:", error);
            setErrorMessage("Failed to create budget.")
        } finally {
            setSaving(false)

    }
}

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const changeMonth = (direction)=>{
        setMonth((prev)=>{
            if (direction === "prev"){
                if (prev === 1){
                    prev = 12
                    setYear(prev => prev - 1)
                }
                else{
                    prev = prev - 1
                }
            }
            else{
                if(prev === 12){
                    prev = 1
                    setYear(prev=> prev + 1)
                }
                else{
                    prev = prev + 1
                }
            }
            return prev
        })
    }

    const handleAddCategory = async () =>{
        if (!newCategory.trim()) {
            setErrorMessage("Category name is required.")
            return
        }
        setSaving(true)
        setErrorMessage("")
        try{
            const response = await api.post("/categories/", {
            name: newCategory
        })
        if (response.status === 201){
            const data = response.data
            console.log("hey")
            console.log(data)
            setCategories((prev)=>([...prev, data]))
            setShowModal(false)
            setNewCategory("")
            setBudget((prev)=>({
            ...prev,
            category_id: data.id
        }))
        }
    } catch(err){
        console.log(err)
        setErrorMessage("Failed to add category.")
    } finally {
        setSaving(false)
    }
        
        

    }

    const past =  viewYear < currentYear ||
                        (viewYear === currentYear && viewMonth < currentMonth);

    const handleEdit = (budget)=>{
        setMode("edit")
   
        setEdit({
            id: budget.id,
            amount: budget.amount
        })

       
        setShowModal(true)
    }

    const handleSubmitEdit = async ()=>{
        if (editBudget.id){
            if (!editBudget.amount) {
                setEditError(true)
                setErrorMessage("Budget amount is required.")
                return
            }
            setSaving(true)
            setEditError(false)
            setErrorMessage("")
         
            try{
                const response = await api.put(`/budgets/${editBudget.id}`, {
                amount: editBudget.amount
            })
            if (response.status === 201 || response.status === 200){
                console.log(response.data)
                fetchBudget(viewMonth, viewYear)
                fetchSum(viewMonth, viewYear)
                setShowModal(false)

              
                
            }
            }catch(err){
                console.log(err)
                setEditError(true)
                setErrorMessage("Failed to update budget.")
            } finally {
                setSaving(false)
            }
            


        }

       
    }

    const handleDelete = (id) =>{
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try{
                setErrorMessage("")
                api.delete(`/budgets/${id}`)
                .then((res)=>{
                    if (res.status === 200 || res.status === 204){
                        fetchSum(viewMonth, viewYear)
                        setBudgetList((prev)=>{
                            return prev.filter((b)=> b.id !== id)
        
                        })
                        setMonthly({
                            "amount": 0
                        })
                    }
                })
                
            } catch (error) {
                
                setErrorMessage("Failed to delete budget.")
            }
        }
    }


    
    return(
        
        <div className="app-shell">
            <Sidebar/>
        <main className="main-area">
        <div className="card">
           
      <h4>Create Budget</h4>
        { !isEditError && errorMessage && <div className="error-message">{errorMessage}</div>}
       
      <form onSubmit={handleSubmit}>
      <div className="form-group">
        <select name="category_id" value={budget.category_id || ""} onChange={handleChange} required>
            <option value="">Select category</option>
            <option value="monthly">Overall Monthly Budget</option> 
            {categories.map((cat)=>(
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>
        {fieldErrors.category_id && <p className="field-error">{fieldErrors.category_id}</p>}

        <button
        type="button"
        className="btn btn-link"
        onClick={() =>  {
            setMode("create");
            setShowModal(true);
        }}
        >
        + Add new category
        </button>

      </div>
      <div className="form-group" ><input type="number" onChange={handleChange}
       placeholder="Limit ($)" name="amount" step="0.01" value={budget.amount || ""} required/></div>
       {fieldErrors.amount && <p className="field-error">{fieldErrors.amount}</p>}
       <div className="form-group">
            <select  name="month" id="s_month" value={budget.month || ""}  onChange={handleChange} required>
                <option value="">Select a month</option>
                {months.map((month, index)=>{
                    const monthNumber = index + 1
                    const isPast =
                         budget.year < currentYear ||
                        (budget.year === currentYear && monthNumber < currentMonth);

               return <option key={index } value={index + 1} disabled={isPast}>{month}</option>
        }   )}
            </select>
            {fieldErrors.month && <p className="field-error">{fieldErrors.month}</p>}
       </div>
      <button type="submit" className="btn" disabled={saving}>{saving ? "Saving..." : "Create"}</button>
      </form>
       {loading && <div className="page-loading"><span className="loading-spinner" />Loading budgets...</div>}
        <div className="month-picker">
            <button type="button" className="btn-icon" aria-label="Previous month" onClick={() => changeMonth("prev")}>◀</button>
            <span>{months[viewMonth - 1]} {viewYear}</span>
            <button type="button" className="btn-icon" aria-label="Next month" onClick={() => changeMonth("next")}>▶</button>
        </div>
       
        {budgetList.length > 0 ? (
            <table className="data-table">
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {budgetList.map((b) => (

                    <tr key={b.id}>
                    <td>{b.category.name || b.category?.name}</td>
                    <td>${b.amount}</td>
                    {!past && 
                        <td>
                         <button onClick={()=> handleEdit(b)}>Edit</button>
                         <button onClick={()=> handleDelete(b.id)}>Delete</button>
                        </td>
                    }
               
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            viewMonth && <p className="empty-hint">No budgets found</p>
            )}
    </div>
    {showModal && (
      <div className="modal-overlay" onClick={(e) => e.stopPropagation()} >
        <div className="modal" >
          <h4> { mode === "create" ? "Add Category" : "Edit budget"}</h4>
             {isEditError && errorMessage && <div className="error-message">{errorMessage}</div>}

          <input
            value={mode === "create" ? newCategory : editBudget.amount || ""}
            onChange={(e) => mode === "create" ? setNewCategory(e.target.value): setEdit((prev)=>({...prev, amount: e.target.value}))}
            placeholder= {mode === "create" ? "Category name" : "Limit ($)"}
            autoFocus
            type= {mode === "create"? "text": "number"}
          />

          <div className="modal-actions">
            <button type="button" onClick={mode === "create"? handleAddCategory : handleSubmitEdit} disabled={saving}>
                {saving ? "Saving..." : "Add"}
            </button>
            <button type="button" className="btn-secondary" onClick={() =>{ setShowModal(false); setErrorMessage("");}} disabled={saving}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    <div className="total-strip">
        Total budget for the month: ${monthlyBudget.amount}
        {monthlyBudget.amount > 0 && (
            <span style={{ marginLeft: "0.75rem", display: "inline-flex", gap: "0.5rem" }}>
                <button type="button" className="btn-secondary btn-sm" onClick={() => handleEdit(monthlyBudget)}>Edit Monthly</button>
                <button type="button" className="btn-secondary btn-sm" onClick={() => handleDelete(monthlyBudget.id)}>Delete Monthly</button>
            </span>
        )}
    </div>
    
    </main>
    </div>
    )
    
}