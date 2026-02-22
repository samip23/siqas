/**
 * Inline SVG illustrations — no external dependencies.
 * All sized with viewBox so they scale freely.
 */

/** Shield with checkmark — the QA app logotype mark */
export function QAShieldMark({ size = 32, color = '#FFFFFF', accentColor = '#0EA5E9' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 2L4 7.5v10.3c0 9.5 6.1 18.4 14 20.7C25.9 36.2 32 27.3 32 17.8V7.5L18 2z"
        fill={accentColor}
        opacity="0.25"
      />
      <path
        d="M18 4L6 9v8.8c0 8.5 5.5 16.5 12 18.6C24.5 34.3 30 26.3 30 17.8V9L18 4z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 20l3.5 3.5 7.5-8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Full upload-page hero: CSV → transform → dashboard */
export function UploadHeroIllustration() {
  return (
    <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 520, height: 'auto' }}>
      <defs>
        <linearGradient id="csvGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1A3A6B" stopOpacity="0.08" />
          <stop offset="1" stopColor="#0EA5E9" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="arrowGrad" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="chartGrad" x1="0" y1="1" x2="0" y2="0">
          <stop stopColor="#0EA5E9" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0EA5E9" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="bar2Grad" x1="0" y1="1" x2="0" y2="0">
          <stop stopColor="#059669" stopOpacity="0.2" />
          <stop offset="1" stopColor="#059669" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* ── CSV Document ── */}
      <g transform="translate(28, 50)">
        {/* Paper */}
        <rect x="0" y="0" width="110" height="140" rx="10" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Header bar */}
        <rect x="0" y="0" width="110" height="28" rx="10" fill="#1A3A6B" />
        <rect x="0" y="18" width="110" height="10" fill="#1A3A6B" />
        <text x="55" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Inter,sans-serif">CSV FILE</text>

        {/* Row lines */}
        {[40, 60, 80, 100, 120].map((y, i) => (
          <g key={y}>
            <rect x="12" y={y - 8} width={i === 0 ? 86 : 20 + Math.random() * 20} height="7" rx="3" fill={i === 0 ? '#CBD5E1' : '#E2E8F0'} />
            {i > 0 && <rect x="38" y={y - 8} width={25 + Math.random() * 15} height="7" rx="3" fill="#E2E8F0" />}
            {i > 0 && <rect x="72" y={y - 8} width={18} height="7" rx="3" fill={i % 2 === 0 ? '#D1FAE5' : '#FEE2E2'} />}
          </g>
        ))}
        {/* Highlighted row */}
        <rect x="8" y="52" width="94" height="16" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />

        {/* File extension tag */}
        <rect x="72" y="120" width="32" height="14" rx="4" fill="#0EA5E9" />
        <text x="88" y="130" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="Inter,sans-serif">.CSV</text>
      </g>

      {/* ── Animated Flow Arrow ── */}
      <g transform="translate(155, 120)">
        {/* Dots */}
        {[0, 20, 40, 60, 80].map((x, i) => (
          <circle key={x} cx={x} cy="20" r={3.5 - i * 0.2} fill="url(#arrowGrad)" opacity={0.4 + i * 0.12} />
        ))}
        {/* Arrow head */}
        <path d="M88 14 L104 20 L88 26" fill="none" stroke="url(#arrowGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Label */}
        <text x="52" y="44" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="Inter,sans-serif">Parse &amp; Validate</text>
      </g>

      {/* ── Dashboard Card ── */}
      <g transform="translate(278, 18)">
        {/* Card */}
        <rect x="0" y="0" width="200" height="240" rx="14" fill="white" stroke="#E2E8F0" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.08))' }} />

        {/* Card header */}
        <rect x="0" y="0" width="200" height="36" rx="14" fill="#F8FAFC" />
        <rect x="0" y="26" width="200" height="10" fill="#F8FAFC" />
        <circle cx="18" cy="18" r="6" fill="#0EA5E9" opacity="0.7" />
        <text x="32" y="22" fill="#1A3A6B" fontSize="9" fontWeight="700" fontFamily="Inter,sans-serif">Feature Dashboard</text>

        {/* KPI chips */}
        {[
          { x: 14, label: '60', sub: 'Total', color: '#1A3A6B' },
          { x: 80, label: '47', sub: 'Done', color: '#059669' },
          { x: 146, label: '78%', sub: 'Rate', color: '#0EA5E9' },
        ].map(k => (
          <g key={k.x} transform={`translate(${k.x}, 44)`}>
            <rect width="52" height="36" rx="8" fill={k.color} fillOpacity="0.07" />
            <text x="26" y="17" textAnchor="middle" fill={k.color} fontSize="13" fontWeight="800" fontFamily="Inter,sans-serif">{k.label}</text>
            <text x="26" y="30" textAnchor="middle" fill={k.color} fontSize="7" fontFamily="Inter,sans-serif" opacity="0.7">{k.sub}</text>
          </g>
        ))}

        {/* Bar chart area */}
        <text x="14" y="102" fill="#94A3B8" fontSize="7.5" fontWeight="600" fontFamily="Inter,sans-serif">SPRINT COMPLETION</text>

        {/* Chart grid */}
        {[115, 130, 145, 160].map(y => (
          <line key={y} x1="14" y1={y} x2="186" y2={y} stroke="#F1F5F9" strokeWidth="1" />
        ))}

        {/* Bars */}
        {[
          { x: 22, h: 50, h2: 48, label: 'S1' },
          { x: 62, h: 44, h2: 38, label: 'S2' },
          { x: 102, h: 36, h2: 26, label: 'S3' },
          { x: 142, h: 20, h2: 8, label: 'S4' },
        ].map(b => (
          <g key={b.x}>
            <rect x={b.x} y={165 - b.h} width="16" height={b.h} rx="3" fill="url(#chartGrad)" />
            <rect x={b.x + 18} y={165 - b.h2} width="14" height={b.h2} rx="3" fill="url(#bar2Grad)" />
            <text x={b.x + 16} y="178" textAnchor="middle" fill="#94A3B8" fontSize="7" fontFamily="Inter,sans-serif">{b.label}</text>
          </g>
        ))}

        {/* Progress bar */}
        <text x="14" y="200" fill="#94A3B8" fontSize="7.5" fontWeight="600" fontFamily="Inter,sans-serif">COMPLETION RATE</text>
        <rect x="14" y="207" width="172" height="6" rx="3" fill="#F1F5F9" />
        <rect x="14" y="207" width="134" height="6" rx="3" fill="url(#arrowGrad)" />
        <text x="186" y="214" textAnchor="end" fill="#059669" fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif">78%</text>

        {/* Bottom tag */}
        <rect x="14" y="222" width="50" height="11" rx="4" fill="#D1FAE5" />
        <text x="39" y="230" textAnchor="middle" fill="#059669" fontSize="7" fontWeight="700" fontFamily="Inter,sans-serif">✓ On Track</text>
      </g>

      {/* ── Floating badges ── */}
      <g transform="translate(36, 20)">
        <rect width="72" height="22" rx="11" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
        <text x="36" y="15" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif">⚠ 2 Skipped rows</text>
      </g>
      <g transform="translate(156, 62)">
        <rect width="68" height="20" rx="10" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1" />
        <text x="34" y="14" textAnchor="middle" fill="#065F46" fontSize="8" fontWeight="700" fontFamily="Inter,sans-serif">✓ 60 Validated</text>
      </g>
    </svg>
  )
}

