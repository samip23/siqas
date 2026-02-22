import Papa from 'papaparse'

// Column definitions: key → list of acceptable header names (lower-case, trimmed)
const COLUMN_DEFS = [
  {
    key: 'featureNumber',
    patterns: ['feature #', 'feature#', 'feature number', 'feature_number', 'id', 'feature id', 'feat #', 'feat#'],
    label: 'Feature #',
  },
  {
    key: 'name',
    patterns: ['name', 'feature name', 'title', 'description', 'feature title'],
    label: 'Name',
  },
  {
    key: 'priority',
    patterns: ['priority', 'pri', 'p', 'severity'],
    label: 'Priority',
  },
  {
    key: 'assignee',
    patterns: ['assignee', 'assigned to', 'owner', 'developer', 'dev', 'engineer'],
    label: 'Assignee',
  },
  {
    key: 'sprintNumber',
    patterns: ['sprint #', 'sprint#', 'sprint number', 'sprint_number', 'sprint', 'iteration'],
    label: 'Sprint #',
  },
  {
    key: 'completedDate',
    patterns: [
      'completed date', 'completion date', 'done date', 'finished date',
      'completed_date', 'completion_date', 'done_date', 'date completed',
      'close date', 'closed date', 'resolved date',
    ],
    label: 'Completed Date',
  },
]

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/\s+/g, ' ')
}

function buildColumnMapping(headers) {
  const normalized = headers.map(normalizeHeader)
  const mapping = {}
  const missing = []

  for (const def of COLUMN_DEFS) {
    const idx = normalized.findIndex(h =>
      def.patterns.some(p => h === p || h === p.replace(/\s+/g, '_') || h.startsWith(p))
    )
    if (idx === -1) {
      missing.push(def.label)
    } else {
      mapping[def.key] = headers[idx]
    }
  }

  return { mapping, missing }
}

function parseFlexibleDate(raw) {
  if (!raw || !raw.toString().trim()) return null
  const s = raw.toString().trim()

  // MM/DD/YYYY  or  M/D/YYYY  (Excel US default)
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (us) {
    const d = new Date(+us[3], +us[1] - 1, +us[2])
    return isNaN(d) ? null : d
  }

  // DD-MM-YYYY  or  DD.MM.YYYY
  const eu = s.match(/^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/)
  if (eu) {
    const d = new Date(+eu[3], +eu[2] - 1, +eu[1])
    return isNaN(d) ? null : d
  }

  // YYYY-MM-DD  (ISO)
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3])
    return isNaN(d) ? null : d
  }

  // Excel serial number (days since 1899-12-30)
  const serial = Number(s)
  if (!isNaN(serial) && serial > 1000 && serial < 100000) {
    const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
    return isNaN(d) ? null : d
  }

  // Fallback: native Date
  const d = new Date(s)
  return isNaN(d) ? null : d
}

function parseRow(row, mapping, rowIndex) {
  const errors = []

  // Feature Number
  const featureNumberRaw = row[mapping.featureNumber]
  const featureNumber = parseInt(featureNumberRaw, 10)
  if (!featureNumberRaw?.toString().trim() || isNaN(featureNumber)) {
    errors.push(`Row ${rowIndex + 2}: "Feature #" must be a valid number (got: "${featureNumberRaw}")`)
  }

  // Name
  const name = row[mapping.name]?.toString().trim()
  if (!name) {
    errors.push(`Row ${rowIndex + 2}: "Name" cannot be empty`)
  }

  // Priority
  const priority = row[mapping.priority]?.toString().trim()
  if (!priority) {
    errors.push(`Row ${rowIndex + 2}: "Priority" cannot be empty`)
  }

  // Assignee
  const assignee = row[mapping.assignee]?.toString().trim()
  if (!assignee) {
    errors.push(`Row ${rowIndex + 2}: "Assignee" cannot be empty`)
  }

  // Sprint Number
  const sprintRaw = row[mapping.sprintNumber]
  const sprintNumber = parseInt(sprintRaw, 10)
  if (!sprintRaw?.toString().trim() || isNaN(sprintNumber)) {
    errors.push(`Row ${rowIndex + 2}: "Sprint #" must be a valid number (got: "${sprintRaw}")`)
  }

  // Completed Date (optional)
  const completedDateRaw = row[mapping.completedDate]?.toString().trim()
  let completedDate = null
  if (completedDateRaw) {
    completedDate = parseFlexibleDate(completedDateRaw)
    if (!completedDate) {
      errors.push(`Row ${rowIndex + 2}: "Completed Date" has an unrecognised format: "${completedDateRaw}"`)
    }
  }

  if (errors.length > 0) return { data: null, errors }

  return {
    data: { featureNumber, name, priority, assignee, sprintNumber, completedDate },
    errors: [],
  }
}

/**
 * Parse a CSV File object.
 * Resolves with { features, warnings, totalRows, validRows }
 * Rejects with an Error describing what went wrong.
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: h => h.trim(),
      complete(results) {
        const headers = results.meta.fields ?? []

        if (headers.length === 0) {
          return reject(new Error('The CSV file has no header row.'))
        }

        const { mapping, missing } = buildColumnMapping(headers)
        if (missing.length > 0) {
          return reject(
            new Error(
              `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
              'Please check that your CSV contains all required columns.'
            )
          )
        }

        if (results.data.length === 0) {
          return reject(new Error('The CSV file has no data rows.'))
        }

        const features = []
        const warnings = []

        for (let i = 0; i < results.data.length; i++) {
          const { data, errors } = parseRow(results.data[i], mapping, i)
          if (errors.length > 0) {
            warnings.push(...errors)
          } else {
            features.push(data)
          }
        }

        if (features.length === 0) {
          return reject(new Error('No valid rows could be parsed from the CSV. See validation errors.'))
        }

        resolve({
          features,
          warnings,
          totalRows: results.data.length,
          validRows: features.length,
        })
      },
      error(err) {
        reject(new Error(`CSV parse error: ${err.message}`))
      },
    })
  })
}
