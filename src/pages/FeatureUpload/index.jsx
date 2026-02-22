import { useState, useCallback, useRef } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Alert, AlertTitle,
  LinearProgress, Chip, Stack, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemIcon,
  ListItemText, Paper, Collapse, Fade,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import TableChartIcon from '@mui/icons-material/TableChart'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { parseCSV } from '../../services/csvParser'
import { uploadFeatures } from '../../services/featureService'
import { useFeatures } from '../../hooks/useFeatures'
import { generateDemoFeatures } from '../../demo/generateDemoData'
import FeatureTable from '../../components/FeatureTable/FeatureTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import { UploadHeroIllustration, DropZoneIllustration, DotsPattern } from '../../components/illustrations/Illustrations'

const REQUIRED_COLUMNS = ['Feature #','Name','Priority','Assignee','Sprint #','Completed Date']
const STATUS = { IDLE:'idle', PARSING:'parsing', PARSED:'parsed', UPLOADING:'uploading', DONE:'done', ERROR:'error' }

function DropZone({ onFile, disabled }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)
  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files?.[0]; if (f) onFile(f)
  }, [onFile])
  return (
    <Paper onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)}
      onDrop={handleDrop} onClick={()=>!disabled&&inputRef.current?.click()} elevation={0}
      sx={{
        border:`2px dashed ${dragOver?'#818CF8':'rgba(238,240,255,0.15)'}`, borderRadius:3,
        bgcolor: dragOver?'rgba(129,140,248,0.06)':'rgba(238,240,255,0.02)',
        cursor: disabled?'not-allowed':'pointer', transition:'all 0.2s ease',
        p:3, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:1.5,
        '&:hover': disabled?{}:{ borderColor:'#818CF8', bgcolor:'rgba(129,140,248,0.04)',
          '& .drop-icon':{ transform:'translateY(-4px)' } },
      }}>
      <input ref={inputRef} type="file" accept=".csv,text/csv" hidden disabled={disabled}
        onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);e.target.value=''}} />
      <Box className="drop-icon" sx={{ transition:'transform 0.2s ease' }}>
        <DropZoneIllustration />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{color: dragOver?'#818CF8':'#EEF0FF'}} mb={0.5}>
          {dragOver?'Release to upload':'Drag & drop your CSV file'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or{' '}
          <Typography component="span" variant="body2" fontWeight={700} color="secondary.main"
            sx={{textDecoration:'underline', cursor:'pointer'}}>click to browse</Typography>
          {' '}— Excel-exported CSV, UTF-8
        </Typography>
      </Box>
    </Paper>
  )
}

