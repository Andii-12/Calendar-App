import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { Copy, Check, Code, Database, Users, Calendar, List, Monitor } from 'lucide-react';

const ApiDocumentation = () => {
  const { language } = useLanguage();
  const [copiedItem, setCopiedItem] = useState(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const copyToClipboard = (text, item) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const endpoints = [
    {
      category: 'events',
      icon: Calendar,
      color: 'blue',
      methods: [
        {
          method: 'GET',
          path: '/api/events',
          description: getTranslation(language, 'getEvents'),
          auth: true,
          response: `[
  {
    "_id": "event_id",
    "title": "Meeting",
    "description": "Team meeting",
    "startDate": "2024-12-01T09:00:00.000Z",
    "endDate": "2024-12-01T10:00:00.000Z",
    "allDay": false,
    "color": "#3b82f6",
    "userId": "user_id"
  }
]`
        },
        {
          method: 'POST',
          path: '/api/events',
          description: getTranslation(language, 'createEvent'),
          auth: true,
          parameters: {
            title: { type: 'string', required: true, description: getTranslation(language, 'title') },
            description: { type: 'string', required: false, description: getTranslation(language, 'description') },
            startDate: { type: 'date', required: true, description: 'Start date' },
            endDate: { type: 'date', required: true, description: 'End date' },
            allDay: { type: 'boolean', required: false, description: 'All day event' },
            color: { type: 'string', required: false, description: getTranslation(language, 'color') }
          },
          response: `{
  "_id": "event_id",
  "title": "New Event",
  "description": "Event description",
  "startDate": "2024-12-01T09:00:00.000Z",
  "endDate": "2024-12-01T10:00:00.000Z",
  "allDay": false,
  "color": "#3b82f6",
  "userId": "user_id"
}`
        },
        {
          method: 'PUT',
          path: '/api/events/:id',
          description: getTranslation(language, 'updateEvent'),
          auth: true,
          parameters: {
            title: { type: 'string', required: false, description: getTranslation(language, 'title') },
            description: { type: 'string', required: false, description: getTranslation(language, 'description') },
            startDate: { type: 'date', required: false, description: 'Start date' },
            endDate: { type: 'date', required: false, description: 'End date' },
            allDay: { type: 'boolean', required: false, description: 'All day event' },
            color: { type: 'string', required: false, description: getTranslation(language, 'color') }
          }
        },
        {
          method: 'DELETE',
          path: '/api/events/:id',
          description: getTranslation(language, 'deleteEvent'),
          auth: true
        }
      ]
    },
    {
      category: 'lists',
      icon: List,
      color: 'green',
      methods: [
        {
          method: 'GET',
          path: '/api/lists',
          description: getTranslation(language, 'getLists'),
          auth: true,
          response: `[
  {
    "_id": "list_id",
    "title": "Shopping List",
    "description": "Weekly shopping",
    "listDate": "2024-12-01T00:00:00.000Z",
    "items": [
      {
        "_id": "item_id",
        "title": "Milk",
        "description": "2% milk",
        "completed": false,
        "createdAt": "2024-12-01T08:00:00.000Z"
      }
    ],
    "userId": "user_id"
  }
]`
        },
        {
          method: 'POST',
          path: '/api/lists',
          description: getTranslation(language, 'createList'),
          auth: true,
          parameters: {
            title: { type: 'string', required: true, description: getTranslation(language, 'listTitle') },
            description: { type: 'string', required: false, description: getTranslation(language, 'listDescription') },
            listDate: { type: 'date', required: true, description: getTranslation(language, 'listDate') }
          }
        },
        {
          method: 'POST',
          path: '/api/lists/:id/items',
          description: getTranslation(language, 'addListItem'),
          auth: true,
          parameters: {
            title: { type: 'string', required: true, description: getTranslation(language, 'title') },
            description: { type: 'string', required: false, description: getTranslation(language, 'description') }
          }
        },
        {
          method: 'PATCH',
          path: '/api/lists/:listId/items/:itemId/toggle',
          description: getTranslation(language, 'toggleListItem'),
          auth: true
        },
        {
          method: 'DELETE',
          path: '/api/lists/:listId/items/:itemId',
          description: getTranslation(language, 'deleteListItem'),
          auth: true
        }
      ]
    },
    {
      category: 'users',
      icon: Users,
      color: 'purple',
      methods: [
        {
          method: 'POST',
          path: '/api/auth/register',
          description: getTranslation(language, 'register'),
          auth: false,
          parameters: {
            name: { type: 'string', required: true, description: getTranslation(language, 'name') },
            email: { type: 'string', required: true, description: getTranslation(language, 'email') },
            password: { type: 'string', required: true, description: getTranslation(language, 'password') }
          },
          response: `{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}`
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          description: getTranslation(language, 'login'),
          auth: false,
          parameters: {
            email: { type: 'string', required: true, description: getTranslation(language, 'email') },
            password: { type: 'string', required: true, description: getTranslation(language, 'password') }
          }
        }
      ]
    },
    {
      category: 'magicMirror',
      icon: Monitor,
      color: 'indigo',
      methods: [
        {
          method: 'GET',
          path: '/api/magic-mirror/all-users-today',
          description: 'Get ALL users\' today\'s events and lists (Magic Mirror filters by username)',
          auth: false,
          response: `{
  "date": "2024-12-01",
  "users": [
    {
      "userId": "user1_id",
      "username": "john_doe",
      "name": "John Doe",
      "events": [
        {
          "_id": "event1_id",
          "title": "Morning Meeting",
          "description": "Team standup",
          "startTime": "09:00",
          "endTime": "10:00",
          "color": "#3b82f6",
          "allDay": false
        }
      ],
      "lists": [
        {
          "_id": "list1_id",
          "title": "Today's Tasks",
          "description": "Daily tasks",
          "items": [
            {
              "_id": "item1_id",
              "title": "Buy groceries",
              "description": "Milk, bread, eggs",
              "completed": false
            }
          ]
        }
      ]
    },
    {
      "userId": "user2_id",
      "username": "jane_smith",
      "name": "Jane Smith",
      "events": [
        {
          "_id": "event2_id",
          "title": "Doctor Appointment",
          "description": "Annual checkup",
          "startTime": "14:00",
          "endTime": "15:00",
          "color": "#ef4444",
          "allDay": false
        }
      ],
      "lists": [
        {
          "_id": "list2_id",
          "title": "Work Tasks",
          "description": "Office work",
          "items": [
            {
              "_id": "item2_id",
              "title": "Review reports",
              "description": "Monthly reports",
              "completed": true
            }
          ]
        }
      ]
    }
  ],
  "summary": {
    "totalUsers": 2,
    "totalEvents": 2,
    "totalLists": 2
  }
}`
        }
      ]
    }
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'PATCH': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <Code className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">{getTranslation(language, 'apiDocumentation')}</h1>
              <p className="text-blue-100 mt-1">{getTranslation(language, 'baseUrl')}: {baseUrl}</p>
            </div>
          </div>
        </div>

        {/* Authentication Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            {getTranslation(language, 'authentication')}
          </h2>
          <p className="text-gray-600 mb-4">{getTranslation(language, 'authDescription')}</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{getTranslation(language, 'exampleRequest')}:</h3>
            <div className="flex items-center justify-between bg-gray-900 rounded p-3">
              <code className="text-green-400 text-sm">
                Authorization: Bearer your_jwt_token_here
              </code>
              <button
                onClick={() => copyToClipboard('Authorization: Bearer your_jwt_token_here', 'auth')}
                className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
              >
                {copiedItem === 'auth' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Magic Mirror Integration Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Monitor className="h-6 w-6 mr-2 text-indigo-600" />
            {getTranslation(language, 'magicMirrorIntegration')}
          </h2>
          <p className="text-gray-600 mb-4">{getTranslation(language, 'magicMirrorDescription')}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Magic Mirror Module Example */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{getTranslation(language, 'magicMirrorExample')}:</h3>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// Magic Mirror Module
Module.register("calendar-api", {
  // Set your username here to filter data
  username: "john_doe", // Change this to match your calendar username
  
  start: function() {
    this.userData = null;
    this.sendSocketNotification("GET_ALL_USERS_DATA");
  },
  
  socketNotificationReceived: function(notification, payload) {
    if (notification === "ALL_USERS_DATA") {
      // Filter data for this specific user
      this.userData = this.filterUserData(payload);
      this.updateDom();
    }
  },
  
  filterUserData: function(allUsersData) {
    // Find user data by username
    const user = allUsersData.users.find(u => u.username === this.username);
    return user || null;
  },
  
  getDom: function() {
    const wrapper = document.createElement("div");
    
    if (!this.userData) {
      wrapper.innerHTML = \`
        <div class="calendar-api">
          <h2>Loading...</h2>
        </div>
      \`;
      return wrapper;
    }
    
    // Display events
    let eventsHtml = '';
    if (this.userData.events && this.userData.events.length > 0) {
      eventsHtml = this.userData.events.map(event => \`
        <div class="event" style="border-left: 4px solid \${event.color};">
          <strong>\${event.title}</strong><br>
          <small>\${event.startTime} - \${event.endTime}</small>
        </div>
      \`).join('');
    }
    
    // Display lists
    let listsHtml = '';
    if (this.userData.lists && this.userData.lists.length > 0) {
      listsHtml = this.userData.lists.map(list => \`
        <div class="list">
          <h4>\${list.title}</h4>
          \${list.items.map(item => \`
            <div class="item \${item.completed ? 'completed' : ''}">
              \${item.completed ? '✓' : '○'} \${item.title}
            </div>
          \`).join('')}
        </div>
      \`).join('');
    }
    
    wrapper.innerHTML = \`
      <div class="calendar-api">
        <h2>\${this.userData.name}'s Schedule</h2>
        <div class="events">\${eventsHtml}</div>
        <div class="lists">\${listsHtml}</div>
      </div>
    \`;
    return wrapper;
  }
});`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`// Magic Mirror Module
Module.register("calendar-api", {
  // Set your username here to filter data
  username: "john_doe", // Change this to match your calendar username
  
  start: function() {
    this.userData = null;
    this.sendSocketNotification("GET_ALL_USERS_DATA");
  },
  
  socketNotificationReceived: function(notification, payload) {
    if (notification === "ALL_USERS_DATA") {
      // Filter data for this specific user
      this.userData = this.filterUserData(payload);
      this.updateDom();
    }
  },
  
  filterUserData: function(allUsersData) {
    // Find user data by username
    const user = allUsersData.users.find(u => u.username === this.username);
    return user || null;
  },
  
  getDom: function() {
    const wrapper = document.createElement("div");
    
    if (!this.userData) {
      wrapper.innerHTML = \`
        <div class="calendar-api">
          <h2>Loading...</h2>
        </div>
      \`;
      return wrapper;
    }
    
    // Display events
    let eventsHtml = '';
    if (this.userData.events && this.userData.events.length > 0) {
      eventsHtml = this.userData.events.map(event => \`
        <div class="event" style="border-left: 4px solid \${event.color};">
          <strong>\${event.title}</strong><br>
          <small>\${event.startTime} - \${event.endTime}</small>
        </div>
      \`).join('');
    }
    
    // Display lists
    let listsHtml = '';
    if (this.userData.lists && this.userData.lists.length > 0) {
      listsHtml = this.userData.lists.map(list => \`
        <div class="list">
          <h4>\${list.title}</h4>
          \${list.items.map(item => \`
            <div class="item \${item.completed ? 'completed' : ''}">
              \${item.completed ? '✓' : '○'} \${item.title}
            </div>
          \`).join('')}
        </div>
      \`).join('');
    }
    
    wrapper.innerHTML = \`
      <div class="calendar-api">
        <h2>\${this.userData.name}'s Schedule</h2>
        <div class="events">\${eventsHtml}</div>
        <div class="lists">\${listsHtml}</div>
      </div>
    \`;
    return wrapper;
  }
});`, 'magic-mirror-module')}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedItem === 'magic-mirror-module' ? 
                    <Check className="h-4 w-4 text-green-400" /> : 
                    <Copy className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>

            {/* Node Helper Example */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Node Helper Example:</h3>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// Node Helper
const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Calendar API helper started");
    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.getAllUsersData();
    }, 300000);
  },
  
  socketNotificationReceived: function(notification, payload) {
    if (notification === "GET_ALL_USERS_DATA") {
      this.getAllUsersData();
    }
  },
  
  getAllUsersData: function() {
    const options = {
      hostname: 'your-calendar-app.com',
      port: 443,
      path: '/api/magic-mirror/all-users-today',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const allUsersData = JSON.parse(data);
          this.sendSocketNotification("ALL_USERS_DATA", allUsersData);
        } catch (e) {
          console.error("Error parsing API response:", e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error("API request error:", e);
    });
    
    req.end();
  }
});`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`// Node Helper
const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Calendar API helper started");
    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.getAllUsersData();
    }, 300000);
  },
  
  socketNotificationReceived: function(notification, payload) {
    if (notification === "GET_ALL_USERS_DATA") {
      this.getAllUsersData();
    }
  },
  
  getAllUsersData: function() {
    const options = {
      hostname: 'your-calendar-app.com',
      port: 443,
      path: '/api/magic-mirror/all-users-today',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const allUsersData = JSON.parse(data);
          this.sendSocketNotification("ALL_USERS_DATA", allUsersData);
        } catch (e) {
          console.error("Error parsing API response:", e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error("API request error:", e);
    });
    
    req.end();
  }
});`, 'magic-mirror-helper')}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedItem === 'magic-mirror-helper' ? 
                    <Check className="h-4 w-4 text-green-400" /> : 
                    <Copy className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{getTranslation(language, 'endpoints')}</h2>
          
          {endpoints.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.category} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <IconComponent className={`h-5 w-5 mr-2 text-${category.color}-600`} />
                  {getTranslation(language, category.category)}
                </h3>
                
                <div className="space-y-4">
                  {category.methods.map((endpoint, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                          </div>
                          <div className="flex items-center space-x-2">
                            {endpoint.auth && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                {getTranslation(language, 'required')}
                              </span>
                            )}
                            <button
                              onClick={() => copyToClipboard(`${endpoint.method} ${baseUrl}${endpoint.path}`, `${category.category}-${index}`)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedItem === `${category.category}-${index}` ? 
                                <Check className="h-4 w-4 text-green-600" /> : 
                                <Copy className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
                      </div>
                      
                      <div className="p-4">
                        {endpoint.parameters && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">{getTranslation(language, 'parameters')}:</h4>
                            <div className="space-y-2">
                              {Object.entries(endpoint.parameters).map(([param, details]) => (
                                <div key={param} className="flex items-center space-x-4 text-sm">
                                  <code className="font-mono bg-gray-100 px-2 py-1 rounded">{param}</code>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    details.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {details.required ? getTranslation(language, 'required') : getTranslation(language, 'optional')}
                                  </span>
                                  <span className="text-gray-600">{getTranslation(language, details.type)}</span>
                                  <span className="text-gray-500">{details.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {endpoint.response && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">{getTranslation(language, 'response')}:</h4>
                            <div className="relative">
                              <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                                {endpoint.response}
                              </pre>
                              <button
                                onClick={() => copyToClipboard(endpoint.response, `response-${category.category}-${index}`)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                {copiedItem === `response-${category.category}-${index}` ? 
                                  <Check className="h-4 w-4 text-green-400" /> : 
                                  <Copy className="h-4 w-4" />
                                }
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
