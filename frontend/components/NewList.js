import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Calendar, Check, X } from 'lucide-react';
import axios from 'axios';

// Set up API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const NewList = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listDate: ''
  });
  const [newListName, setNewListName] = useState('');
  const [showAddListForm, setShowAddListForm] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get('/api/lists');
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      if (editingList) {
        await axios.put(`/api/lists/${editingList._id}`, formData);
      } else {
        await axios.post('/api/lists', formData);
      }
      await fetchLists();
      resetForm();
    } catch (error) {
      console.error('Error saving list:', error);
    }
  };

  const handleAddList = async () => {
    if (!newListName.trim()) return;
    
    try {
      await axios.post('/api/lists', {
        title: newListName,
        description: '',
        listDate: new Date().toISOString().split('T')[0], // Default to today
        items: []
      });
      setNewListName('');
      setShowAddListForm(false);
      await fetchLists();
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await axios.delete(`/api/lists/${listId}`);
        await fetchLists();
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setFormData({
      title: list.title,
      description: list.description || '',
      listDate: list.listDate ? new Date(list.listDate).toISOString().split('T')[0] : ''
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      listDate: ''
    });
    setEditingList(null);
    setShowCreateForm(false);
  };

  const handleAddItem = async (listId, itemTitle, itemDescription) => {
    if (!itemTitle.trim()) return;
    
    try {
      await axios.post(`/api/lists/${listId}/items`, {
        title: itemTitle,
        description: itemDescription || ''
      });
      await fetchLists();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleToggleItem = async (listId, itemId) => {
    try {
      await axios.patch(`/api/lists/${listId}/items/${itemId}/toggle`);
      await fetchLists();
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    try {
      await axios.delete(`/api/lists/${listId}/items/${itemId}`);
      await fetchLists();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New List</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create List
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleCreateList} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter list title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Date *
              </label>
              <input
                type="date"
                value={formData.listDate}
                onChange={(e) => setFormData({ ...formData, listDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingList ? 'Update' : 'Create'} List
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter list name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
          />
          <button
            onClick={handleAddList}
            disabled={!newListName.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Lists */}
      <div className="space-y-4">
        {lists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No lists yet. Create one to get started!</p>
          </div>
        ) : (
          lists.map((list) => (
            <ListComponent
              key={list._id}
              list={list}
              onAddItem={handleAddItem}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onEditList={handleEditList}
              onDeleteList={handleDeleteList}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual List Component
const ListComponent = ({ list, onAddItem, onToggleItem, onDeleteItem, onEditList, onDeleteList }) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    onAddItem(list._id, newItemTitle, newItemDescription);
    setNewItemTitle('');
    setNewItemDescription('');
    setShowAddItemForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* List Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{list.title}</h3>
            {list.description && (
              <p className="text-sm text-gray-600 mt-1">{list.description}</p>
            )}
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Date: {new Date(list.listDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEditList(list)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteList(list._id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        {!showAddItemForm ? (
          <button
            onClick={() => setShowAddItemForm(true)}
            className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Enter item title"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            
            {/* Description Section */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter item description (optional)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowAddItemForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List Items */}
      <div className="divide-y divide-gray-200">
        {list.items && list.items.length > 0 ? (
          list.items.map((item) => (
            <div
              key={item._id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                item.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => onToggleItem(list._id, item._id)}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {item.completed && <Check className="h-3 w-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`text-sm font-medium ${
                      item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                  </div>

                  {item.description && (
                    <p className={`text-sm ${
                      item.completed ? 'line-through text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onDeleteItem(list._id, item._id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            No items yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default NewList;
