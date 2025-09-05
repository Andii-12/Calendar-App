import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Trash2, Save } from 'lucide-react';

const EventModal = ({ event, selectedDate, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#3b82f6'
  });

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  useEffect(() => {
    console.log('EventModal useEffect triggered:', {
      event: event ? 'editing existing event' : 'creating new event',
      selectedDate: selectedDate.toISOString(),
      selectedDateString: selectedDate.toDateString()
    });
    
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        color: event.color || '#3b82f6'
      });
    } else {
      // For new events, use the selected date automatically
      setFormData({
        title: '',
        description: '',
        color: '#3b82f6'
      });
    }
  }, [event, selectedDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get the date components from selectedDate
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed, but we want 1-indexed
    const day = selectedDate.getDate();
    
    // Create date strings in YYYY-MM-DD format
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Create dates in local timezone to avoid timezone conversion issues
    const startDate = new Date(year, selectedDate.getMonth(), day, 0, 0, 0, 0);
    const endDate = new Date(year, selectedDate.getMonth(), day, 23, 59, 59, 999);

    const eventData = {
      title: formData.title,
      description: formData.description,
      startDate: startDate,
      endDate: endDate,
      allDay: true,
      color: formData.color
    };

    console.log('Saving event with dates (Local Timezone):', {
      selectedDate: selectedDate.toISOString(),
      selectedDateLocal: selectedDate.toLocaleDateString(),
      year, month, day,
      dateString,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateLocal: startDate.toLocaleDateString(),
      endDateLocal: endDate.toLocaleDateString(),
      eventData
    });

    onSave(eventData);
  };

  const handleDelete = () => {
    if (event && window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event._id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {event ? 'Edit Event' : 'Add Event'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Event title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Event description"
            />
          </div>


          {/* Color Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex space-x-1 sm:space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-3 sm:pt-4">
            <div>
              {event && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-red-300 text-xs sm:text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {event ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
