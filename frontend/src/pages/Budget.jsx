import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import {useNavigate,  Link } from "react-router-dom";
export default function Budget(){
    const navigate = useNavigate()
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
    const budgetObject = Object.freeze({
        category_id: null,
        month: viewMonth,
        year: 2026,
        amount: null
    })
    const [budget, setBudget] = useState(budgetObject)
   
 

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
        })
    }
    // fetch only when month and year change
    useEffect(()=>{
        fetchBudget(viewMonth, viewYear)
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
            }
            fetchBudget(viewMonth, viewYear)
        }catch (error) {
            console.error("Error creating work experience:", error);

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
    }
        
        

    }

    const past =  viewYear < currentYear ||
                        (viewYear === currentYear && viewMonth < currentMonth);

    

    return(
        
        <div style={{display:"flex"}}>
            <Sidebar/>
        
        <div class="card">
           
      <h4>Create Budget</h4>
      <form onSubmit={handleSubmit}>
      <div class="form-group">
        <select name="category_id" value={budget.category_id || ""} onChange={handleChange}>
            <option value="">Select category</option>
            {categories.map((cat)=>(
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>

        <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{ marginTop: "0.5rem", color: "#22c55e", background: "none", border: "none", cursor: "pointer" }}
        >
        + Add new category
        </button>

      </div>
      <div class="form-group" ><input type="number" onChange={handleChange}
       placeholder="Limit ($)" name="amount" step="0.01" value={budget.amount || ""}/></div>
       <div class="form-group">
            <select  name="month" id="s_month" value={budget.month || ""}  onChange={handleChange}>
                <option value="">Select a month</option>
                {months.map((month, index)=>{
                    const monthNumber = index + 1
                    const isPast =
                         budget.year < currentYear ||
                        (budget.year === currentYear && monthNumber < currentMonth);

               return <option key={index } value={index + 1} disabled={isPast}>{month}</option>
        }   )}
            </select>
       </div>
      <button class="btn">Create</button>
      </form>
      
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={() => changeMonth("prev")}>◀</button>
            <span>{months[viewMonth - 1]} {viewYear}</span>
            <button onClick={() => changeMonth("next")}>▶</button>
        </div>
        {budgetList.length > 0 ? (
            <table>
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Amount</th>
                </tr>
                </thead>
                <tbody>
                {budgetList.map((b) => (
                    <tr key={b.id}>
                    <td>{b.category.name || b.category?.name}</td>
                    <td>${b.amount}</td>
                    {!past && 
                        <>
                         <td>edit</td>
                         <td>delete</td>
                         </>
                    }
                    <td></td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            viewMonth && <p>No budgets found</p>
            )}
    </div>
    {showModal && (
      <div className="modal-overlay" onClick={(e) => e.stopPropagation()} >
        <div className="modal" >
          <h4>Add Category</h4>

          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            autoFocus
          />

          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <button onClick={handleAddCategory}>Add</button>
            <button onClick={() => setShowModal(false) }>Cancel</button>
          </div>
        </div>
      </div>
    )}
    </div>
    )
    
}