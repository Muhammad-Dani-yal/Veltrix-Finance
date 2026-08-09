export default function Panel({ as: Tag='section', className='', children, ...props }) { return <Tag className={`panel ${className}`} {...props}>{children}</Tag> }
export function PanelHeader({ title, description, action }) { return <div className="panel-heading"><div><h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</div> }
