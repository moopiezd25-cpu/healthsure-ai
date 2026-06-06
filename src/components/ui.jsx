import './ui.css'

export function Card({ children, className = '', highlight }) {
  return (
    <div className={`card ${highlight ? 'card--highlight' : ''} ${className}`.trim()}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', full, onClick, disabled, type = 'button' }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${full ? 'btn--full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function Tag({ children }) {
  return <span className="tag">{children}</span>
}

export function SectionTitle({ icon, title, desc }) {
  return (
    <div className="section-title">
      {icon && <span className="section-title__icon">{icon}</span>}
      <div>
        <h3>{title}</h3>
        {desc && <p>{desc}</p>}
      </div>
    </div>
  )
}
