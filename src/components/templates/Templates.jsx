import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Clock, FileText, Palette,
  Star, Trash2, Grid, List,
  ChevronRight, Sparkles, Users, Calendar,
  Copy, Eye, Filter, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectedUserId } from '../../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

const TemplatesPage = () => {
  const navigate = useNavigate();
  const userId = useSelector(selectedUserId);
  const [templates, setTemplates] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const dummyRecentDocs = [
    { id: 1, name: 'Marketing Proposal', date: '2025-12-24', type: 'proposal' },
    { id: 2, name: 'Contract Agreement', date: '2025-12-23', type: 'contract' },
    { id: 3, name: 'Invoice Template', date: '2025-12-22', type: 'invoice' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : 'General';

  const getThumbnailUrl = (template) => {
    if (template.thumbnail && template.thumbnail !== 'null') return template.thumbnail;

    if (template.templateData?.blocks) {
      for (const block of template.templateData.blocks) {
        if (block.settings?.backgroundImage) {
          return block.settings.backgroundImage;
        }
      }
    }
    return null;
  };

  const handlePreview = (template) => {
    if (template.link) {
      const url = new URL(template.link);
      navigate(url.pathname + url.search);
    } else {
      toast.info('Preview not available');
    }
  };

  const fetchTemplates = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/temp/${userId}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data || []);
      } else {
        toast.error('Failed to load templates');
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    setRecentDocuments(dummyRecentDocs);
  }, [userId]);

  const handleUseTemplate = async (templateId) => {
    try {
      const response = await fetch(`${API_URL}/api/templates/${templateId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Template loaded successfully!');
        navigate('/editor', { state: { templateData: data.data } });
      } else {
        toast.error('Failed to load template');
      }
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to load template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`${API_URL}/api/templates/${templateId}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        toast.success('Template deleted successfully');
        fetchTemplates();
        setShowDeleteModal(false);
      } else {
        toast.error(data.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleCreateNewTemplate = () => {
    navigate('/template-builder', { state: { isNewTemplate: true } });
  };

  const handleOpenThemeSetup = () => {
    navigate('/theme-setup');
  };

  const filteredTemplates = templates
    .filter((template) => {
      if (filter === 'my') return !template.isShared && !template.isEmpty;
      if (filter === 'shared') return template.isShared;
      if (filter === 'empty') return template.isEmpty;
      return true;
    })
    .filter(
      (template) =>
        template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filterOptions = [
    { value: 'all', label: 'All Templates', icon: <Grid size={18} /> },
    { value: 'my', label: 'My Templates', icon: <FileText size={18} /> },
    { value: 'shared', label: 'Shared', icon: <Users size={18} /> },
    { value: 'empty', label: 'Blank', icon: <FileText size={18} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                My Templates
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Choose a template or start from scratch
              </p>
            </div>
            <button
              onClick={handleCreateNewTemplate}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold text-base flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 w-full lg:w-auto justify-center"
            >
              <Plus size={20} />
              Create New Template
            </button>
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-base transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List size={20} />
                </button>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Filter size={18} />
                  <span className="font-medium">
                    {filterOptions.find(opt => opt.value === filter)?.label || 'Filter'}
                  </span>
                </button>
                
                {showFilterDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowFilterDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilter(option.value);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            filter === option.value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                          }`}
                        >
                          {option.icon}
                          <span className="font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Theme Builder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
                  <Palette className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Design your brand</h3>
                  <p className="text-gray-600 text-sm">Custom theme builder</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Create a beautiful, consistent look across all your documents with custom colors, fonts, and layouts.
              </p>
              <button
                onClick={handleOpenThemeSetup}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-shadow"
              >
                <Sparkles size={18} />
                Open Theme Setup
              </button>
            </div>

            {/* Recent Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {recentDocuments.length}
                </span>
              </div>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group bg-gray-50 rounded-xl p-4 flex justify-between items-center hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white rounded-xl p-2.5 shadow-xs border border-gray-200">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                          <Calendar size={14} />
                          {formatDate(doc.date)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="w-full mt-6 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                View All Documents
              </button>
            </div>
          </div>

          {/* Main Templates Area */}
          <div className="lg:col-span-8">
            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 text-sm mb-6">
                  {searchTerm ? `No results for "${searchTerm}"` : 'Start by creating your first template'}
                </p>
                <button
                  onClick={handleCreateNewTemplate}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
                >
                  Create Template
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => {
                  const thumbnailUrl = getThumbnailUrl(template);
                  return (
                    <div
                      key={template.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={template.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${thumbnailUrl ? 'hidden' : 'flex'}`}>
                          <FileText className="w-12 h-12 text-gray-400" />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Preview"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => toast.info('Copy coming soon')}
                            className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Duplicate"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowDeleteModal(true);
                            }}
                            className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {template.isFavorite && (
                            <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Star size={12} fill="currentColor" />
                              Favorite
                            </div>
                          )}
                          {template.isShared && (
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Users size={12} />
                              Shared
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-1">
                              {template.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                {capitalize(template.category)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {template.description === 'No description' ? 'Custom template' : template.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold block">
                              {template.uses} uses
                            </span>
                            {template.from && (
                              <p className="text-gray-500 text-xs mt-2">By {template.from.name || 'You'}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Clock size={14} />
                            <span>{formatDate(template.createdAt)}</span>
                          </div>
                          <button
                            onClick={() => handleUseTemplate(template.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                          >
                            <FileText size={16} />
                            Use
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredTemplates.map((template) => {
                  const thumbnailUrl = getThumbnailUrl(template);
                  return (
                    <div
                      key={template.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          {thumbnailUrl ? (
                            <img 
                              src={thumbnailUrl} 
                              alt={template.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {template.isFavorite && (
                            <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs">
                              <Star size={10} fill="currentColor" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                                {template.name}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {capitalize(template.category)}
                                </span>
                                {template.isShared && (
                                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                    Shared
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {template.description === 'No description' ? 'Custom template' : template.description}
                              </p>
                            </div>
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold ml-4">
                              {template.uses} uses
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-gray-500 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} />
                                {formatDate(template.createdAt)}
                              </div>
                              {template.from && (
                                <span>By {template.from.name || 'You'}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePreview(template)}
                                className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleUseTemplate(template.id)}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                              >
                                <FileText size={14} />
                                Use
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="bg-red-50 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Template?</h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete "<span className="font-medium">{selectedTemplate.name}</span>"?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;