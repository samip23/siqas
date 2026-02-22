import { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Card, CardContent, Avatar, Chip,
  TextField, Button, IconButton, Tooltip, Divider,
  CircularProgress, Alert, Stack, Collapse,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import CampaignIcon from '@mui/icons-material/Campaign'
import { useAuth } from '../../context/AuthContext'
import { useBulletin } from '../../hooks/useBulletin'
import {
  createPost, updatePost, deletePost,
  toggleReaction, addComment, deleteComment, subscribeToComments,
} from '../../services/bulletinService'

const CATEGORIES = [
  { label: 'Update',      emoji: '📢', color: '#0EA5E9' },
  { label: 'Blocker',     emoji: '🚫', color: '#DC2626' },
  { label: 'Achievement', emoji: '🏆', color: '#059669' },
  { label: 'Reminder',    emoji: '📌', color: '#D97706' },
  { label: 'FYI',         emoji: 'ℹ️',  color: '#9333EA' },
]

const REACTIONS = ['👍', '❤️', '🎉', '😮']

function getCat(label) {
  return CATEGORIES.find(c => c.label === label) ?? CATEGORIES[0]
}

function avatarLetter(email) {
  return email?.[0]?.toUpperCase() ?? '?'
}

function relativeTime(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Bulletin() {
  const { currentUser } = useAuth()
  const { posts, loading, error } = useBulletin()

  // Compose
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Update')
  const [posting, setPosting] = useState(false)

  // Edit
  const [editingPostId, setEditingPostId] = useState(null)
  const [editContent, setEditContent] = useState('')

  // Comments
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [commentsMap, setCommentsMap] = useState({})
  const [commentDraft, setCommentDraft] = useState({})
  const [commentLoading, setCommentLoading] = useState({})
  const unsubsRef = useRef({})

  // Clean up all comment subscriptions on unmount
  useEffect(() => () => {
    Object.values(unsubsRef.current).forEach(fn => fn())
  }, [])

  async function handlePost() {
    if (!content.trim()) return
    setPosting(true)
    try {
      await createPost(currentUser, { content: content.trim(), category })
      setContent('')
    } finally {
      setPosting(false)
    }
  }

  async function handleUpdate(postId) {
    if (!editContent.trim()) return
    await updatePost(postId, editContent.trim())
    setEditingPostId(null)
  }

  async function handleDelete(postId) {
    if (!window.confirm('Delete this post?')) return
    await deletePost(postId)
  }

  async function handleReaction(post, emoji) {
    const hasReacted = !!post.reactions?.[emoji]?.[currentUser.uid]
    await toggleReaction(post.id, currentUser.uid, emoji, hasReacted)
  }

  function handleToggleComments(postId) {
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
        unsubsRef.current[postId]?.()
        delete unsubsRef.current[postId]
      } else {
        next.add(postId)
        unsubsRef.current[postId] = subscribeToComments(postId, comments => {
          setCommentsMap(prev => ({ ...prev, [postId]: comments }))
        })
      }
      return next
    })
  }

  async function handleAddComment(postId) {
    const text = commentDraft[postId]?.trim()
    if (!text) return
    setCommentLoading(prev => ({ ...prev, [postId]: true }))
    try {
      await addComment(postId, currentUser, text)
      setCommentDraft(prev => ({ ...prev, [postId]: '' }))
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  async function handleDeleteComment(postId, commentId) {
    await deleteComment(postId, commentId)
  }

  return (
    <Box>
      {/* Hero Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg, #4C1D95 0%, #5B21B6 45%, #312E81 100%)',
        borderRadius: 3, p: { xs: 3, sm: 4 }, mb: 4, color: 'white',
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <CampaignIcon sx={{ fontSize: { xs: 40, sm: 52 }, opacity: 0.9 }} />
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Team Bulletin Board
          </Typography>
          <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
            Share updates, blockers, and achievements with the team
          </Typography>
        </Box>
      </Box>

      {/* Compose Card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {CATEGORIES.map(cat => (
              <Chip
                key={cat.label}
                label={`${cat.emoji} ${cat.label}`}
                onClick={() => setCategory(cat.label)}
                size="small"
                sx={{
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                  bgcolor: category === cat.label ? cat.color : 'transparent',
                  color: category === cat.label ? 'white' : 'text.secondary',
                  border: `1.5px solid ${category === cat.label ? cat.color : '#E2E8F0'}`,
                  '&:hover': { bgcolor: category === cat.label ? cat.color : '#F8FAFC', opacity: 0.9 },
                }}
              />
            ))}
          </Box>
          <TextField
            fullWidth multiline minRows={2} maxRows={6}
            placeholder="What's on your mind? Share an update with the team..."
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handlePost() }}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handlePost}
              disabled={!content.trim() || posting}
              sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
            >
              {posting ? 'Posting…' : 'Post'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error.includes('Missing or insufficient permissions')
            ? 'Firestore is not enabled yet. Please enable Firestore Database in your Firebase console (Build → Firestore Database → Create database).'
            : error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && posts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <CampaignIcon sx={{ fontSize: 56, mb: 2, opacity: 0.25 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>No posts yet</Typography>
          <Typography variant="body2">Be the first to share an update with the team!</Typography>
        </Box>
      )}

      {/* Post feed */}
      <Stack spacing={2}>
        {posts.map(post => {
          const catConfig = getCat(post.category)
          const isOwn = post.authorId === currentUser.uid
          const isEditing = editingPostId === post.id
          const isExpanded = expandedComments.has(post.id)
          const postComments = commentsMap[post.id] ?? []

          return (
            <Card key={post.id} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 2 } }}>

                {/* Post Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#0EA5E9', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
                    {avatarLetter(post.authorEmail)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${catConfig.emoji} ${catConfig.label}`}
                        size="small"
                        sx={{ bgcolor: catConfig.color, color: 'white', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                      />
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                        {post.authorEmail}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {relativeTime(post.createdAt)}
                        {post.editedAt && ' · edited'}
                      </Typography>
                    </Box>
                  </Box>
                  {isOwn && !isEditing && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small"
                          onClick={() => { setEditingPostId(post.id); setEditContent(post.content) }}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(post.id)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {/* Post Body */}
                {isEditing ? (
                  <Box sx={{ mb: 1.5 }}>
                    <TextField
                      fullWidth multiline minRows={2}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      size="small"
                      sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={() => handleUpdate(post.id)}
                        disabled={!editContent.trim()} startIcon={<CheckIcon />}
                        sx={{ borderRadius: 2, fontWeight: 700 }}>
                        Save
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => setEditingPostId(null)}
                        startIcon={<CloseIcon />} sx={{ borderRadius: 2 }}>
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1.5, lineHeight: 1.7 }}>
                    {post.content}
                  </Typography>
                )}

                {/* Reaction bar */}
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                  {REACTIONS.map(emoji => {
                    const reactionMap = post.reactions?.[emoji] ?? {}
                    const count = Object.keys(reactionMap).length
                    const hasReacted = !!reactionMap[currentUser.uid]
                    return (
                      <Chip
                        key={emoji}
                        label={count > 0 ? `${emoji} ${count}` : emoji}
                        size="small"
                        onClick={() => handleReaction(post, emoji)}
                        sx={{
                          cursor: 'pointer', fontWeight: 600, minWidth: 44,
                          bgcolor: hasReacted ? '#EFF4FB' : '#F8FAFC',
                          border: `1.5px solid ${hasReacted ? '#0EA5E9' : '#E2E8F0'}`,
                          color: hasReacted ? 'primary.main' : 'text.secondary',
                          '&:hover': { bgcolor: hasReacted ? '#DBEAFE' : '#F1F5F9' },
                        }}
                      />
                    )
                  })}
                </Box>

                <Divider sx={{ mb: 1 }} />

                {/* Comments toggle */}
                <Button size="small" onClick={() => handleToggleComments(post.id)}
                  sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none', px: 0.5,
                    '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}>
                  💬 {isExpanded
                    ? `Hide${postComments.length > 0 ? ` (${postComments.length})` : ''}`
                    : `Comments${postComments.length > 0 ? ` (${postComments.length})` : ''}`}
                </Button>

                {/* Comment thread */}
                <Collapse in={isExpanded}>
                  <Box sx={{ mt: 1.5, pl: 1.5, borderLeft: '2px solid #E2E8F0' }}>
                    {postComments.length === 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        No comments yet. Be the first!
                      </Typography>
                    )}
                    {postComments.map(comment => (
                      <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#64748B', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, mt: 0.3 }}>
                          {avatarLetter(comment.authorEmail)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="caption" fontWeight={700}>{comment.authorEmail}</Typography>
                            <Typography variant="caption" color="text.secondary">{relativeTime(comment.createdAt)}</Typography>
                            {comment.authorId === currentUser.uid && (
                              <Tooltip title="Delete comment">
                                <IconButton size="small" onClick={() => handleDeleteComment(post.id, comment.id)}
                                  sx={{ ml: 'auto', color: 'text.disabled', p: 0.25, '&:hover': { color: 'error.main' } }}>
                                  <DeleteIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {comment.content}
                          </Typography>
                        </Box>
                      </Box>
                    ))}

                    {/* Add comment */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'flex-end' }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#0EA5E9', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, mb: 0.5 }}>
                        {avatarLetter(currentUser.email)}
                      </Avatar>
                      <TextField
                        fullWidth size="small" placeholder="Add a comment…"
                        value={commentDraft[post.id] ?? ''}
                        onChange={e => setCommentDraft(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAddComment(post.id)
                          }
                        }}
                        multiline maxRows={4}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}
                      />
                      <IconButton size="small" onClick={() => handleAddComment(post.id)}
                        disabled={!commentDraft[post.id]?.trim() || commentLoading[post.id]}
                        sx={{ color: 'primary.main', mb: 0.5, flexShrink: 0 }}>
                        <SendIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Collapse>

              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </Box>
  )
}
