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

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setData((prev)=>({
            ...prev,
            [name]: value.trim(),
        }))
        // Clear error message when user starts typing
       
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            await api.post("auth/login", {
                email: loginData.email,
                password: loginData.password
            })
        // 🍪 cookies are set automatically
        navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
                 
    }

    
    return(
        <div className="background">
             
            <div className="login-card">
                <h3 className="login-header">LOGIN</h3>
                <form className="login-form"
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
                    <Link className="text" to="/password-forget">Forgot password?</Link>
                    
                    <button className="login-btn" type="submit">LOGIN</button>
                  
                    <div className="text">Don't have an account? <Link to="/register">Sign Up</Link></div>
                </form>
            </div> 
         
        </div>
    )
}