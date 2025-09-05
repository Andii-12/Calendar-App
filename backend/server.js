const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Event Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', eventSchema);

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Todo = mongoose.model('Todo', todoSchema);

// List Schema
const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  listDate: {
    type: Date,
    required: true
  },
  items: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const List = mongoose.model('List', listSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Calendar API is running!' });
});

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events (with user filter)
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.userId }).sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get events by date range
app.get('/api/events/range', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const events = await Event.find({
      userId: req.user.userId,
      startDate: { $gte: new Date(start) },
      endDate: { $lte: new Date(end) }
    }).sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
app.get('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    console.log('Creating event with data:', req.body);
    
    // Ensure dates are properly handled
    const eventData = {
      ...req.body,
      userId: req.user.userId,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate)
    };
    
    console.log('Processed event dates:', {
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      startISO: eventData.startDate.toISOString(),
      endISO: eventData.endDate.toISOString()
    });
    
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update event
app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Updating event with data:', req.body);
    
    // Ensure dates are properly handled
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    if (req.body.startDate) {
      updateData.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      updateData.endDate = new Date(req.body.endDate);
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete event
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Todo Routes
// Get all todos
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single todo
app.get('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new todo
app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const todo = new Todo({ ...req.body, userId: req.user.userId });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update todo
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle todo completion
app.patch('/api/todos/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todo.completed = !todo.completed;
    todo.updatedAt = new Date();
    await todo.save();
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Routes
// Get all lists
app.get('/api/lists', authenticateToken, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single list
app.get('/api/lists/:id', authenticateToken, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new list
app.post('/api/lists', authenticateToken, async (req, res) => {
  try {
    const list = new List({ ...req.body, userId: req.user.userId });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update list
app.put('/api/lists/:id', authenticateToken, async (req, res) => {
  try {
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete list
app.delete('/api/lists/:id', authenticateToken, async (req, res) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to list
app.post('/api/lists/:id/items', authenticateToken, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    const newItem = {
      title: req.body.title,
      description: req.body.description || ''
    };
    
    list.items.push(newItem);
    list.updatedAt = new Date();
    await list.save();
    
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle item completion
app.patch('/api/lists/:listId/items/:itemId/toggle', authenticateToken, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    item.completed = !item.completed;
    list.updatedAt = new Date();
    await list.save();
    
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item from list
app.delete('/api/lists/:listId/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.listId, userId: req.user.userId });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    list.items.pull(req.params.itemId);
    list.updatedAt = new Date();
    await list.save();
    
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Magic Mirror API - Get all users' data for a specific date or today
app.get('/api/magic-mirror/all-users-today', async (req, res) => {
  try {
    // Allow date parameter in query string, default to today
    let targetDate = req.query.date ? new Date(req.query.date) : new Date();
    
    // Convert to UTC to match database storage
    const utcTargetDate = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000));
    utcTargetDate.setUTCHours(0, 0, 0, 0);
    
    const utcNextDay = new Date(utcTargetDate);
    utcNextDay.setUTCDate(utcNextDay.getUTCDate() + 1);

    console.log('Fetching data for date:', targetDate.toISOString().split('T')[0]);
    console.log('UTC target date range:', utcTargetDate.toISOString(), 'to', utcNextDay.toISOString());

    // Get all users
    const users = await User.find({}, 'name email').lean();
    
    const usersData = [];
    
    for (const user of users) {
      // Get events for the target date (using UTC)
      const events = await Event.find({
        userId: user._id,
        startDate: {
          $gte: utcTargetDate,
          $lt: utcNextDay
        }
      }).lean();

      // Get lists for the target date (using UTC)
      const lists = await List.find({
        userId: user._id,
        listDate: {
          $gte: utcTargetDate,
          $lt: utcNextDay
        }
      }).lean();

      // Debug: Check all events and lists for this user
      const allEvents = await Event.find({ userId: user._id }).lean();
      const allLists = await List.find({ userId: user._id }).lean();
      
      console.log(`User ${user.email}: Found ${events.length} events, ${lists.length} lists`);
      console.log(`All events for user:`, allEvents.map(e => ({ title: e.title, startDate: e.startDate })));
      console.log(`All lists for user:`, allLists.map(l => ({ title: l.title, listDate: l.listDate })));
      console.log(`UTC target date range: ${utcTargetDate.toISOString()} to ${utcNextDay.toISOString()}`);

      // Create username from email (before @)
      const username = user.email.split('@')[0];

      usersData.push({
        name: user.name,
        events: events.map(event => ({
          _id: event._id,
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          color: event.color,
          allDay: event.allDay
        })),
        lists: lists.map(list => ({
          _id: list._id,
          title: list.title,
          description: list.description,
          items: list.items.map(item => ({
            _id: item._id,
            title: item.title,
            description: item.description,
            completed: item.completed
          }))
        }))
      });
    }

    res.json({
      date: targetDate.toISOString().split('T')[0],
      users: usersData,
      summary: {
        totalUsers: usersData.length,
        totalEvents: usersData.reduce((sum, user) => sum + user.events.length, 0),
        totalLists: usersData.reduce((sum, user) => sum + user.lists.length, 0)
      }
    });
  } catch (error) {
    console.error('Magic Mirror API error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Magic Mirror API - Get future events and lists (today and beyond)
app.get('/api/magic-mirror/future-data', async (req, res) => {
  try {
    const today = new Date();
    const utcToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    utcToday.setUTCHours(0, 0, 0, 0);

    console.log('Fetching future data from:', utcToday.toISOString());

    const users = await User.find({}, 'name email').lean();
    const usersData = [];
    
    for (const user of users) {
      // Get future events (today and beyond)
      const events = await Event.find({
        userId: user._id,
        startDate: { $gte: utcToday }
      }).sort({ startDate: 1 }).lean();

      // Get future lists (today and beyond)
      const lists = await List.find({
        userId: user._id,
        listDate: { $gte: utcToday }
      }).sort({ listDate: 1 }).lean();

      usersData.push({
        name: user.name,
        events: events.map(event => ({
          _id: event._id,
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          color: event.color,
          allDay: event.allDay,
          startDate: event.startDate
        })),
        lists: lists.map(list => ({
          _id: list._id,
          title: list.title,
          description: list.description,
          listDate: list.listDate,
          items: list.items.map(item => ({
            _id: item._id,
            title: item.title,
            description: item.description,
            completed: item.completed
          }))
        }))
      });
    }
    
    res.json({
      message: "Future events and lists (today and beyond)",
      date: today.toISOString().split('T')[0],
      users: usersData,
      summary: {
        totalUsers: usersData.length,
        totalEvents: usersData.reduce((sum, user) => sum + user.events.length, 0),
        totalLists: usersData.reduce((sum, user) => sum + user.lists.length, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug API - Get all data without date filtering
app.get('/api/magic-mirror/debug-all-data', async (req, res) => {
  try {
    const users = await User.find({}, 'name email').lean();
    const usersData = [];
    
    for (const user of users) {
      const allEvents = await Event.find({ userId: user._id }).lean();
      const allLists = await List.find({ userId: user._id }).lean();
      
      usersData.push({
        userId: user._id,
        username: user.email.split('@')[0],
        name: user.name,
        events: allEvents,
        lists: allLists
      });
    }
    
    res.json({
      message: "All data without date filtering",
      users: usersData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
