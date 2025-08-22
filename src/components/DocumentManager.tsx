import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { apiService, Document, CreateDocumentRequest } from '../services/api';

interface DocumentManagerProps {
  onDocumentSelect?: (document: Document) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ onDocumentSelect }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateDocumentRequest>({
    title: '',
    content: '',
    category: 'general',
    source_url: '',
  });

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getDocuments();
      console.log('Load documents response:', response); // Debug log
      
      // Handle both response formats: direct array or wrapped in data property
      const documents = Array.isArray(response) ? response : (response.data || []);
      console.log('Documents to display:', documents); // Debug log
      setDocuments(documents);
    } catch (err: any) {
      console.error('Load documents error:', err); // Debug log
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getDocumentCategories();
      setCategories(response.data?.categories || []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreateDocument = async () => {
    try {
      await apiService.createDocument(formData);
      setOpenDialog(false);
      resetForm();
      loadDocuments();
      loadCategories(); // Refresh categories in case new one was added
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create document');
    }
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument) return;
    
    try {
      await apiService.updateDocument(editingDocument.id, formData);
      setOpenDialog(false);
      setEditingDocument(null);
      resetForm();
      loadDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await apiService.deleteDocument(documentId);
      loadDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      content: document.content,
      category: document.category,
      source_url: document.source_url || '',
    });
    setOpenDialog(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiService.searchDocuments(
        searchQuery,
        selectedCategory || undefined,
        10
      );
      console.log('Search response:', response); // Debug log
      
      // Handle both response formats: direct array or wrapped in data property
      const documents = Array.isArray(response) ? response : (response.data || []);
      console.log('Documents to display:', documents); // Debug log
      setSearchResults(documents);
    } catch (err: any) {
      console.error('Search error:', err); // Debug log
      setError(err.response?.data?.message || 'Failed to search documents');
    } finally {
      setIsSearching(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      source_url: '',
    });
    setEditingDocument(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const displayDocuments = searchQuery ? searchResults : documents;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Document Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Documents
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Search Query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search terms..."
            />
          </Box>
          <Box sx={{ flex: '0 1 200px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '0 1 120px', minWidth: 0 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              Search
            </Button>
          </Box>
          <Box sx={{ flex: '0 1 120px', minWidth: 0 }}>
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSearchResults([]);
              }}
            >
              Clear Search
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Documents List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {displayDocuments.map((document) => (
            <Box key={document.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {document.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {document.content.length > 150
                      ? `${document.content.substring(0, 150)}...`
                      : document.content}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<CategoryIcon />}
                      label={document.category}
                      size="small"
                      color="primary"
                    />
                    {document.source_url && (
                      <Chip label="Has Source" size="small" variant="outlined" />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(document.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  {onDocumentSelect && (
                    <Button
                      size="small"
                      onClick={() => onDocumentSelect(document)}
                    >
                      Select
                    </Button>
                  )}
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditDocument(document)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteDocument(document.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {displayDocuments.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {searchQuery ? 'No documents found matching your search.' : 'No documents available.'}
          </Typography>
        </Box>
      )}

      {/* Create/Edit Document Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDocument ? 'Edit Document' : 'Create New Document'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              multiline
              rows={6}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Source URL (optional)"
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={editingDocument ? handleUpdateDocument : handleCreateDocument}
            variant="contained"
            disabled={!formData.title || !formData.content}
          >
            {editingDocument ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;
