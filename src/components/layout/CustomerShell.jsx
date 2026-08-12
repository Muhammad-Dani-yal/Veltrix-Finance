import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { FiBell, FiCheck, FiLogOut, FiSettings, FiX } from 'react-icons/fi'
import BrandLogo from '../ui/BrandLogo'
import { useRealtimeList } from '../../hooks/useRealtimeData'

export default function CustomerShell({ name, userId, profile, links, onLogout }) {
  const [noticesOpen, setNoticesOpen] = useState(false)
  const customerId = profile?.customerId || userId
  const { data: loans } = useRealtimeList('loans', 'customerId', customerId)
  const { data: transactions } = useRealtimeList('transactions', 'customerId', customerId)
  const notices = useMemo(() => [...loans.map(item => ({...item, label: 'Loan request', detail: `PKR ${Number(item.amount || 0).toLocaleString()} · ${item.status}`})), ...transactions.map(item => ({...item, label: `${item.type || 'Finance'} request`, detail: `PKR ${Number(item.amount || 0).toLocaleString()} · ${item.status}`}))].sort((a,b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)).slice(0, 8), [loans, transactions])
  const mainLinks = links.slice(0, 5)

  return <div className="customer-app">
    <header className="customer-app-header">
      <NavLink className="customer-app-brand" to="/customer" aria-label="Veltrix home"><BrandLogo/><span><strong>VELTRIX</strong><small>PERSONAL BANKING</small></span></NavLink>
      <nav className="customer-web-nav" aria-label="Customer navigation">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==='/customer'}><Icon/><span>{label}</span></NavLink>)}</nav>
      <div className="customer-head-actions">
        <div className="notification-center"><button className="customer-icon-button" aria-label="Notifications" aria-expanded={noticesOpen} onClick={() => setNoticesOpen(!noticesOpen)}><FiBell/>{notices.length>0&&<i/>}</button>{noticesOpen&&<><button className="notification-away" aria-label="Close notifications" onClick={()=>setNoticesOpen(false)}/><aside className="notification-popover customer-notices"><header><div><span>MY ACTIVITY</span><h3>Notifications</h3></div><button onClick={()=>setNoticesOpen(false)} aria-label="Close"><FiX/></button></header><div className="notification-list">{notices.length===0?<div className="notification-empty"><FiCheck/><strong>All caught up</strong><small>No banking updates yet.</small></div>:notices.map((item,index)=><article key={`${item.id}-${index}`}><i className={`notification-status ${item.status||'pending'}`}/><span><strong>{item.label}</strong><small>{item.detail}</small><time>{item.updatedAt||item.createdAt?new Date(item.updatedAt||item.createdAt).toLocaleDateString('en-GB'):'Now'}</time></span></article>)}</div></aside></>}</div>
        <NavLink className="customer-profile" to="/customer/settings"><span>{name.slice(0,2).toUpperCase()}</span><div><b>{name}</b><small>My profile</small></div></NavLink>
        <button className="customer-logout" onClick={onLogout} aria-label="Sign out"><FiLogOut/></button>
      </div>
    </header>
    <main className="customer-app-main"><Outlet context={{role:'customer',name,userId,email:profile?.email,profile}}/></main>
    <nav className="customer-bottom-nav" aria-label="Mobile navigation">{mainLinks.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==='/customer'}><Icon/><span>{label.replace('My banking','Home').replace('Transactions','Activity').replace('Requests & loans','Requests')}</span></NavLink>)}<NavLink to="/customer/settings"><FiSettings/><span>Profile</span></NavLink></nav>
  </div>
}
