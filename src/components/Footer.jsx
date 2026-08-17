import { Link } from 'react-router-dom'
import './Footer.css'

const YEAR = 2026

export default function Footer() {
  return (
    <footer className="footer">
      <div className="layout footer__inner">
        <nav className="footer__links" aria-label="Footer">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <a href="https://github.com/virajgholap/recipebox" target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
        </nav>
        <p className="footer__note">Recipe Box · {YEAR}</p>
      </div>
    </footer>
  )
}
