import Papa from 'papaparse'

// Flexible column detection — same approach as csvParser.js
const COLUMN_DEFS = [
  {
    key: 'id',
    required: true,
    patterns: ['id', 'req id', 'req_id', 'requirement id', 'requirement_id', 'req #', 'req#', 'requirement #', 'requirement#', 'no', 'number', '#'],
  },
  {
    key: 'title',
    required: false,
    patterns: ['title', 'name', 'summary', 'subject', 'feature', 'feature name'],
  },
  {
    key: 'description',
    required: true,
    patterns: ['description', 'desc', 'details', 'requirement', 'business requirement', 'detail', 'content', 'notes', 'note'],
  },
  {
    key: 'priority',
    required: false,
    patterns: ['priority', 'pri', 'severity', 'importance', 'criticality'],
  },
  {
    key: 'category',
    required: false,
    patterns: ['category', 'cat', 'module', 'area', 'domain', 'section', 'type', 'feature area', 'component'],
  },
]

function normalise(str) {
  return (str ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function detectColumns(headers) {
  const map = {}
  const normHeaders = headers.map(h => ({ original: h, norm: normalise(h) }))

  for (const def of COLUMN_DEFS) {
    for (const { original, norm } of normHeaders) {
      if (def.patterns.some(p => norm === p || norm.startsWith(p))) {
        if (!map[def.key]) map[def.key] = original
        break
      }
    }
  }
  return map
}

/**
 * Parse a File object as a business-requirements CSV.
 * Returns { requirements, warnings, totalRows, validRows, columnMap }
 */
export function parseRequirementsCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta, errors }) => {
        if (errors.length && data.length === 0) {
          return reject(new Error('Could not read this file. Make sure it is a valid CSV.'))
        }

        const columnMap = detectColumns(meta.fields ?? [])

        const missing = COLUMN_DEFS
          .filter(d => d.required && !columnMap[d.key])
          .map(d => d.key)

        if (missing.length > 0) {
          return reject(new Error(
            `Missing required column(s): ${missing.join(', ')}. ` +
            `Expected at least an ID column (e.g. "Req ID") and a description column (e.g. "Description").`
          ))
        }

        const warnings = []
        const requirements = []
        let rowNum = 1

        for (const row of data) {
          rowNum++
          const id = String(row[columnMap.id] ?? '').trim()
          const description = String(row[columnMap.description] ?? '').trim()

          if (!id) { warnings.push(`Row ${rowNum}: skipped — missing ID.`); continue }
          if (!description) { warnings.push(`Row ${rowNum}: skipped — missing description.`); continue }

          requirements.push({
            id,
            title: columnMap.title ? String(row[columnMap.title] ?? '').trim() : '',
            description,
            priority: columnMap.priority ? String(row[columnMap.priority] ?? '').trim() : '',
            category: columnMap.category ? String(row[columnMap.category] ?? '').trim() : '',
          })
        }

        if (requirements.length === 0) {
          return reject(new Error('No valid requirements found in the file. Check that your CSV has data rows.'))
        }

        resolve({
          requirements,
          warnings,
          totalRows: data.length,
          validRows: requirements.length,
          columnMap,
        })
      },
      error: (err) => reject(new Error(err.message)),
    })
  })
}
