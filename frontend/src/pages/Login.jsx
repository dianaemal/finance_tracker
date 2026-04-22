import api from "../api/axios"
import react, { useContext } from 'react';
import { useState } from "react";
import {useNavigate,  Link } from "react-router-dom";


export default function LogIn(){
    const navigate = useNavigate()


    const LogInData = Object.freeze({
        email: "",
        password: ""
    })

    const [loginData, setData] = useState(LogInData);
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setData((prev)=>({
            ...prev,
            [name]: value.trim(),
        }))
        // Clear error message when user starts typing
        if (message) {
            setMessage("");
        }
       
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setLoading(true)
        try{
            const res = await api.post("auth/login", {
                email: loginData.email,
                password: loginData.password
            })
            if (res.status === 200 ){
                // cookies are set automatically
                navigate("/dashboard");
            }
            
       
        } catch (err) {
            console.error(err);
            setLoading(false);
            // Handle different types of errors
            if (err.code === 'ERR_NETWORK') {
                setMessage("Network error: Please check your internet connection and try again.");
            } else if (err.code === 'ECONNABORTED') {
                setMessage("Request timed out: The server is taking too long to respond. Please try again later.");
            } else if (err.response && err.response.data) {
                console.log(err.response.data)
                const messages = Object.values(err.response.data).flat();
                setMessage(messages);
            } else if (err.message) {
                setMessage(`Login failed: ${err.message}`);
            } else {
                setMessage("An unexpected error occurred. Please try again.");
            }
        }
        
                 
    }
    if (loading) {
        return (
            <div className="page-loading ">
                <div className="loading-spinner"></div>
                <p>Logging in...</p>
                <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>
                    This may take a few moments
                </p>
            </div>
        );
    }

    
    return(
        <div className="auth-page background">
             
            <div className="auth-card login-card">
                <h3 className="auth-title login-header">LOGIN</h3>
                <form className="auth-form login-form"
                    onSubmit={handleSubmit}>
                    <div>
                       
                        <input 
                        id="email"
                        type="email"
                        name="email"
                        placeholder="email"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                        className="login-input"
                    ></input>
                </div>
                <div style={{position: "relative"}}>
                    
                    <input 
                    id="password"
                    type="password"
                    placeholder="password"
                    name="password"
                    minLength={8}
                    onChange={handleChange}
                    value={loginData.password}
                    required
                    className="login-input"
                    ></input>
                    
                </div>
          
                    {message && <div className="error-message">{message}</div>}
                    <button className="login-btn" type="submit">LOGIN</button>
                  
                    <div className="text">Don't have an account? <Link to="/register">Sign Up</Link></div>
                </form>
            </div> 
         
        </div>
    )
}