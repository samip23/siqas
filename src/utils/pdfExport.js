import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

const C = {
  primary: [26, 58, 107],
  teal:    [14, 165, 233],
  green:   [5, 150, 105],
  amber:   [217, 119, 6],
  red:     [220, 38, 38],
  gray:    [84, 110, 138],
  light:   [241, 245, 250],
  white:   [255, 255, 255],
  dark:    [15, 25, 41],
}

function healthColor(rate) {
  return rate >= 75 ? C.green : rate >= 50 ? C.amber : C.red
}
function healthLabel(rate) {
  return rate >= 75 ? 'On Track' : rate >= 50 ? 'Needs Attention' : 'Behind Schedule'
}
function healthBg(rate) {
  if (rate >= 75) return [220, 253, 235]
  if (rate >= 50) return [254, 243, 199]
  return [254, 226, 226]
}

async function captureElement(id) {
  const el = document.getElementById(id)
  if (!el) return null
  const canvas = await html2canvas(el, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  })
  return { dataUrl: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height }
}

/**
 * Exports the full dashboard as a single-page A4 PDF.
 */
export async function exportDashboardToPDF(metrics, chartIds = []) {
  const timestamp = format(new Date(), 'MMM d, yyyy  h:mm a')
  const fileTs    = format(new Date(), 'yyyyMMdd_HHmmss')

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const PW = pdf.internal.pageSize.getWidth()   // 210
  const PH = pdf.internal.pageSize.getHeight()  // 297
  const M  = 10
  const CW = PW - M * 2  // 190

  let y = 0

  // ── Header ──────────────────────────────────────────────────────────────────
  pdf.setFillColor(...C.primary)
  pdf.rect(0, 0, PW, 18, 'F')
  pdf.setFillColor(...C.teal)
  pdf.rect(0, 15.5, PW, 2.5, 'F')

  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...C.white)
  pdf.text('QA Feature Progress Report', M, 10)

  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(180, 210, 240)
  pdf.text(`Generated: ${timestamp}  ·  SIQAS — Software QA Management`, M, 14.5)

  // Health badge (top-right)
  const rate    = metrics.completionRate
  const hColor  = healthColor(rate)
  const hLabel  = healthLabel(rate)
  pdf.setFillColor(...hColor)
  pdf.roundedRect(PW - M - 44, 4.5, 44, 9, 2, 2, 'F')
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...C.white)
  pdf.text(`● ${hLabel}`, PW - M - 22, 10.5, { align: 'center' })

  y = 22  // ── KPI Cards ───────────────────────────────────────────────────────────────
  const CARD_W = (CW - 9) / 4
  const CARD_H = 20

  const kpis = [
    { label: 'TOTAL FEATURES',  value: String(metrics.total),         color: C.primary },
    { label: 'COMPLETED',       value: String(metrics.completed),     color: C.green   },
    { label: 'IN PROGRESS',     value: String(metrics.inProgress),    color: C.teal    },
    { label: 'COMPLETION RATE', value: `${metrics.completionRate}%`,  color: hColor    },
  ]

  kpis.forEach((kpi, i) => {
    const cx = M + i * (CARD_W + 3)
    pdf.setFillColor(...C.light)
    pdf.roundedRect(cx, y, CARD_W, CARD_H, 2, 2, 'F')
    pdf.setFillColor(...kpi.color)
    pdf.roundedRect(cx, y, CARD_W, 2.5, 1, 1, 'F')
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...C.gray)
    pdf.text(kpi.label, cx + 3.5, y + 7)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...kpi.color)
    pdf.text(kpi.value, cx + 3.5, y + 16.5)
  })
  y += CARD_H + 5  // ── Sprint Health Table ─────────────────────────────────────────────────────
  if (metrics.featuresPerSprint.length > 0) {
    // Section label + rule
    pdf.setFontSize(7.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...C.primary)
    pdf.text('SPRINT HEALTH SCORECARD', M, y + 4)
    pdf.setDrawColor(...C.teal)
    pdf.setLineWidth(0.25)
    pdf.line(M + 56, y + 3.5, PW - M, y + 3.5)
    y += 7

    // Column definitions
    const cols = [
      { label: 'Sprint',    x: M,        w: 32 },
      { label: 'Total',     x: M + 32,   w: 18 },
      { label: 'Done',      x: M + 50,   w: 18 },
      { label: 'Remaining', x: M + 68,   w: 24 },
      { label: 'Progress',  x: M + 92,   w: 36 },
      { label: 'Status',    x: M + 128,  w: 52 },
    ]

    // Header row
    pdf.setFillColor(...C.primary)
    pdf.rect(M, y, CW, 6.5, 'F')
    pdf.setFontSize(6.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...C.white)
    cols.forEach(c => pdf.text(c.label, c.x + 1.5, y + 4.3))
    y += 6.5

    const maxRows = Math.min(metrics.featuresPerSprint.length, 8)
    for (let i = 0; i < maxRows; i++) {
      const row   = metrics.featuresPerSprint[i]
      const rRate = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0
      const rc    = healthColor(rRate)
      const rl    = healthLabel(rRate)
      const rbg   = healthBg(rRate)

      // Alternating row bg
      pdf.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 253 : 255)
      pdf.rect(M, y, CW, 6.5, 'F')

      // Cells
      pdf.setFontSize(7.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(...C.dark)
      pdf.text(row.sprint,                          cols[0].x + 1.5, y + 4.3)
      pdf.text(String(row.total),                   cols[1].x + 1.5, y + 4.3)
      pdf.text(String(row.completed),               cols[2].x + 1.5, y + 4.3)
      pdf.text(String(row.total - row.completed),   cols[3].x + 1.5, y + 4.3)

      // Mini progress bar
      const bx = cols[4].x + 1.5, bw = 20, by = y + 2, bh = 2.5
      pdf.setFillColor(220, 226, 234)
      pdf.roundedRect(bx, by, bw, bh, 1, 1, 'F')
      pdf.setFillColor(...rc)
      pdf.roundedRect(bx, by, Math.max(1.5, bw * rRate / 100), bh, 1, 1, 'F')
      pdf.setFontSize(6.5)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...rc)
      pdf.text(`${rRate}%`, bx + bw + 2, y + 4.3)

      // Status badge
      const sx = cols[5].x + 1.5
      pdf.setFillColor(...rbg)
      pdf.roundedRect(sx, y + 1.2, 32, 4, 1.5, 1.5, 'F')
      pdf.setFontSize(6)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...rc)
      pdf.text(rl, sx + 16, y + 4.0, { align: 'center' })

      y += 6.5
    }

    if (metrics.featuresPerSprint.length > maxRows) {
      pdf.setFontSize(6.5)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(...C.gray)
      pdf.text(`+ ${metrics.featuresPerSprint.length - maxRows} more sprints not shown`, M + 2, y + 3.5)
      y += 5
    }
    y += 4
  }

  // ── Charts (2 × 2 grid) ─────────────────────────────────────────────────────
  const validIds = chartIds.filter(Boolean)
  if (validIds.length > 0) {
    // Section label + rule
    pdf.setFontSize(7.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...C.primary)
    pdf.text('ANALYTICS', M, y + 4)
    pdf.setDrawColor(...C.teal)
    pdf.setLineWidth(0.25)
    pdf.line(M + 22, y + 3.5, PW - M, y + 3.5)
    y += 7

    const CHART_TITLES = {
      'chart-sprint':   'Features per Sprint',
      'chart-priority': 'Priority Distribution',
      'chart-assignee': 'Assignee Breakdown',
      'chart-trend':    'Completion Trend',
    }

    // Capture all chart screenshots in parallel
    const captures = await Promise.all(validIds.map(captureElement))

    const COLS      = 2
    const ROWS      = Math.ceil(captures.filter(Boolean).length / COLS)
    const cellW     = (CW - 4) / COLS
    const footerY   = PH - 10
    const availH    = footerY - y
    const rowStride = availH / ROWS
    const cellH     = Math.max(38, rowStride - 9)  // 9mm: title (5mm) + gaps

    let col = 0, row = 0
    for (let i = 0; i < captures.length; i++) {
      const cap = captures[i]
      if (!cap) continue

      const cx = M + col * (cellW + 4)
      const cy = y + row * rowStride

      // Card background
      pdf.setFillColor(...C.light)
      pdf.roundedRect(cx, cy, cellW, cellH + 8, 2, 2, 'F')

      // Chart title
      pdf.setFontSize(6.5)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...C.primary)
      pdf.text(CHART_TITLES[validIds[i]] ?? validIds[i], cx + 3, cy + 5)

      // Chart image (maintain aspect ratio, clamp to cell)
      const ratio  = cap.h / cap.w
      const imgW   = cellW - 4
      const imgH   = Math.min(imgW * ratio, cellH - 2)
      pdf.addImage(cap.dataUrl, 'PNG', cx + 2, cy + 6.5, imgW, imgH)

      col++
      if (col >= COLS) { col = 0; row++ }
    }
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  pdf.setDrawColor(...C.light)
  pdf.setLineWidth(0.3)
  pdf.line(M, PH - 8, PW - M, PH - 8)
  pdf.setFontSize(6.5)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...C.gray)
  pdf.text(`SIQAS QA Feature Tracker  ·  ${timestamp}`, M, PH - 4)
  pdf.text('CONFIDENTIAL', PW - M, PH - 4, { align: 'right' })

  pdf.save(`QA_Report_${fileTs}.pdf`)
}