/** Empty dashboard illustration */
export function EmptyDashboardIllustration({ width = 260 }) {
  return (
    <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, height: 'auto' }}>
      <defs>
        <linearGradient id="emptyBg" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>
      {/* Background card */}
      <rect x="20" y="20" width="220" height="160" rx="14" fill="url(#emptyBg)" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="6 3" />

      {/* Placeholder bars */}
      {[50, 80, 110, 140].map((x, i) => (
        <g key={x}>
          <rect x={x} y={100 - [50, 70, 40, 60][i]} width="24" height={[50, 70, 40, 60][i]} rx="5"
            fill="#E2E8F0" opacity="0.7" />
          <rect x={x + 26} y={100 - [30, 50, 28, 42][i]} width="18" height={[30, 50, 28, 42][i]} rx="4"
            fill="#BFDBFE" opacity="0.6" />
        </g>
      ))}

      {/* Baseline */}
      <line x1="40" y1="100" x2="220" y2="100" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Magnifying glass */}
      <circle cx="130" cy="50" r="22" fill="white" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="130" cy="50" r="13" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="138" y1="60" x2="148" y2="72" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

      {/* Question mark */}
      <text x="130" y="55" textAnchor="middle" fill="#94A3B8" fontSize="13" fontWeight="700" fontFamily="Inter,sans-serif">?</text>

      {/* Label */}
      <text x="130" y="140" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">No data to display</text>
      <text x="130" y="156" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontFamily="Inter,sans-serif">Upload a CSV to get started</text>
    </svg>
  )
}

