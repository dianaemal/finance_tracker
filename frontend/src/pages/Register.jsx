import api from "../api/axios"
import { useState } from "react";
import {useNavigate, Link } from "react-router-dom";

export default function Register(){
    const navigate = useNavigate()
    // use Object.freez to make the object immutable
    const SignUpData = Object.freeze({
        email: "",
        username: "",
        password: "",
        re_password: ""
    })
    const [signupData, setData] = useState(SignUpData)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})

    const handleChange = (e)=>{
        const {name, value} = e.target;
        setData((prev)=>({
            ...prev,
            [name]: value.trim()
        }

        ))
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (errorMessage) setErrorMessage("");
        if (successMessage) setSuccessMessage("");
    }
    const handleSubmit = async (e)=>{
        e.preventDefault();
        const nextErrors = {};
        if (!signupData.email) nextErrors.email = "Email is required.";
        if (!signupData.username) nextErrors.username = "Username is required.";
        if (!signupData.password) nextErrors.password = "Password is required.";
        if (!signupData.re_password) nextErrors.re_password = "Please re-type your password.";
        if (signupData.password !== signupData.re_password){
            nextErrors.re_password = "Passwords do not match.";
        }
        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return
        }
        setLoading(true);
        setErrorMessage("");
        try{
            await api.post("/auth/register", {
                email: signupData.email,
                username: signupData.username,
                password: signupData.password,
            });
            setSuccessMessage("Registered successfully! Redirecting to login...");
            navigate("/login"); // go to login
        }catch(err){
            console.error(err);
            if (err.response && err.response.data) {
                const messages = Object.values(err.response.data).flat().join(" ");
                setErrorMessage(messages || "Registration failed.");
            } else {
                setErrorMessage("Registration failed.");
            }
        } finally {
            setLoading(false);
        }

    }


    return(
        <div className="auth-page">
            <div className="auth-card">
            <h3 className="auth-title">SIGN UP</h3>
            <form className="auth-form" onSubmit={handleSubmit} >
                <input
                    className="login-input"
                    placeholder="email"
                    type="email"
                    name="email"
                    value={signupData.email}
                    required
                    onChange= {handleChange}
                
                />
                {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                <input
                    className="login-input"
                    placeholder="Username"
                    type="text"
                    name="username"
                    value={signupData.username}
                    required
                    onChange= {handleChange}
                
                />
                {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
                <input
                    className="login-input"
                    placeholder="password"
                    type="password"
                    name="password"
                    value={signupData.password}
                    required
                    onChange= {handleChange}
                
                />
                {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        
                <input
                    className="login-input"
                    placeholder="re-type password"
                    type="password"
                    name="re_password"
                    value={signupData.re_password}
                    required
                    onChange= {handleChange}
                
                />
                {fieldErrors.re_password && <p className="field-error">{fieldErrors.re_password}</p>}

                 {errorMessage && <div className="error-message">{errorMessage}</div>}
                 {successMessage && <div className="success-message">{successMessage}</div>}

                 <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                 </button>
                  <div className="text">Already have an account? <Link to="/login">Login</Link></div>
        
        
            </form>
            </div>

        </div>
    )
}