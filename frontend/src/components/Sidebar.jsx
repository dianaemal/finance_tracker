import React from "react";
import "./Sidebar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios"
export default function Sidebar(){

    const navigate = useNavigate()
    const location = useLocation()
    const [showModal, setShowModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const handleClick = async ()=>{
        setLogoutLoading(true);
        setLogoutError("");
        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                await api.post("/auth/logout", { refresh_token: refreshToken });
            }
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
        } catch {
            setLogoutError("Could not log out. Please try again.");
        } finally {
            setLogoutLoading(false);
        }
    }

    const isActive = (path) => location.pathname === path;
    
    return(
        <div className="sidebar">
            <div className="logo">💸 FinTrack</div>
            <div className={`nav-item ${isActive("/dashboard") ? "active" : ""}`} onClick={()=> navigate("/dashboard")}>Dashboard</div>
            <div className={`nav-item ${isActive("/account") ? "active" : ""}`} onClick={()=> navigate("/account")}>Accounts</div>
            <div className={`nav-item ${isActive("/budget") ? "active" : ""}`} onClick={()=> navigate("/budget")}>Budgets</div>
            <div className={`nav-item ${isActive("/transaction") ? "active" : ""}`} onClick={()=> navigate("/transaction")}>Transactions</div>
            <div className={`nav-item ${isActive("/user-settings") ? "active" : ""}`} onClick={()=> navigate("/user-settings")}>Settings</div>
           
            <div className="nav-item nav-item--logout" onClick={()=> setShowModal(true)}>
                Logout
            </div>
             {/* 🔥 Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h4>Are you sure you want to logout?</h4>
                    {logoutError && <p className="error-message">{logoutError}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={handleClick} disabled={logoutLoading}>
                            {logoutLoading ? "Logging out..." : "Logout"}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={logoutLoading}>Cancel</button>
                    </div>

                </div>
                </div>)}
        </div>


           

        
    )
}
