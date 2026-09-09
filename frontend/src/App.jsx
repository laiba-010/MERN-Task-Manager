import { useEffect, useState } from 'react'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(
  JSON.parse(localStorage.getItem('user')) || null
)

  const [task, setTask] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
const [editText, setEditText] = useState('')

  // ================= AUTH =================

  const handleAuth = async () => {
    try {
      const url = isLogin
        ? 'https://mern-task-manager-production-4ee5.up.railway.app/api/auth/login'
        : 'https://mern-task-manager-production-4ee5.up.railway.app/api/auth/register'

      const body = isLogin
        ? { email, password }
        : { name, email, password }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
  setError(data.message || 'Something went wrong')
  return
}

       if (isLogin) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  setToken(data.token)
  setUser(data.user)
  setMessage('')
  setError('')
}else {
        setIsLogin(true)
        setMessage('Registration successful. Please login.')
        setError('')
        setName('')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
  setError('Unable to connect to server. Please make sure the server is running.')
  setMessage('')
}
  }

  // ================= LOAD TASKS =================

  useEffect(() => {
  if (!token) return

  setLoading(true)

  fetch('https://mern-task-manager-production-4ee5.up.railway.app/api/tasks', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setTasks(data)
      }
    })
   
    .catch((error) => {
  console.error('Error loading tasks:', error)
  setError('Unable to connect to server. Please try again.')
})
    .finally(() => {
      setLoading(false)
    })
}, [token])

  // ================= ADD TASK =================

  const addTask = async () => {
    if (task.trim() === '') return

    try {
      const response = await fetch('https://mern-task-manager-production-4ee5.up.railway.app/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: task.trim(),
        }),
      })

      const newTask = await response.json()

      if (!response.ok) {
        return
      }

      setTasks([newTask, ...tasks])
      setTask('')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // ================= TOGGLE TASK =================

  const toggleTask = async (id, completed) => {
    try {
      const response = await fetch(
        `https://mern-task-manager-production-4ee5.up.railway.app/api/tasks/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: !completed,
          }),
        }
      )

      const updatedTask = await response.json()

      setTasks(
        tasks.map((item) =>
          item._id === id ? updatedTask : item
        )
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }



  // ================= EDIT TASK =================

const updateTask = async (id) => {
  if (editText.trim() === '') return

  try {
    const response = await fetch(
      `https://mern-task-manager-production-4ee5.up.railway.app/api/tasks/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: editText.trim(),
        }),
      }
    )

    const updatedTask = await response.json()

    if (!response.ok) {
      console.error(updatedTask.message)
      return
    }

    setTasks(
      tasks.map((item) =>
        item._id === id ? updatedTask : item
      )
    )

    setEditingId(null)
    setEditText('')
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

  // ================= DELETE TASK =================

  const deleteTask = async (id) => {
    try {
      await fetch(`https://mern-task-manager-production-4ee5.up.railway.app/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setTasks(
        tasks.filter((item) => item._id !== id)
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // ================= LOGOUT =================

 const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  setToken(null)
  setUser(null)
  setTasks([])
}

  // ================= LOGIN / REGISTER =================

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.18),_transparent_35%)]"></div>

        <div className="relative w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-600/30">
              T
            </div>

            <h1 className="text-3xl font-bold text-white mt-4">
              TaskFlow
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your work. Stay productive.
            </p>

          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">

            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>

            <p className="text-slate-500 mt-1 mb-6">
              {isLogin
                ? 'Login to continue to your workspace.'
                : 'Create your account to start managing tasks.'}
            </p>

            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAuth()
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleAuth}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {message && (
              <p className="text-center text-sm text-blue-600 mt-4">
                {message}
              </p>
            )}
            {error && (
  <p className="text-center text-sm text-red-500 mt-4">
    {error}
  </p>
)}
            <div className="border-t border-slate-100 mt-6 pt-5 text-center">

              <span className="text-sm text-slate-500">
                {isLogin
                  ? "Don't have an account?"
                  : 'Already have an account?'}
              </span>

              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setMessage('')
                }}
                className="text-sm font-semibold text-blue-600 ml-1 hover:underline"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>

            </div>

          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Secure workspace powered by MERN stack
          </p>

        </div>
      </div>
    )
  }

  // ================= DASHBOARD =================

  const completedTasks = tasks.filter(
    (item) => item.completed
  ).length
 
  const filteredTasks = tasks.filter((item) => {
  const matchesFilter =
    activeFilter === 'completed'
      ? item.completed
      : activeFilter === 'pending'
      ? !item.completed
      : true

  const matchesSearch = item.text
    .toLowerCase()
    .includes(searchTerm.toLowerCase())

  return matchesFilter && matchesSearch
})

  const pendingTasks = tasks.length - completedTasks

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks / tasks.length) * 100)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= SIDEBAR ================= */}

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-950 text-white flex-col">

        <div className="px-6 py-7">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
              T
            </div>

            <div>
              <h1 className="font-bold text-lg">
                TaskFlow
              </h1>

              <p className="text-xs text-slate-400">
                Productivity workspace
              </p>
            </div>

          </div>

        </div>

        <nav className="px-4 space-y-2">

          <button
  onClick={() => setActiveFilter('all')}
  className={`w-full text-left rounded-xl px-4 py-3 font-medium transition ${
    activeFilter === 'all'
      ? 'bg-blue-600/15 text-blue-400'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`}
>
  <span className="mr-3">▦</span>
  My Tasks
</button>

         <button
  onClick={() => setActiveFilter('completed')}
  className={`w-full text-left rounded-xl px-4 py-3 transition ${
    activeFilter === 'completed'
      ? 'bg-blue-600/15 text-blue-400 font-medium'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`}
>
  <span className="mr-3">✓</span>
  Completed
</button>


          <button
  onClick={() => setActiveFilter('pending')}
  className={`w-full text-left rounded-xl px-4 py-3 transition ${
    activeFilter === 'pending'
      ? 'bg-blue-600/15 text-blue-400 font-medium'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`}
>
  <span className="mr-3">◷</span>
  Pending
</button>



        </nav>

        <div className="mt-auto p-4">

          <div className="bg-slate-900 rounded-2xl p-4 mb-4">

            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Workspace
            </p>

            <p className="text-sm font-medium mt-1">
              Personal Tasks
            </p>

          </div>

          <button
            onClick={logout}
            className="w-full text-left text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 transition"
          >
            <span className="mr-3">↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="lg:ml-64">

        {/* Header */}

        <header className="bg-white border-b border-slate-200">

          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex justify-between items-center">

            <div>

              <p className="text-sm text-slate-500">
                Personal Workspace
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
  Welcome back, {user?.name || 'User'} 👋
</h1>

            </div>

            <button
              onClick={logout}
              className="lg:hidden bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>

            <div className="hidden sm:flex items-center gap-3">

              <div className="text-right">

                <p className="font-semibold text-slate-800">
                  {user?.name || 'User'}
                </p>

                <p className="text-xs text-slate-500">
                  Full Stack Developer
                </p>

              </div>

              <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

            </div>

          </div>

        </header>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

          {/* ================= WELCOME CARD ================= */}

          <section className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">

            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl"></div>

            <div className="relative">

              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                Task Management Dashboard
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold mt-3">
                Stay focused. Get things done.
              </h2>

              <p className="text-slate-400 mt-3 max-w-2xl">
                Manage your daily work, track your progress,
                and keep everything organized in one place.
              </p>

            </div>

          </section>

          {/* ================= STATS ================= */}

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <p className="text-sm text-slate-500">
                Total Tasks
              </p>

              <div className="flex items-end justify-between mt-2">

                <h3 className="text-3xl font-bold text-slate-900">
                  {tasks.length}
                </h3>

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  ☰
                </div>

              </div>

            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <p className="text-sm text-slate-500">
                Completed
              </p>

              <div className="flex items-end justify-between mt-2">

                <h3 className="text-3xl font-bold text-slate-900">
                  {completedTasks}
                </h3>

                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  ✓
                </div>

              </div>

            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <p className="text-sm text-slate-500">
                Pending
              </p>

              <div className="flex items-end justify-between mt-2">

                <h3 className="text-3xl font-bold text-slate-900">
                  {pendingTasks}
                </h3>

                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  ◷
                </div>

              </div>

            </div>

          </section>

          {/* ================= PROGRESS ================= */}

          <section className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">

            <div className="flex justify-between items-center mb-3">

              <div>

                <h3 className="font-bold text-slate-900">
                  Overall Progress
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Keep going — you're making progress.
                </p>

              </div>

              <span className="text-2xl font-bold text-blue-600">
                {progress}%
              </span>

            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>

            </div>

            <p className="text-xs text-slate-500 mt-3">
              {completedTasks} of {tasks.length} tasks completed
            </p>

          </section>

          {/* ================= TASK SECTION ================= */}

          <section className="mt-8">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  WORKSPACE
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  My Tasks
                </h2>

              </div>

              <p className="text-sm text-slate-500">
                {pendingTasks} task{pendingTasks !== 1 ? 's' : ''} remaining
              </p>

            </div>


            {/* Search Tasks */}

<div className="bg-white border border-slate-200 rounded-2xl p-3 mb-3 flex items-center gap-3 shadow-sm">

  <span className="text-slate-400 text-lg">
    🔍
  </span>

  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search tasks..."
    className="flex-1 px-2 py-2 outline-none text-slate-800 placeholder:text-slate-400"
  />

  {searchTerm && (
    <button
      onClick={() => setSearchTerm('')}
      className="text-sm text-slate-400 hover:text-slate-700"
    >
      Clear
    </button>
  )}

</div>

            {/* Add Task */}

            <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row gap-3 shadow-sm">

              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask()
                }}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 outline-none text-slate-800 placeholder:text-slate-400"
              />

              <button
                onClick={addTask}
                className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold transition"
              >
                + Add Task
              </button>

            </div>

            {/* Task List */}

<div className="mt-5 space-y-3">

  {loading ? (
  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
    <div className="w-10 h-10 mx-auto border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>

    <h3 className="font-bold text-slate-800 mt-4">
      Loading tasks...
    </h3>

    <p className="text-sm text-slate-500 mt-1">
      Please wait while your tasks are loading.
    </p>
  </div>

) : filteredTasks.length === 0 ? (

    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">

      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
        ✓
      </div>

      <h3 className="font-bold text-slate-800 mt-4">
        {activeFilter === 'completed'
          ? 'No completed tasks'
          : activeFilter === 'pending'
          ? 'No pending tasks'
          : 'No tasks yet'}
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        Add your first task to start tracking your work.
      </p>

    </div>

  ) : (

    filteredTasks.map((item) => (

      <div
        key={item._id}
        className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 hover:shadow-md hover:border-slate-300 transition"
      >

        {/* LEFT SIDE */}

        <div className="flex items-center gap-4 min-w-0 flex-1">

          {/* Checkbox */}

          <button
            onClick={() =>
              toggleTask(item._id, item.completed)
            }
            className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition ${
              item.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 hover:border-blue-500'
            }`}
          >
            {item.completed && '✓'}
          </button>

          {/* Task Text */}

          <div className="min-w-0 flex-1">

            {editingId === item._id ? (

              <div className="flex flex-col sm:flex-row gap-2">

                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateTask(item._id)
                    }

                    if (e.key === 'Escape') {
                      setEditingId(null)
                      setEditText('')
                    }
                  }}
                  autoFocus
                  className="flex-1 border border-blue-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={() => updateTask(item._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setEditingId(null)
                    setEditText('')
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>

              </div>

            ) : (

              <>
                <p
                  className={`font-medium break-words ${
                    item.completed
                      ? 'line-through text-slate-400'
                      : 'text-slate-800'
                  }`}
                >
                  {item.text}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {item.completed
                    ? 'Completed'
                    : 'In progress'}
                </p>
              </>

            )}

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-3 shrink-0">

          {editingId !== item._id && (

            <button
              onClick={() => {
                setEditingId(item._id)
                setEditText(item.text)
              }}
              className="text-sm font-medium text-slate-400 hover:text-blue-600 transition"
            >
              Edit
            </button>

          )}

          <button
            onClick={() => deleteTask(item._id)}
            className="text-sm font-medium text-slate-400 hover:text-red-500 transition"
          >
            Delete
          </button>

        </div>

      </div>

    ))

  )}

</div>
          </section>

          {/* ================= FOOTER ================= */}

          <footer className="border-t border-slate-200 mt-12 pt-6 pb-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">

            <p>
              TaskFlow · MERN Stack Project
            </p>

            <p>
              MongoDB · Express · React · Node.js
            </p>

          </footer>

        </div>

      </main>

    </div>
  )
}

export default App