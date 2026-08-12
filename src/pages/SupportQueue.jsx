import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FiCheck, FiHelpCircle, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import { useRealtimeList } from '../hooks/useRealtimeData'
import { decideSupportRequest } from '../services/bankRepository'

export default function SupportQueue(){
  const {role,userId}=useOutletContext();const {data,loading,error}=useRealtimeList('supportRequests');const [busy,setBusy]=useState(null)
  const requests=[...data].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))
  const decide=async(item,status)=>{setBusy(item.id);try{await decideSupportRequest(item.id,status,{uid:userId,role});toast.success(`Support request ${status}.`)}catch(reason){toast.error(reason.message)}finally{setBusy(null)}}
  return <><PageHeader eyebrow="Customer service" title="Support Requests"/><section className="panel approval-center">{error?<div className="approval-empty"><FiX/><h3>Support requests unavailable</h3><p>{error.message}</p></div>:loading?<div className="approval-empty">Loading support requests…</div>:requests.length===0?<div className="approval-empty"><FiCheck/><h3>All caught up</h3><p>No customer support requests are available.</p></div>:requests.map(item=><article className="financial-request" key={item.id}><i className="transaction-icon blue"><FiHelpCircle/></i><span><strong>{item.customer||'Customer'}</strong><small>{item.message} · {item.createdAt?new Date(item.createdAt).toLocaleString('en-GB'):'—'}</small></span><b>{item.status}</b><span className={`risk risk-${item.status==='pending'?'medium':item.status==='resolved'?'low':'high'}`}>{item.status}</span>{item.status==='pending'&&<div><Button variant="secondary" disabled={busy===item.id} onClick={()=>decide(item,'rejected')}><FiX/></Button><Button disabled={busy===item.id} onClick={()=>decide(item,'resolved')}><FiCheck/></Button></div>}</article>)}</section></>
}
