export default function FloatingInfoCard({ className, icon, title, subtitle, onClick }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      className={`floating-card ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title={`Click to view detailed intelligence on ${title}`}
    >
      <div className="card-icon-wrap">
        {icon}
      </div>
      <div className="card-text-wrap">
        <div className="card-title">{title}</div>
        <div className="card-sub">{subtitle}</div>
      </div>
      <span className="card-click-hint">Inspect &rarr;</span>
    </div>
  )
}
