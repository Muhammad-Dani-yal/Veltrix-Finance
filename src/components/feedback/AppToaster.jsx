import { Toaster } from 'react-hot-toast'
const base={duration:2000,style:{marginTop:'18px',borderRadius:'12px',padding:'12px 16px',boxShadow:'0 16px 38px rgba(17,24,39,.18)',color:'#1f2937'}}
export default function AppToaster(){return <Toaster position="top-center" toastOptions={{...base,error:{duration:2000,style:{...base.style,border:'1px solid #fecaca',color:'#991b1b'}},success:{duration:2000,style:{...base.style,border:'1px solid #bbf7d0',color:'#166534'}}}}/>}
