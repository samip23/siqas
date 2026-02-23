import { useMemo, useState } from 'react'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { Box, Chip, Typography, useTheme } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { format } from 'date-fns'
import { normalizePriority } from '../../utils/metrics'

const PRIORITY_STYLE = {
  Critical:      { bg: 'rgba(248,113,113,0.14)', color: '#F87171', border: 'rgba(248,113,113,0.30)' },
  High:          { bg: 'rgba(251,146,60,0.14)',  color: '#FB923C', border: 'rgba(251,146,60,0.30)'  },
  Medium:        { bg: 'rgba(245,158,11,0.14)',  color: '#F59E0B', border: 'rgba(245,158,11,0.30)'  },
  Low:           { bg: 'rgba(16,185,129,0.14)',  color: '#10B981', border: 'rgba(16,185,129,0.30)'  },
  'Nice-to-Have':{ bg: 'rgba(129,140,248,0.14)', color: '#818CF8', border: 'rgba(129,140,248,0.30)' },
  Unknown:       { bg: 'rgba(238,240,255,0.08)', color: '#8891A8', border: 'rgba(238,240,255,0.15)' },
}

function PriorityChip({ value }) {
  const label = normalizePriority(value)
  const s = PRIORITY_STYLE[label] ?? PRIORITY_STYLE.Unknown
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontWeight: 600,
        fontSize: '0.72rem',
      }}
    />
  )
}

function StatusChip({ completed }) {
  return completed ? (
    <Chip
      icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
      label="Completed"
      size="small"
      sx={{ bgcolor: 'rgba(16,185,129,0.14)', color: '#10B981', border: '1px solid rgba(16,185,129,0.30)', fontWeight: 600, fontSize: '0.72rem' }}
    />
  ) : (
    <Chip
      icon={<RadioButtonUncheckedIcon sx={{ fontSize: '14px !important', color: '#60A5FA !important' }} />}
      label="In Progress"
      size="small"
      sx={{ bgcolor: 'rgba(96,165,250,0.14)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.30)', fontWeight: 600, fontSize: '0.72rem' }}
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
        '& .MuiDataGrid-root': {
          bgcolor: '#141720',
          color: '#EEF0FF',
        },
        '& .MuiDataGrid-main': { bgcolor: '#141720' },
        '& .MuiDataGrid-virtualScrollerContent': { bgcolor: '#141720' },
        '& .MuiDataGrid-row': {
          bgcolor: '#141720',
          '&:hover': { bgcolor: 'rgba(238,240,255,0.04) !important' },
        },
        '& .row-completed': {
          bgcolor: 'rgba(16,185,129,0.05) !important',
          '&:hover': { bgcolor: 'rgba(16,185,129,0.09) !important' },
        },
        '& .MuiDataGrid-columnHeader': {
          bgcolor: '#1A1E2C',
          fontWeight: 700,
          color: '#8891A8',
        },
        '& .MuiDataGrid-columnHeaders': { bgcolor: '#1A1E2C' },
        '& .MuiDataGrid-toolbarContainer': {
          bgcolor: '#141720',
          px: 2,
          py: 1,
          borderBottom: `1px solid rgba(238,240,255,0.08)`,
          gap: 1,
          '& .MuiButton-root': { color: '#F59E0B' },
          '& .MuiInputBase-root': { color: '#EEF0FF' },
        },
        '& .MuiDataGrid-footerContainer': {
          bgcolor: '#141720',
          borderTop: `1px solid rgba(238,240,255,0.08)`,
          color: '#8891A8',
        },
        '& .MuiTablePagination-root': { color: '#8891A8' },
        '& .MuiTablePagination-selectIcon': { color: '#8891A8' },
        '& .MuiDataGrid-iconSeparator': { color: 'rgba(238,240,255,0.12)' },
        '& .MuiDataGrid-menuIcon': { color: '#8891A8' },
        '& .MuiDataGrid-sortIcon': { color: '#F59E0B' },
        '& .MuiDataGrid-filterIcon': { color: '#F59E0B' },
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
