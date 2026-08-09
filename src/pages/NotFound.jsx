import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return <main className="not-found"><span>404</span><h1>Page not found</h1><p>The page you’re looking for doesn’t exist or has moved.</p><Link to="/"><Button>Back to dashboard</Button></Link></main>
}
