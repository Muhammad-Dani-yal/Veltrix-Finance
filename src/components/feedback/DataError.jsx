import { FiAlertTriangle } from 'react-icons/fi'
export default function DataError({ error, title='Data unavailable' }) { if(!error)return null;return <div className="approval-empty data-error"><FiAlertTriangle/><h3>{title}</h3><p>{error.message||'Please check your connection and permissions, then try again.'}</p></div> }
