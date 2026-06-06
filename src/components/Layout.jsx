import { useApp } from '../context/AppContext'
import './Layout.css'

const STEPS = [
  { id: 'home', label: '首页' },
  { id: 'health', label: '问答' },
  { id: 'analysis', label: '分析' },
  { id: 'advice', label: '建议' },
  { id: 'products', label: '产品' },
]

export function Layout({ children, title, subtitle, showBack, showProgress, hideHeader }) {
  const { page, setPage } = useApp()
  const stepIndex = STEPS.findIndex((s) => s.id === page)

  return (
    <div className="app-shell">
      <div className="phone-frame">
        {!hideHeader && (
          <header className="app-header">
            {showBack && (
              <button
                type="button"
                className="header-back"
                onClick={() => {
                  const prev = STEPS[Math.max(0, stepIndex - 1)]
                  setPage(prev.id)
                }}
                aria-label="返回"
              >
                ‹
              </button>
            )}
            <div className="header-text">
              <p className="header-brand">HealthSure AI</p>
              <h1 className="header-title">{title}</h1>
              {subtitle && <p className="header-sub">{subtitle}</p>}
            </div>
          </header>
        )}

        {showProgress && stepIndex > 0 && (
          <div className="progress-bar" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={5}>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <span className="progress-label">
              步骤 {stepIndex + 1} / {STEPS.length}
            </span>
          </div>
        )}

        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
