import { useOutletContext } from 'react-router-dom'
import { FiArrowDownLeft, FiArrowUpRight, FiFileText } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Requests from './Requests'
import { useRealtimeList } from '../hooks/useRealtimeData'

const money=value=>Number(value||0).toLocaleString('en-PK')
function CustomerTransactions(){
  const {userId,profile}=useOutletContext();const customerId=profile?.customerId||userId;const {data,loading}=useRealtimeList('transactions','customerId',customerId);const {data:sent}=useRealtimeList('transfers','senderId',customerId);const {data:received}=useRealtimeList('transfers','recipientId',customerId);const transfers=[...sent,...received.filter(item=>!sent.some(outgoing=>outgoing.id===item.id))].map(item=>({...item,type:item.senderId===customerId?'money sent':'money received',incoming:item.recipientId===customerId}));const items=[...data,...transfers].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))
  return <><div className="welcome"><div><p>Account activity</p><h1>Transaction History</h1></div><Button variant="secondary" onClick={()=>window.print()}><FiFileText/> Print statement</Button></div><section className="panel transaction-page"><div className="panel-heading"><div><h2>Complete account history</h2><p>Deposits, withdrawals, transfers, donations and zakat requests</p></div></div>{loading?<div className="approval-empty">Loading transactions...</div>:items.length===0?<div className="approval-empty">No transaction history is available.</div>:items.map(item=>{const incoming=item.incoming??item.type==='deposit';const settled=['approved','completed'].includes(item.status);return <div className="transaction" key={item.id}><i className={`transaction-icon ${incoming?'green':'blue'}`}>{incoming?<FiArrowDownLeft/>:<FiArrowUpRight/>}</i><span><strong>{item.type}</strong><small>{item.createdAt?new Date(item.createdAt).toLocaleString('en-GB'):'—'} · {item.status}</small></span><span className={`status-badge status-${settled?'success':item.status==='rejected'?'danger':'warning'}`}>{item.status}</span><b className={incoming?'positive':''}>{incoming?'+':'−'} PKR {money(item.amount)}</b></div>})}</section></>
}
export default function Items(){const {role}=useOutletContext();return role==='customer'?<CustomerTransactions/>:<Requests/>}
