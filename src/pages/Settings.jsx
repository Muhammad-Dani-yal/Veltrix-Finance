import { useEffect, useState } from 'react'
import { FiBell, FiLock, FiSave, FiShield, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import Panel, { PanelHeader } from '../components/ui/Panel'

export default function Settings(){
  const {profile,updateDisplayName}=useAuth();const [name,setName]=useState(profile?.name||'');const [alerts,setAlerts]=useState(true);const [saving,setSaving]=useState(false)
  useEffect(()=>setName(profile?.name||''),[profile?.name])
  const save=async e=>{e.preventDefault();setSaving(true);try{await updateDisplayName(name);toast.success('Display name updated successfully.')}catch(error){toast.error(error.message||'Display name could not be updated.')}finally{setSaving(false)}}
  return <><PageHeader eyebrow="Personal preferences" title="Settings"/><div className="settings-layout"><Panel as="form" className="settings-panel" onSubmit={save}><PanelHeader title="Profile information" description="Manage how your identity appears across Veltrix Finance."/><div className="settings-body"><label><span><FiUser/> Display name</span><input value={name} minLength="2" onChange={e=>setName(e.target.value)} required/></label><label><span>Email address</span><input value={profile?.email||''} disabled/></label><Button disabled={saving||name.trim()===profile?.name}><FiSave/> {saving?'Saving…':'Save changes'}</Button></div></Panel><Panel className="settings-panel"><PanelHeader title="Security & notifications" description="Control account protection and important alerts."/><div className="settings-body"><label className="preference-row"><span><i><FiBell/></i><b>Financial alerts<small>Receive updates for requests and account activity.</small></b></span><input type="checkbox" checked={alerts} onChange={e=>setAlerts(e.target.checked)}/></label><div className="security-row"><i><FiShield/></i><span><strong>Role-protected access</strong><small>Your permissions are secured by your verified profile.</small></span></div><div className="security-row"><i><FiLock/></i><span><strong>Secure account authentication</strong><small>Email and password authentication is active.</small></span></div></div></Panel></div></>
}
