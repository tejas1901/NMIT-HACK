export default function TrackingOverlay() {
  return (
    <svg
      className="tracking-overlay"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main route path */}
      <path
        className="tracking-path"
        d="M 800 200 C 900 250 950 300 1000 400 C 1050 500 1100 580 1200 620 C 1300 660 1380 650 1440 640"
      />
      {/* Secondary route */}
      <path
        className="tracking-path"
        d="M 750 180 C 820 220 870 280 920 350 C 970 420 1020 500 1100 540 C 1180 580 1300 590 1440 570"
        style={{ opacity: 0.3, animationDelay: '0.5s' }}
      />
      {/* Glow layer */}
      <path
        className="tracking-glow"
        d="M 800 200 C 900 250 950 300 1000 400 C 1050 500 1100 580 1200 620 C 1300 660 1380 650 1440 640"
      />
      {/* Route node markers */}
      <circle cx="800" cy="200" r="5" fill="none" stroke="#2d9b8a" strokeWidth="1.5" opacity="0.6" />
      <circle cx="800" cy="200" r="9" fill="none" stroke="#2d9b8a" strokeWidth="0.8" opacity="0.3" />
      <circle cx="1000" cy="400" r="4" fill="#2d9b8a" opacity="0.5" />
      <circle cx="1200" cy="620" r="5" fill="none" stroke="#3dbfa8" strokeWidth="1.5" opacity="0.7" />
      <circle cx="1200" cy="620" r="10" fill="none" stroke="#3dbfa8" strokeWidth="0.8" opacity="0.3" />

      {/* Moving dot along route */}
      <circle r="4" fill="#3dbfa8" opacity="0.85">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M 800 200 C 900 250 950 300 1000 400 C 1050 500 1100 580 1200 620 C 1300 660 1380 650 1440 640"
        />
      </circle>
    </svg>
  )
}
