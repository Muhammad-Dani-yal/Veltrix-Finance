import { FiCreditCard, FiLock, FiShield } from 'react-icons/fi'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import { useRealtimeRecord } from '../hooks/useRealtimeData'

export default function Cards(){
  const navigate=useNavigate();const {userId,profile}=useOutletContext();const customerId=profile?.customerId||userId;const {data:account,loading,error}=useRealtimeRecord(`customers/${customerId}`)
  const ending=String(account?.accountNumber||'0000').replace(/\D/g,'').slice(-4).padStart(4,'0')
  return <><PageHeader eyebrow="Customer banking" title="Cards"/><section className="cards-workspace"><article className="customer-bank-card"><span>VELTRIX DEBIT</span><FiCreditCard/><strong>•••• •••• •••• {ending}</strong><small>{loading?'Loading issued card…':error?'Card details unavailable':account?.status==='active'?'Linked to your active verified account.':'Card access is unavailable for this account.'}</small></article><aside className="panel card-controls"><div className="panel-heading"><div><h2>Card controls</h2><p>Secure assistance for your issued bank card</p></div></div><div className="settings-body"><div className="security-row"><i><FiLock/></i><span><strong>Report or temporarily block card</strong><small>Submit a verified support request for staff processing.</small></span></div><div className="security-row"><i><FiShield/></i><span><strong>Card requests require verification</strong><small>No card action directly changes your account balance.</small></span></div><Button onClick={()=>navigate('/customer/support')}>Request card assistance</Button></div></aside></section></>
}
