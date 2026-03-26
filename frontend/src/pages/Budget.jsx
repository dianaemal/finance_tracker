import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import {useNavigate,  Link } from "react-router-dom";
export default function Budget(){
    const navigate = useNavigate()

    return(
        <div style={{display:"flex"}}>
            <Sidebar/>
        
        <div class="card">
           
      <h4>Create Budget</h4>
      <form>
      <div class="form-group"><input placeholder="Category (e.g. Food)"/></div>
      <div class="form-group"><input placeholder="Limit ($)"/></div>
      <button class="btn">Create</button>
      </form>
    </div>
    </div>
    )
    
}