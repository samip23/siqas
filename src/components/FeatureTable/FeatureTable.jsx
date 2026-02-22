import { useMemo, useState } from 'react'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { Box, Chip, Typography, useTheme } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { format } from 'date-fns'
import { normalizePriority, getPriorityColor } from '../../utils/metrics'

const PRIORITY_BG = {
  Critical: '#FFF0F0',
  High: '#FFF5E6',
  Medium: '#EFF4FF',
  Low: '#F0FFF4',
  'Nice-to-Have': '#F5F0FF',
  Unknown: '#F5F5F5',
}

function PriorityChip({ value }) {
  const label = normalizePriority(value)
  const color = getPriorityColor(label)
  const bg = PRIORITY_BG[label] ?? '#F5F5F5'
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: bg,
        color,
        border: `1px solid ${color}30`,
        fontWeight: 600,
        fontSize: '0.72rem',
      }}
    />
  )
}

function StatusChip({ completed }) {
  return completed ? (
    <Chip
      icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
      label="Completed"
      size="small"
      sx={{ bgcolor: '#F0FFF4', color: '#2E7D32', border: '1px solid #2E7D3230', fontWeight: 600, fontSize: '0.72rem' }}
    />
  ) : (
    <Chip
      icon={<RadioButtonUncheckedIcon sx={{ fontSize: '14px !important' }} />}
      label="In Progress"
      size="small"
      sx={{ bgcolor: '#EFF4FF', color: '#1565C0', border: '1px solid #1565C030', fontWeight: 600, fontSize: '0.72rem' }}
    />
  )
}

const COLUMNS = [
  {
    field: 'featureNumber',
    headerName: 'Feature #',
    width: 100,
    type: 'number',
    headerAlign: 'left',
    align: 'left',
    renderCell: p => (
      <Typography variant="body2" fontWeight={700} color="primary.main">
        #{p.value}
      </Typography>
    ),
  },
  {
    field: 'name',
    headerName: 'Feature Name',
    flex: 1,
    minWidth: 200,
    renderCell: p => (
      <Typography variant="body2" fontWeight={500} title={p.value} noWrap>
        {p.value}
      </Typography>
    ),
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 130,
    renderCell: p => <PriorityChip value={p.value} />,
    sortComparator: (v1, v2) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3, 'Nice-to-Have': 4 }
      const a = normalizePriority(v1), b = normalizePriority(v2)
      return (order[a] ?? 99) - (order[b] ?? 99)
    },
  },
  {
    field: 'assignee',
    headerName: 'Assignee',
    width: 160,
    renderCell: p => (
      <Chip
        label={p.value}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500, fontSize: '0.78rem', maxWidth: 140 }}
      />
    ),
  },
  {
    field: 'sprintNumber',
    headerName: 'Sprint #',
    width: 100,
    type: 'number',
    headerAlign: 'left',
    align: 'left',
    renderCell: p => (
      <Typography variant="body2" fontWeight={600} color="text.secondary">
        Sprint {p.value}
      </Typography>
    ),
  },
  {
    field: 'completedDate',
    headerName: 'Completed Date',
    width: 150,
    type: 'date',
    valueFormatter: v => (v ? format(new Date(v), 'MMM d, yyyy') : '—'),
    renderCell: p => (
      <Typography
        variant="body2"
        color={p.value ? 'success.main' : 'text.disabled'}
        fontWeight={p.value ? 600 : 400}
      >
        {p.value ? format(new Date(p.value), 'MMM d, yyyy') : '—'}
      </Typography>
    ),
  },
  {
    field: '_status',
    headerName: 'Status',
    width: 130,
    sortable: false,
    filterable: false,
    valueGetter: (_v, row) => (row.completedDate ? 'Completed' : 'In Progress'),
    renderCell: p => <StatusChip completed={!!p.row.completedDate} />,
  },
]

export default function FeatureTable({ rows = [], loading = false }) {
  const theme = useTheme()

  const tableRows = useMemo(
    () => rows.map(r => ({ ...r, id: r.id ?? r.featureNumber })),
    [rows]
  )

  return (
    <Box
      sx={{
        width: '100%',
        '& .row-completed': {
          bgcolor: '#F6FFF8',
          '&:hover': { bgcolor: '#ECF9EF !important' },
        },
        '& .MuiDataGrid-columnHeader': {
          bgcolor: theme.palette.background.default,
          fontWeight: 700,
          color: theme.palette.text.primary,
        },
        '& .MuiDataGrid-toolbarContainer': {
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          gap: 1,
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DataGrid
        rows={tableRows}
        columns={COLUMNS}
        loading={loading}
        autoHeight
        disableRowSelectionOnClick
        getRowClassName={p => (p.row.completedDate ? 'row-completed' : '')}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300 },
          },
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'featureNumber', sort: 'asc' }] },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          border: 'none',
          fontSize: '0.865rem',
          '& .MuiDataGrid-cell': {
            borderColor: theme.palette.divider,
            display: 'flex',
            alignItems: 'center',
          },
        }}
      />
    </Box>
  )
}
