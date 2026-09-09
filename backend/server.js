const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const Task = require('./models/Task')
const authRoutes = require('./routes/authRoutes')
const authMiddleware = require('./middleware/authMiddleware')

const app = express()

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully')
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
  })

// Middleware
app.use(cors())
app.use(express.json())

// Authentication routes
app.use('/api/auth', authRoutes)

// GET - Get only logged-in user's tasks
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get tasks',
    })
  }
})

// POST - Add a new task
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body

    if (!text || text.trim() === '') {
      return res.status(400).json({
        message: 'Task text is required',
      })
    }

    const newTask = await Task.create({
      text: text.trim(),
      user: req.user.userId,
    })

    res.status(201).json(newTask)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create task',
    })
  }
})

// PUT - Update only user's task
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = {}

    if (req.body.text !== undefined) {
      updateData.text = req.body.text
    }

    if (req.body.completed !== undefined) {
      updateData.completed = req.body.completed
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updatedTask) {
      return res.status(404).json({
        message: 'Task not found',
      })
    }

    res.json(updatedTask)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update task',
    })
  }
})

// DELETE - Delete only user's task
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    })

    if (!deletedTask) {
      return res.status(404).json({
        message: 'Task not found',
      })
    }

    res.json({
      message: 'Task deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete task',
    })
  }
})

// Start server
const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})