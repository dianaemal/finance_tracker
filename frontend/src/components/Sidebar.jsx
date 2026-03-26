import React, { useState } from "react";
import "./Sidebar.css";
import {useNavigate,  Link } from "react-router-dom";
export default function Sidebar(){

    const navigate = useNavigate()
    
    return(
        <div className="sidebar">
            <div className="logo">💸 FinTrack</div>
            <div className="nav-item active" >Dashboard</div>
            <div className="nav-item" >Accounts</div>
            <div className="nav-item" onClick={()=> navigate("/budget")}>Budgets</div>
            <div className="nav-item" >Transactions</div>
            <div className="nav-item" >Settings</div>
           
            <div className="nav-item" style={{color:"#ef4444", marginTop:"auto"}} onClick={()=> navigate("/login")}>
                Logout
            </div>
           

        </div>
    )
}