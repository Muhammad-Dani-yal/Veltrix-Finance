export default function BrandLogo({ className = '' }) {
  const light=className.includes('light')
  const style={width:38,height:38,flex:'0 0 38px',display:'grid',placeItems:'center',borderRadius:11,background:light?'white':'linear-gradient(145deg,#1e40af,#111827)',color:light?'#1e40af':'white',boxShadow:'0 6px 16px #11182733'}
  return <span className={`brand-logo ${className}`} style={style} aria-hidden="true"><svg style={{width:30,height:30}} viewBox="0 0 44 44" fill="none"><path d="M9 11.5 20.2 33c.75 1.45 2.85 1.45 3.6 0L35 11.5h-7.1L22 23.7l-3-6.1h4.9l3-6.1H9Z" fill="currentColor"/><path d="M27.7 28.2h7.1l-3.55 6.2-3.55-6.2Z" fill="#94A3B8"/></svg></span>
}
