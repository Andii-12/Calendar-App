import { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';

// Set up API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const ListModal = ({ list, isOpen, onClose, onUpdate }) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (list) {
      setNewItemTitle('');
      setNewItemDescription('');
      setShowAddForm(false);
      setEditingItem(null);
    }
  }, [list]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !list) return;

    try {
      await axios.post(`/api/lists/${list._id}/items`, {
        title: newItemTitle.trim(),
        description: newItemDescription.trim()
      });
      
      setNewItemTitle('');
      setNewItemDescription('');
      setShowAddForm(false);
      
      // Fetch the updated list data immediately
      const response = await axios.get(`/api/lists/${list._id}`);
      if (response.data) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleToggleItem = async (itemId) => {
    if (!list) return;

    try {
      await axios.patch(`/api/lists/${list._id}/items/${itemId}/toggle`);
      // Fetch the updated list data immediately
      const response = await axios.get(`/api/lists/${list._id}`);
      if (response.data) {
        // Update the list in the parent component
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!list) return;

    try {
      await axios.delete(`/api/lists/${list._id}/items/${itemId}`);
      
      // Fetch the updated list data immediately
      const response = await axios.get(`/api/lists/${list._id}`);
      if (response.data) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item._id);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!list || !editingItem) return;

    try {
      await axios.put(`/api/lists/${list._id}/items/${editingItem}`, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      
      setEditingItem(null);
      setEditTitle('');
      setEditDescription('');
      
      // Fetch the updated list data immediately
      const response = await axios.get(`/api/lists/${list._id}`);
      if (response.data) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditDescription('');
  };

  if (!isOpen || !list) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
              📋 {list.title}
            </h2>
            {list.description && (
              <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">{list.description}</p>
            )}
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Date: {new Date(list.listDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          {/* Items List */}
          <div className="space-y-2 sm:space-y-3">
            {list.items && list.items.length > 0 ? (
              list.items.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border ${
                    item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleItem(item._id)}
                    className={`mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {item.completed && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                  </button>

                  {/* Item Content */}
                  <div className="flex-1 min-w-0">
                    {editingItem === item._id ? (
                      <form onSubmit={handleSaveEdit} className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Item title"
                          required
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Item description (optional)"
                        />
                        <div className="flex space-x-1 sm:space-x-2">
                          <button
                            type="submit"
                            className="px-2 sm:px-3 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2 sm:px-3 py-1 bg-gray-500 text-white text-xs sm:text-sm rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <h3 className={`text-sm sm:text-base font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className={`text-xs sm:text-sm mt-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {editingItem !== item._id && (
                    <div className="flex space-x-0.5 sm:space-x-1">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit item"
                      >
                        <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No items in this list yet.</p>
                <p className="text-sm mt-1">Add your first item below!</p>
              </div>
            )}
          </div>

          {/* Add Item Form */}
          {showAddForm ? (
            <form onSubmit={handleAddItem} className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Add New Item</h3>
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Enter item title"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <input
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Enter item description (optional)"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 sm:mt-6 w-full py-2 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center text-sm"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Add New Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListModal;
