import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, MANAGER_EMAIL, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Items from './pages/Items'
import Employees from './pages/Employees'
import Customers from './pages/Customers'
import Requests from './pages/Requests'
import Settings from './pages/Settings'
import Cards from './pages/Cards'
import Support from './pages/Support'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'
import AppToaster from './components/feedback/AppToaster'
import './App.css'
import './theme.css'

function resolvedRole(user, profile) { return user?.email?.toLowerCase() === MANAGER_EMAIL ? 'manager' : profile?.role }
function destination(role) { return role === 'customer' ? '/customer' : role === 'employee' || role === 'manager' ? '/staff' : '/' }
function PublicRoute({ children }) { const {user,profile,loading}=useAuth(); if(loading)return <div className="page-loader">Loading...</div>; return user&&profile?<Navigate to={destination(resolvedRole(user,profile))} replace/>:children }
function PortalRoute({portal,children}) { const {user,profile,loading,logout}=useAuth(); if(loading)return <div className="page-loader">Loading...</div>; if(!user)return <Navigate to="/" replace/>; if(!profile)return <main className="access-error"><h1>Profile unavailable</h1><p>This login has no authorized banking profile. Contact an administrator.</p><button onClick={logout}>Sign out</button></main>; const role=resolvedRole(user,profile); const allowed=portal==='customer'?role==='customer':role==='employee'||role==='manager'; return allowed?children:<Navigate to={destination(role)} replace/> }
function AppRoutes(){return <Routes><Route path="/" element={<PublicRoute><Login/></PublicRoute>}/><Route path="/login" element={<Navigate to="/" replace/>}/><Route path="/customer" element={<PortalRoute portal="customer"><AppLayout/></PortalRoute>}><Route index element={<Dashboard/>}/><Route path="transactions" element={<Items/>}/><Route path="requests" element={<Requests/>}/><Route path="loans" element={<Requests/>}/><Route path="cards" element={<Cards/>}/><Route path="support" element={<Support/>}/><Route path="settings" element={<Settings/>}/></Route><Route path="/staff" element={<PortalRoute portal="staff"><AppLayout/></PortalRoute>}><Route index element={<Dashboard/>}/><Route path="queue" element={<Items/>}/><Route path="customers" element={<Customers/>}/><Route path="requests" element={<Requests/>}/><Route path="employees" element={<Employees/>}/><Route path="reports" element={<Reports/>}/><Route path="settings" element={<Settings/>}/></Route><Route path="/dashboard/*" element={<Navigate to="/" replace/>}/><Route path="*" element={<NotFound/>}/></Routes>}
export default function App(){return <AuthProvider><AppRoutes/><AppToaster/></AuthProvider>}
