import React, { useState, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  SmartToy,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SessionList, { SessionListRef } from './SessionList';
import Chat from './Chat';
import DocumentManager from './DocumentManager';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const sessionListRef = useRef<SessionListRef>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleNewChat = () => {
    sessionListRef.current?.openNewChatDialog();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSessionUpdate = () => {
    // This will be called when sessions are updated (renamed, favorited, etc.)
    // The SessionList component will handle the refresh internally
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="sticky" sx={{ zIndex: 1100 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <SmartToy sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              RAG Chat
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.first_name || user?.username}!
          </Typography>
          
          <IconButton
            size="large"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Session List Sidebar */}
        <Box sx={{ width: 300, minWidth: 300, borderRight: 1, borderColor: 'divider' }}>
          <SessionList
            ref={sessionListRef}
            onSessionSelect={setSelectedSessionId}
            selectedSessionId={selectedSessionId}
            onSessionUpdate={handleSessionUpdate}
          />
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab 
                icon={<SmartToy />} 
                label="Chat" 
                iconPosition="start"
              />
              <Tab 
                icon={<Description />} 
                label="Documents" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 0 && (
              /* Chat Area */
              selectedSessionId ? (
                <Chat sessionId={selectedSessionId} onNewChat={handleNewChat} />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                  }}
                >
                  <SmartToy sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Welcome to RAG Chat!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    Select a chat session from the sidebar or create a new one to start
                    exploring AI-powered conversations with your documents.
                  </Typography>
                </Box>
              )
            )}
            
            {activeTab === 1 && (
              /* Document Management Area */
              <DocumentManager />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
