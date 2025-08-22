import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  SmartToy,
  Person,
  Category,
  Source,
  SendRounded,
  Add,
  Refresh,
} from '@mui/icons-material';
import { ChatMessage, ChatSession, apiService } from '../services/api';

interface ChatProps {
  sessionId: string;
  onNewChat?: () => void;
}

const Chat: React.FC<ChatProps> = ({ sessionId, onNewChat }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await apiService.getChatSession(sessionId);
      setSession(response.data);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }, [sessionId]);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await apiService.getSessionMessages(sessionId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
    loadMessages();
  }, [loadSession, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      const messageData = {
        content: newMessage,
      };

      const response = await apiService.sendMessage(sessionId, messageData);
      
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        session: sessionId,
        sender: 'user',
        content: newMessage,

        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage, response.data]);
      setNewMessage('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: '#ffffff',
          borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h4" 
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              {session?.title || 'RAG Chat'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add sx={{ fontSize: 20 }} />}
              onClick={onNewChat || (() => {})}
              size="medium"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  transform: 'scale(1.02)',
                },
                fontSize: '0.875rem',
                px: 3,
                py: 1,
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                fontWeight: 600,
                minWidth: 'auto',
                opacity: onNewChat ? 1 : 0.5,
                cursor: onNewChat ? 'pointer' : 'default',
              }}
            >
              New Chat
            </Button>

            <Tooltip title="Refresh Messages">
              <IconButton
                onClick={loadMessages}
                sx={{
                  color: '#475569',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    color: '#6366f1',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderColor: '#6366f1',
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 3,
          position: 'relative',
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 2,
              color: '#dc2626',
            }}
          >
            {error}
          </Alert>
        )}

        <List sx={{ width: '100%' }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 3,
                px: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  maxWidth: '75%',
                }}
              >
                {message.sender === 'assistant' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: '#6366f1', 
                      width: 40, 
                      height: 40,
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                )}
                
                <Box
                  sx={{
                    background: message.sender === 'user' 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : '#ffffff',
                    color: message.sender === 'user' ? 'white' : '#1e293b',
                    borderRadius: 3,
                    p: 2.5,
                    boxShadow: message.sender === 'user' 
                      ? '0 8px 32px rgba(99, 102, 241, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    border: message.sender === 'assistant' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                    '&::before': message.sender === 'user' ? {
                      content: '""',
                      position: 'absolute',
                      right: -8,
                      top: 16,
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid #8b5cf6',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                    } : {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: 16,
                      width: 0,
                      height: 0,
                      borderRight: '8px solid #ffffff',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontWeight: message.sender === 'user' ? 500 : 400,
                      color: message.sender === 'user' ? 'white' : '#1e293b',
                    }}
                  >
                    {message.content}
                  </Typography>
                  
                  {/* RAG Context Display */}
                  {message.sender === 'assistant' && message.rag_context && message.rag_context.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Source />}
                        label={`${message.rag_context.length} sources`}
                        size="small"
                        sx={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366f1',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          fontWeight: 500,
                        }}
                      />
                      {message.document_category && (
                        <Chip
                          icon={<Category />}
                          label={message.document_category}
                          size="small"
                          sx={{
                            background: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            fontWeight: 500,
                          }}
                        />
                      )}
                    </Box>
                  )}
                  
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1.5,
                      opacity: 0.7,
                      fontWeight: 500,
                      color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : '#64748b',
                    }}
                  >
                    {formatTime(message.created_at)}
                  </Typography>
                </Box>
                
                {message.sender === 'user' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: '#ec4899', 
                      width: 40, 
                      height: 40,
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                    }}
                  >
                    <Person />
                  </Avatar>
                )}
              </Box>
            </ListItem>
          ))}
          
          {loading && (
            <ListItem sx={{ justifyContent: 'center', py: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} sx={{ color: '#6366f1' }} />
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                  AI is thinking...
                </Typography>
              </Box>
            </ListItem>
          )}
        </List>
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 3,
          background: '#ffffff',
          borderTop: '2px solid rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'flex-end',
          maxWidth: '100%',
        }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 3,
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  borderColor: '#6366f1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                color: '#1e293b',
                fontWeight: 500,
                fontSize: '1rem',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#64748b',
                opacity: 1,
                fontWeight: 400,
              },
            }}
          />
          
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
            sx={{ 
              minWidth: 56,
              height: 56,
              borderRadius: '50%',
              background: newMessage.trim() 
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'rgba(156, 163, 175, 0.3)',
              color: 'white',
              boxShadow: newMessage.trim() 
                ? '0 8px 32px rgba(99, 102, 241, 0.4)'
                : 'none',
              transition: 'all 0.3s ease',
              '&:hover': { 
                background: newMessage.trim() 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'rgba(156, 163, 175, 0.3)',
                transform: newMessage.trim() ? 'scale(1.05)' : 'none',
                boxShadow: newMessage.trim() 
                  ? '0 12px 40px rgba(99, 102, 241, 0.5)'
                  : 'none',
              },
              '&:disabled': { 
                background: 'rgba(156, 163, 175, 0.3)',
                transform: 'none',
                boxShadow: 'none',
              },
            }}
          >
            <SendRounded sx={{ fontSize: 24 }} />
          </Button>
        </Box>

        {/* Footer with Author */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            Developed with ❤️ by{' '}
            <Box
              component="a"
              href="https://www.linkedin.com/in/nameer-khan1/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#6366f1',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': {
                  color: '#4f46e5',
                  textDecoration: 'underline',
                }
              }}
            >
              Nameer
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
