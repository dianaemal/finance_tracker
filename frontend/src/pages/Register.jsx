import api from "../api/axios"
import { useState } from "react";
import {useNavigate } from "react-router-dom";

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

    const handleChange = (e)=>{
        const {name, value} = e.target;
        setData((prev)=>({
            ...prev,
            [name]: value.trim()
        }

        ))
    }
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (signupData.password !== signupData.re_password){
            return
        }
        try{
            await api.post("/auth/register", {
                email: signupData.email,
                username: signupData.username,
                password: signupData.password,
            });
            alert("Registered successfully!");
            navigate("/"); // go to login
        }catch(err){
            console.error(err);
            alert("Registration failed");
        }

    }


    return(
        <div>
            <h3>Sign Up</h3>
            <form onSubmit={handleSubmit} >
                <input
                    placeholder="email"
                    type="email"
                    name="email"
                    value={signupData.email}
                    required
                    onChange= {handleChange}
                
                />
                <input
                    placeholder="Username"
                    type="text"
                    name="username"
                    value={signupData.username}
                    required
                    onChange= {handleChange}
                
                />
                <input
                    placeholder="password"
                    type="password"
                    name="password"
                    value={signupData.password}
                    required
                    onChange= {handleChange}
                
                />
        
                <input
                    placeholder="re-type password"
                    type="password"
                    name="re_password"
                    value={signupData.re_password}
                    required
                    onChange= {handleChange}
                
                />

                 <button className="login-btn" type="submit">Sign Up</button>
        
        
            </form>

        </div>
    )
}