import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { Calendar as CalendarIcon, List, LogOut, User, RefreshCw, Code } from 'lucide-react';

// Set up API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import Calendar from './Calendar';
import NewList from './NewList';
import EventModal from './EventModal';
import ListModal from './ListModal';
import LanguageSwitcher from './LanguageSwitcher';
import ApiDocumentation from './ApiDocumentation';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [lists, setLists] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async (isRefresh = false) => {
    if (!user) {
      console.log('No user authenticated, skipping event fetch');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    if (!token) {
      console.log('No token found, skipping event fetch');
      setEvents([]);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('Fetching events with token...');
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error fetching events:', response.status, errorData.message);
        setEvents([]);
        return;
      }

      const data = await response.json();
      console.log('Events fetched:', data);
      if (Array.isArray(data)) {
        console.log('Events details:', data.map(event => ({
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          startDateString: new Date(event.startDate).toDateString(),
          endDateString: new Date(event.endDate).toDateString()
        })));
        setEvents(data);
      } else {
        console.error('Fetched data is not an array:', data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Network or parsing error fetching events:', error);
      setEvents([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchLists = async () => {
    if (!user) {
      console.log('No user authenticated, skipping lists fetch');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    if (!token) {
      console.log('No token found, skipping lists fetch');
      setLists([]);
      return;
    }

    try {
      console.log('Fetching lists with token...');
      const response = await fetch(`${API_BASE_URL}/api/lists`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error fetching lists:', response.status, errorData.message);
        setLists([]);
        return;
      }

      const data = await response.json();
      console.log('Lists fetched:', data);
      if (Array.isArray(data)) {
        setLists(data);
      } else {
        console.error('Fetched lists data is not an array:', data);
        setLists([]);
      }
    } catch (error) {
      console.error('Network or parsing error fetching lists:', error);
      setLists([]);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleListClick = (list) => {
    setSelectedList(list);
    setShowListModal(true);
  };

  const handleListModalClose = () => {
    setShowListModal(false);
    setSelectedList(null);
  };

  const handleListUpdate = (updatedList) => {
    if (updatedList) {
      // Update the specific list in the lists array
      setLists(prevLists => 
        prevLists.map(list => 
          list._id === updatedList._id ? updatedList : list
        )
      );
      // Also update the selectedList if it's the same list
      if (selectedList && selectedList._id === updatedList._id) {
        setSelectedList(updatedList);
      }
    } else {
      // Fallback: refresh both events and lists
      fetchEvents();
      fetchLists();
    }
  };

  const handleDateClick = (date) => {
    console.log('Date clicked:', {
      date: date.toISOString(),
      dateString: date.toDateString(),
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate()
    });
    console.log('Current selectedDate before update:', selectedDate.toISOString());
    setSelectedDate(date);
    setModalDate(date); // Set the modal date immediately
    console.log('selectedDate and modalDate updated to:', date.toISOString());
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventSave = async (eventData) => {
    try {
      const url = selectedEvent ? `${API_BASE_URL}/api/events/${selectedEvent._id}` : `${API_BASE_URL}/api/events`;
      const method = selectedEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        await fetchEvents();
        setShowModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
        }
      });

      if (response.ok) {
        await fetchEvents();
        setShowModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Load events and lists when component mounts and user is authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching events and lists...');
      fetchEvents();
      fetchLists();
    }
  }, [user]);

  // Refresh events and lists when switching to calendar tab
  useEffect(() => {
    if (user && activeTab === 'calendar') {
      console.log('Switching to calendar tab, refreshing events and lists...');
      fetchEvents();
      fetchLists();
    }
  }, [activeTab, user]);

  // Force refresh events on component mount if user is already authenticated
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Component mounted with existing user, fetching events...');
        fetchEvents();
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{getTranslation(language, 'appTitle')}</h1>
              {activeTab === 'calendar' && !showModal && (
                <button
                  onClick={() => fetchEvents(true)}
                  disabled={refreshing}
                  className={`ml-2 sm:ml-4 p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors ${
                    refreshing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Refresh events"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span className="truncate max-w-32">{getTranslation(language, 'welcome')}, {user?.name}</span>
              </div>
              <LanguageSwitcher />
              <button
                onClick={logout}
                className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{getTranslation(language, 'logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{getTranslation(language, 'calendar')}</span>
              <span className="sm:hidden">{getTranslation(language, 'cal')}</span>
            </button>
            <button
              onClick={() => setActiveTab('lists')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'lists'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{getTranslation(language, 'newList')}</span>
              <span className="sm:hidden">{getTranslation(language, 'lists')}</span>
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Code className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{getTranslation(language, 'api')}</span>
              <span className="sm:hidden">API</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {activeTab === 'calendar' && (
          <>
            {console.log('Rendering Calendar with events:', events)}
            <Calendar
              events={events}
              lists={lists}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onListClick={handleListClick}
            />
          </>
        )}
        
        {activeTab === 'lists' && <NewList />}
        
        {activeTab === 'api' && <ApiDocumentation />}
      </main>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={selectedEvent}
          selectedDate={modalDate}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* List Modal */}
      <ListModal
        list={selectedList}
        isOpen={showListModal}
        onClose={handleListModalClose}
        onUpdate={handleListUpdate}
      />
    </div>
  );
};

export default Dashboard;