/** Drop zone inner illustration */
export function DropZoneIllustration() {
  return (
    <svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 180, height: 120 }}>
      <defs>
        <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="90" cy="112" rx="40" ry="5" fill="#CBD5E1" opacity="0.4" />

      {/* Document stack — back */}
      <rect x="62" y="22" width="66" height="82" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" transform="rotate(-6 62 22)" />
      <rect x="64" y="20" width="66" height="82" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" transform="rotate(-2 64 20)" />

      {/* Main document */}
      <rect x="56" y="16" width="68" height="85" rx="8" fill="url(#docGrad)" stroke="#93C5FD" strokeWidth="1.5" />

      {/* Dog-ear */}
      <path d="M108 16 L124 33 L108 33 Z" fill="#BFDBFE" />
      <path d="M108 16 L124 33" stroke="#93C5FD" strokeWidth="1" />

      {/* Row lines */}
      {[46, 57, 68, 79, 90].map((y, i) => (
        <rect key={y} x="66" y={y} width={i === 0 ? 48 : 28 + (i % 3) * 8} height="5" rx="2.5"
          fill={i === 0 ? '#BFDBFE' : '#DBEAFE'} opacity="0.9" />
      ))}

      {/* Upload arrow circle */}
      <circle cx="90" cy="56" r="18" fill="#1A3A6B" opacity="0.88" />
      <path d="M90 64 L90 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 56 L90 49 L96 56" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* .csv tag */}
      <rect x="92" y="90" width="30" height="13" rx="5" fill="#0EA5E9" />
      <text x="107" y="100" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="700" fontFamily="Inter,sans-serif">.CSV</text>
    </svg>
  )
}

/** Decorative dots grid pattern */
export function DotsPattern({ color = '#1A3A6B', opacity = 0.06, cols = 12, rows = 5, gap = 18 }) {
  const dots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={c * gap + 9} cy={r * gap + 9} r="1.5" fill={color} />)
    }
  }
  return (
    <svg
      viewBox={`0 0 ${cols * gap} ${rows * gap}`}
      style={{ position: 'absolute', top: 0, right: 0, opacity, pointerEvents: 'none' }}
      width={cols * gap}
      height={rows * gap}
    >
      {dots}
    </svg>
  )
}

/** Sprint speedometer / velocity indicator */
export function SprintVelocityIcon({ size = 40, pct = 75 }) {
  const angle = -180 + pct * 1.8  // -180 to 0 degrees
  const rad = (angle * Math.PI) / 180
  const r = 14
  const cx = 20, cy = 22
  const nx = cx + r * Math.cos(rad)
  const ny = cy + r * Math.sin(rad)
  const color = pct >= 75 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626'
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none">
      {/* Track arc */}
      <path d="M 6 22 A 14 14 0 0 1 34 22" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
      {/* Value arc */}
      <path d={`M 6 22 A 14 14 0 ${pct > 50 ? 1 : 0} 1 ${nx.toFixed(2)} ${ny.toFixed(2)}`}
        stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx.toFixed(2)} y2={ny.toFixed(2)} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="2.5" fill={color} />
    </svg>
  )
}
