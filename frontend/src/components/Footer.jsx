import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand"><span className="brand-mark"><Wrench size={18} strokeWidth={2.5} /></span> NearFix</Link>
            <p>Smart local services marketplace. Providers are ranked by a weighted DSA matching engine: HashMap, Max-Heap, Merge Sort and Dijkstra.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/search">Find services</Link></li>
              <li><Link to="/emergency">Emergency help</Link></li>
              <li><Link to="/dsa">DSA lab</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/register">Create account</Link></li>
              <li><Link to="/login">Log in</Link></li>
              <li><a href="/admin/">Django Admin</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NearFix · Rayat Bahra University DSA Project</span>
          <span>Payments are simulated (mock) · Distances use a demo graph</span>
        </div>
      </div>
    </footer>
  )
}
