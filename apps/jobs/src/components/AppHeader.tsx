import { Crosshair, LayoutDashboard } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-brand">
          <Crosshair className="brand-icon" size={32} />
          <h1 className="brand-title">Remote Job Hunter</h1>
        </Link>
        
        <nav className="header-nav">
          <Link 
            to="/sync" 
            className="nav-link"
            activeProps={{ className: 'nav-link active' }}
          >
            <LayoutDashboard size={18} />
            <span>Sync Dashboard</span>
          </Link>
        </nav>
      </div>

      <style>{`
        .app-header {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-bottom: 2px solid #475569;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .brand-icon {
          color: #10b981;
          filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
        }

        .brand-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          color: white;
          letter-spacing: -0.01em;
        }

        .header-nav {
          display: flex;
          gap: 1rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-link.active {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0.875rem 1rem;
          }

          .brand-title {
            font-size: 1.25rem;
          }

          .brand-icon {
            width: 28px;
            height: 28px;
          }
          
          .nav-link span {
            display: none;
          }
        }
      `}</style>
    </header>
  )
}
