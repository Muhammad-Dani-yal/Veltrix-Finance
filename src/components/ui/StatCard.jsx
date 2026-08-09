import Panel from './Panel'
export default function StatCard({ icon:Icon,label,value,helper,tone='blue' }) { return <Panel as="article" className="metric premium-stat"><i className={`transaction-icon ${tone}`}><Icon/></i><span>{label}</span><strong>{value}</strong>{helper&&<small>{helper}</small>}</Panel> }
