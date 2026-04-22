import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Budget from './pages/Budget';
import Register from "./pages/Register";
import LogIn from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Account';
import Transaction from './pages/Transaction';
import Settings from './pages/Settings';
export default function App (){
  return (
 
      <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/budget" element={<Budget/>}/>
          <Route path="/account" element={<Accounts/>}/>
          <Route path="/transaction" element={<Transaction/>}/>
           <Route path="/user-settings" element={<Settings/>}/>

          
      </Routes>
    
  )
};

