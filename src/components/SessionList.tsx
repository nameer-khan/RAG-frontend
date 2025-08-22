import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Delete,
  Chat,
  Star,
  StarBorder,
  Edit,
} from '@mui/icons-material';
import { ChatSession, apiService } from '../services/api';

interface SessionListProps {
  onSessionSelect: (sessionId: string) => void;
  selectedSessionId?: string;
  onSessionUpdate?: () => void;
}

export interface SessionListRef {
  openNewChatDialog: () => void;
}

const SessionList = forwardRef<SessionListRef, SessionListProps>(({ onSessionSelect, selectedSessionId, onSessionUpdate }, ref) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [renameSessionId, setRenameSessionId] = useState('');
  const [renameTitle, setRenameTitle] = useState('');

  useImperativeHandle(ref, () => ({
    openNewChatDialog: () => setOpenDialog(true),
  }));

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getChatSessions();
      console.log('Load sessions response:', response);
      
      if (response && response.data) {
        setSessions(response.data);
      } else {
        setSessions([]);
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;

    try {
      const response = await apiService.createChatSession({ title: newSessionTitle });
      console.log('Create session response:', response);
      
      if (response && response.data) {
        setSessions(prev => [response.data, ...(prev || [])]);
        setNewSessionTitle('');
        setOpenDialog(false);
        onSessionSelect(response.data.id);
        onSessionUpdate?.();
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      setError('Failed to create session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await apiService.deleteChatSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      if (selectedSessionId === sessionId) {
        onSessionSelect('');
      }
      onSessionUpdate?.();
    } catch (error) {
      console.error('Failed to delete session:', error);
      setError('Failed to delete session');
    }
  };

  const handleRenameSession = async () => {
    if (!renameTitle.trim()) return;

    try {
      const response = await apiService.renameChatSession(renameSessionId, renameTitle);
      if (response && response.data) {
        setSessions(prev => prev.map(session => 
          session.id === renameSessionId ? response.data : session
        ));
        setRenameTitle('');
        setRenameSessionId('');
        setOpenRenameDialog(false);
        onSessionUpdate?.();
      }
    } catch (error) {
      console.error('Failed to rename session:', error);
      setError('Failed to rename session');
    }
  };

  const handleToggleFavorite = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await apiService.toggleChatSessionFavorite(sessionId);
      if (response && response.data) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId ? response.data : session
        ));
        onSessionUpdate?.();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setError('Failed to toggle favorite');
    }
  };

  const openRenameDialogForSession = (session: ChatSession) => {
    setRenameSessionId(session.id);
    setRenameTitle(session.title);
    setOpenRenameDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Chat Sessions</Typography>
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={() => setOpenDialog(true)}
            size="small"
            sx={{ 
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
            }}
          >
            New Chat
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Sessions List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {(!sessions || sessions.length === 0) && !loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Chat sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No chat sessions yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first session to get started
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sessions?.map((session, index) => (
              <React.Fragment key={session.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <>
                      <Tooltip title="Rename">
                        <IconButton
                          edge="end"
                          onClick={() => openRenameDialogForSession(session)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={session.is_favorite ? 'Unfavorite' : 'Favorite'}>
                        <IconButton
                          edge="end"
                          onClick={(e) => handleToggleFavorite(session.id, e)}
                          size="small"
                        >
                          {session.is_favorite ? <Star /> : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteSession(session.id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemButton
                    selected={selectedSessionId === session.id}
                    onClick={() => onSessionSelect(session.id)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: selectedSessionId === session.id ? 'bold' : 'normal',
                              flex: 1,
                            }}
                          >
                            {session.title}
                          </Typography>
                          {session.is_favorite && <Star sx={{ fontSize: 16, color: 'warning.main' }} />}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {session.message_count} messages
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(session.updated_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {sessions && index < sessions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Create Session Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Chat Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Title"
            fullWidth
            variant="outlined"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateSession();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={!newSessionTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Session Dialog */}
      <Dialog open={openRenameDialog} onClose={() => setOpenRenameDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rename Chat Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Session Title"
            fullWidth
            variant="outlined"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleRenameSession();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRenameDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRenameSession}
            variant="contained"
            disabled={!renameTitle.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
});

export default SessionList;
