import { NavLink } from 'react-router-dom'
import { FiArrowUpRight, FiLogOut, FiSettings, FiX } from 'react-icons/fi'
import BrandLogo from '../ui/BrandLogo'

export default function Sidebar({ open, role, links, onClose, onLogout }) {
  const portal = role === 'manager' ? 'Executive' : role === 'employee' ? 'Operations' : 'Personal'
  return <aside className={`workspace-rail ${open?'open':''}`}>
    <header className="rail-brand"><BrandLogo/><span><strong>VELTRIX</strong><small>FINANCE / 2026</small></span><button onClick={onClose} aria-label="Close navigation"><FiX/></button></header>
    <div className="rail-portal"><span>{portal.toUpperCase()} SPACE</span><strong>{role === 'manager' ? 'Control room' : role === 'employee' ? 'Service desk' : 'My banking'}</strong><FiArrowUpRight/></div>
    <nav className="rail-navigation" aria-label="Primary navigation"><p>NAVIGATION</p>{links.map(({to,label,icon:Icon},index)=><NavLink key={label} to={to} end={to==='/customer'||to==='/staff'} onClick={onClose}><span>0{index+1}</span><i><Icon/></i><b>{label}</b></NavLink>)}</nav>
    <div className="rail-footer"><NavLink to={role==='customer'?'/customer/settings':'/staff/settings'} onClick={onClose}><i><FiSettings/></i><b>Settings</b></NavLink><button onClick={onLogout}><i><FiLogOut/></i><b>Sign out</b></button></div>
  </aside>
}