export default function FeatureUpload() {
  const { features: existingFeatures, loading: featuresLoading, error: featuresError } = useFeatures()
  const [status, setStatus] = useState(STATUS.IDLE)
  const [parseResult, setParseResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showWarnings, setShowWarnings] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const hasExisting = existingFeatures.length > 0

  const handleFile = async file => {
    setStatus(STATUS.PARSING); setParseResult(null); setUploadError(null)
    try { const r = await parseCSV(file); setParseResult(r); setStatus(STATUS.PARSED) }
    catch (err) { setUploadError(err.message); setStatus(STATUS.ERROR) }
  }

  const triggerUpload = () => hasExisting ? setConfirmOpen(true) : doUpload()

  const doUpload = async () => {
    setConfirmOpen(false); setStatus(STATUS.UPLOADING)
    try { await uploadFeatures(parseResult.features); setStatus(STATUS.DONE); setParseResult(null) }
    catch (err) { setUploadError(`Upload failed: ${err.message}`); setStatus(STATUS.ERROR) }
  }

  const reset = () => { setStatus(STATUS.IDLE); setParseResult(null); setUploadError(null) }

  const handleLoadDemo = async () => {
    setSeeding(true)
    try { await uploadFeatures(generateDemoFeatures()) }
    catch (err) { setUploadError(`Demo seed failed: ${err.message}`) }
    finally { setSeeding(false) }
  }

  return (
    <Box maxWidth={1140} mx="auto">

      {/* Hero Banner */}
      <Box sx={{
        position:'relative', overflow:'hidden', borderRadius:4, mb:3,
        background:'linear-gradient(135deg, #0D0F18 0%, #131830 50%, #1A1F3A 100%)',
        border:'1px solid rgba(129,140,248,0.15)',
        p:{ xs:3, sm:4 }, display:'flex', alignItems:'center', justifyContent:'space-between', gap:3,
      }}>
        <DotsPattern color="#FFFFFF" opacity={0.055} cols={14} rows={6} gap={22} />
        <Box maxWidth={420} zIndex={1}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Box sx={{bgcolor:'rgba(129,140,248,0.20)',borderRadius:'50%',p:0.75,display:'flex'}}>
              <UploadFileIcon sx={{color:'#A5B4FC',fontSize:20}} />
            </Box>
            <Typography variant="overline" sx={{color:'rgba(238,240,255,0.45)',letterSpacing:'0.12em'}}>CSV IMPORT</Typography>
          </Stack>
          <Typography variant="h4" sx={{color:'white',mb:1.5,lineHeight:1.2}}>Feature Upload</Typography>
          <Typography variant="body1" sx={{color:'rgba(255,255,255,0.65)',mb:2.5,lineHeight:1.65}}>
            Import sprint features from an Excel-exported CSV. Data is validated, transformed, and stored instantly with full error reporting.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {['Auto-validates','Handles 500+ rows','Smart date parsing','Re-upload safe'].map(tag=>(
              <Chip key={tag} label={tag} size="small"
                sx={{bgcolor:'rgba(129,140,248,0.12)',color:'rgba(238,240,255,0.80)',
                  border:'1px solid rgba(129,140,248,0.25)',fontWeight:600,fontSize:'0.72rem'}} />
            ))}
          </Stack>
        </Box>
        <Box sx={{display:{xs:'none',md:'block'},flexShrink:0,opacity:0.95,zIndex:1}}>
          <UploadHeroIllustration />
        </Box>
      </Box>

      {/* Demo Banner */}
      {!hasExisting && (
        <Alert severity="info" icon={<AutoFixHighIcon />} sx={{mb:3}}
          action={
            <Button color="inherit" size="small" startIcon={<AutoFixHighIcon />}
              onClick={handleLoadDemo} disabled={seeding} sx={{fontWeight:700,whiteSpace:'nowrap'}}>
              {seeding?'Loading…':'Load Demo Data'}
            </Button>
          }>
          <AlertTitle>No features loaded yet</AlertTitle>
          Try the app with generated data — 60 realistic QA features across 4 sprints and 6 assignees.
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns={{xs:'1fr',md:'1fr 300px'}} gap={3}>
        {/* Left: Upload Panel */}
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Card>
            <CardContent sx={{p:{xs:2,sm:3}}}>
              {(status===STATUS.IDLE||status===STATUS.ERROR) && (
                <DropZone onFile={handleFile} disabled={status===STATUS.UPLOADING} />
              )}
              {status===STATUS.PARSING && (
                <Box textAlign="center" py={5}><LoadingSpinner message="Parsing and validating CSV…" /></Box>
              )}
              {status===STATUS.UPLOADING && (
                <Box py={4}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                    <CloudUploadIcon sx={{color:'secondary.main'}} />
                    <Typography fontWeight={700} color="secondary.main">Uploading to store…</Typography>
                  </Stack>
                  <LinearProgress sx={{height:7,borderRadius:4}} />
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">Please keep this tab open.</Typography>
                </Box>
              )}
              {status===STATUS.ERROR && uploadError && (
                <Box mt={2}><ErrorAlert title="Upload Failed" message={uploadError} onRetry={reset} /></Box>
              )}
              {status===STATUS.DONE && (
                <Fade in>
                  <Alert severity="success" icon={<TaskAltIcon />} sx={{mb:2}}
                    action={<Button size="small" color="inherit" onClick={reset}>Upload Another</Button>}>
                    <AlertTitle>Upload Complete</AlertTitle>
                    Features saved. The table below has been updated in real-time.
                  </Alert>
                </Fade>
              )}
              {status===STATUS.PARSED && parseResult && (
                <Fade in>
                  <Box>
                    <Alert severity="success" icon={<CheckCircleIcon />} sx={{mb:2}}>
                      <AlertTitle>CSV Validated</AlertTitle>
                      <strong>{parseResult.validRows}</strong> valid rows out of <strong>{parseResult.totalRows}</strong> total.
                      {parseResult.warnings.length>0 && (
                        <Box mt={0.5}>
                          <Typography variant="caption" sx={{cursor:'pointer',textDecoration:'underline',color:'warning.main'}}
                            onClick={()=>setShowWarnings(v=>!v)}>
                            {parseResult.warnings.length} row{parseResult.warnings.length>1?'s':''} skipped — click to view
                          </Typography>
                          <Collapse in={showWarnings}>
                            <List dense sx={{mt:1,maxHeight:160,overflow:'auto'}}>
                              {parseResult.warnings.map((w,i)=>(
                                <ListItem key={i} disableGutters>
                                  <ListItemIcon sx={{minWidth:24}}><WarningAmberIcon sx={{fontSize:14,color:'warning.main'}} /></ListItemIcon>
                                  <ListItemText primary={w} primaryTypographyProps={{variant:'caption',color:'text.secondary'}} />
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        </Box>
                      )}
                    </Alert>
                    <Stack direction="row" spacing={1.5}>
                      <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={triggerUpload} size="large">
                        {hasExisting?'Overwrite & Upload':'Upload to Store'}
                      </Button>
                      <Button variant="outlined" onClick={reset}>Cancel</Button>
                    </Stack>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent sx={{p:0}}>
              <Box px={3} py={2} display="flex" alignItems="center" gap={1.5}
                sx={{borderBottom:'1px solid',borderColor:'divider'}}>
                <Box sx={{bgcolor:'rgba(245,158,11,0.18)',borderRadius:'8px',p:0.75,display:'flex'}}>
                  <TableChartIcon sx={{color:'#F59E0B',fontSize:18}} />
                </Box>
                <Typography variant="h6">Stored Features</Typography>
                {!featuresLoading && (
                  <Chip label={`${existingFeatures.length} features`} size="small"
                    color={existingFeatures.length>0?'primary':'default'} sx={{fontWeight:700}} />
                )}
              </Box>
              {featuresLoading ? <LoadingSpinner message="Loading features…" /> :
                featuresError ? <ErrorAlert message={featuresError} sx={{m:2}} /> :
                <FeatureTable rows={existingFeatures} />}
            </CardContent>
          </Card>
        </Box>

        {/* Right: Sidebar */}
        <Box display="flex" flexDirection="column" gap={2}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Box sx={{bgcolor:'rgba(129,140,248,0.20)',borderRadius:'8px',p:0.75,display:'flex'}}>
                  <InfoOutlinedIcon sx={{color:'#A5B4FC',fontSize:16}} />
                </Box>
                <Typography variant="subtitle1">Required Columns</Typography>
              </Stack>
              <List dense disablePadding>
                {REQUIRED_COLUMNS.map(col=>(
                  <ListItem key={col} disableGutters
                    sx={{py:0.4,px:1,mb:0.5,borderRadius:2,bgcolor:'rgba(238,240,255,0.04)',border:'1px solid',borderColor:'divider'}}>
                    <ListItemIcon sx={{minWidth:26}}><CheckCircleIcon sx={{fontSize:14,color:'success.main'}} /></ListItemIcon>
                    <ListItemText primary={col} primaryTypographyProps={{variant:'body2',fontWeight:600,fontSize:'0.82rem'}} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{my:2}} />
              <Stack spacing={0.75}>
                {['Headers are case-insensitive','Dates: MM/DD/YYYY or YYYY-MM-DD',
                  'Leave Completed Date blank if in-progress','Priority: text (High) or number (1–5)'].map(tip=>(
                  <Stack key={tip} direction="row" spacing={0.75} alignItems="flex-start">
                    <Typography variant="caption" color="secondary.main" fontWeight={700} sx={{mt:0.1}}>·</Typography>
                    <Typography variant="caption" color="text.secondary">{tip}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {hasExisting && (
            <Card sx={{border:'1px solid',borderColor:'rgba(245,158,11,0.35)',bgcolor:'rgba(245,158,11,0.06)'}}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <WarningAmberIcon sx={{color:'warning.main',fontSize:22,mt:0.2}} />
                  <Box>
                    <Typography variant="subtitle2" sx={{color:'#F59E0B'}} fontWeight={700} mb={0.5}>Existing Data</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {existingFeatures.length} features are stored. A new upload will <strong>replace all existing data</strong>.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Example CSV Format</Typography>
              <Paper variant="outlined" sx={{p:1.5,bgcolor:'#0F1929',borderRadius:2,overflowX:'auto'}}>
                {[
                  {t:'Feature #,Name,Priority,Assignee,Sprint #,Completed Date',c:'#7DD3FC'},
                  {t:'1,Login Page,High,Alice,1,01/15/2025',c:'#A7F3D0'},
                  {t:'2,User Profile,Medium,Bob,1,',c:'#FDE68A'},
                  {t:'3,Dashboard,Critical,Alice,2,02/01/2025',c:'#A7F3D0'},
                ].map((r,i)=>(
                  <Typography key={i} component="div"
                    sx={{fontFamily:'monospace',fontSize:'0.67rem',color:r.c,lineHeight:1.8,whiteSpace:'nowrap'}}>
                    {r.t}
                  </Typography>
                ))}
              </Paper>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Overwrite dialog */}
      <Dialog open={confirmOpen} onClose={()=>setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteSweepIcon sx={{color:'warning.main'}} /><span>Confirm Overwrite</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will <strong>permanently delete</strong> the existing{' '}
            <Chip label={`${existingFeatures.length} features`} size="small" color="warning" sx={{fontWeight:700}} />{' '}
            and replace them with{' '}
            <Chip label={`${parseResult?.validRows??0} new features`} size="small" color="primary" sx={{fontWeight:700}} />.{' '}
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2}}>
          <Button onClick={()=>setConfirmOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={doUpload} variant="contained" color="warning" startIcon={<DeleteSweepIcon />}>
            Yes, Replace Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
