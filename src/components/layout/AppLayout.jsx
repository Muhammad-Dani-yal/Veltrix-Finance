import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MANAGER_EMAIL, useAuth } from '../../context/AuthContext'
import { roleNavigation } from '../../config/navigation'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import CustomerShell from './CustomerShell'

export default function AppLayout() {
  const { user, profile, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const role = user.email?.toLowerCase() === MANAGER_EMAIL ? 'manager' : (profile?.role || 'customer')
  const links = roleNavigation[role]
  const name = profile?.name || user.displayName || user.email?.split('@')[0] || 'Muhammad Ali'

  if (role === 'customer') return <CustomerShell name={name} userId={user.uid} profile={{...profile,email:user.email}} links={links} onLogout={logout}/>

  return (
    <div className="layout creative-shell">
      <div className="shell-accent" aria-hidden="true"><span>V</span></div>
      <Topbar role={role} name={name} userId={user.uid} profile={profile} onMenuOpen={() => setOpen(true)} />
      <Sidebar open={open} role={role} links={links} onClose={() => setOpen(false)} onLogout={logout} />
      {open && <button className="overlay" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <main className="main-content"><Outlet context={{ role, name, userId: user.uid, email: user.email, profile }} /></main>
    </div>
  )
}
