'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type User = {
    id: string
    name: string
    username: string
    role: string
}

type ProjectTodo = {
    id: string
    projectId: string
    text: string
    checked: boolean
    checkedBy: string | null
    creator: User
    checker: User | null
    createdAt: string
}

type ProjectMember = {
    id: string
    projectId: string
    userId: string
    user: User
}

type Project = {
    id: string
    name: string
    description: string
    createdAt: string
    members: ProjectMember[]
    todos: ProjectTodo[]
}

export function ProjectsPanel() {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === 'admin'

    const [view, setView] = useState<'MY_PROJECTS' | 'PROJECT_TRACKER'>('MY_PROJECTS')

    const [projects, setProjects] = useState<Project[]>([])
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
    const [newTodoText, setNewTodoText] = useState('')

    // Admin project creation state
    const [users, setUsers] = useState<User[]>([])
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectDesc, setNewProjectDesc] = useState('')
    const [pmMsg, setPmMsg] = useState('')

    useEffect(() => {
        fetchProjects()
        if (isAdmin) {
            fetchUsers()
        }
    }, [isAdmin])

    const fetchProjects = async () => {
        const res = await fetch('/api/projects', { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            setProjects(data)
            if (data.length > 0 && !activeProjectId) {
                // Keep active project if it still exists
                setActiveProjectId(prev => data.find((p: Project) => p.id === prev) ? prev : data[0].id)
            } else if (data.length === 0) {
                setActiveProjectId(null)
            }
        }
    }

    const fetchUsers = async () => {
        const res = await fetch('/api/users')
        if (res.ok) {
            const data = await res.json()
            setUsers(data)
        }
    }

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeProjectId || !newTodoText.trim()) return

        const res = await fetch(`/api/projects/${activeProjectId}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newTodoText })
        })

        if (res.ok) {
            setNewTodoText('')
            fetchProjects() // Refresh projects pulls updated todos
        }
    }

    const toggleTodo = async (projectId: string, todoId: string, currentStatus: boolean) => {
        await fetch(`/api/projects/${projectId}/todos/${todoId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: !currentStatus })
        })
        fetchProjects()
    }

    const deleteTodo = async (projectId: string, todoId: string) => {
        if (!confirm('DELETE_TODO?')) return
        await fetch(`/api/projects/${projectId}/todos/${todoId}`, {
            method: 'DELETE'
        })
        fetchProjects()
    }

    // Admin actions
    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        setPmMsg('CREATING...')
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newProjectName, description: newProjectDesc }),
        })
        if (res.ok) {
            setPmMsg('CREATED_SUCCESSFULLY')
            setNewProjectName('')
            setNewProjectDesc('')
            fetchProjects()
            setTimeout(() => setPmMsg(''), 3000)
        } else {
            setPmMsg('ERROR_CREATING')
        }
    }

    const handleDeleteProject = async (id: string, name: string) => {
        if (!window.confirm(`DELETE_PROJECT "${name}"?`)) return
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
        if (res.ok) fetchProjects()
    }

    const handleAssignMember = async (projectId: string, userId: string) => {
        if (!userId) return
        const res = await fetch(`/api/projects/${projectId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        })
        if (res.ok) fetchProjects()
    }

    const handleRemoveMember = async (projectId: string, userId: string) => {
        const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
            method: 'DELETE'
        })
        if (res.ok) fetchProjects()
    }

    const activeProject = projects.find(p => p.id === activeProjectId)

    return (
        <div className="flex flex-col h-full w-full bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] relative border border-[var(--color-panel-border)] rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-accent)]"></div>

            <div className="flex items-center justify-between p-4 border-b border-[var(--color-panel-border)]">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-[var(--color-brand-accent)]"></span>
                        PROJECTS
                    </h2>
                    <div className="hidden md:flex ml-8 border border-[var(--color-panel-border)] bg-[var(--color-panel)]">
                        <button
                            onClick={() => setView('MY_PROJECTS')}
                            className={`px-4 py-1 text-xs font-bold tracking-widest uppercase transition-colors ${view === 'MY_PROJECTS' ? 'bg-[var(--color-brand-accent)] text-black' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
                        >
                            MY_PROJECTS
                        </button>
                        <button
                            onClick={() => setView('PROJECT_TRACKER')}
                            className={`px-4 py-1 text-xs font-bold tracking-widest uppercase transition-colors border-l border-[var(--color-panel-border)] ${view === 'PROJECT_TRACKER' ? 'bg-[var(--color-brand-accent)] text-black' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
                        >
                            PROJECT_TRACKER
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {view === 'MY_PROJECTS' ? (
                    <>
                        {/* Project List Sidebar */}
                        <div className="w-full lg:w-1/3 border-r border-[var(--color-panel-border)] flex flex-col overflow-y-auto scrollbar-custom">
                            {isAdmin && (
                                <div className="p-4 border-b border-[var(--color-panel-border)] bg-[var(--color-panel)] relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-orange-accent)]"></div>
                                    <h3 className="text-[10px] font-bold tracking-widest text-[var(--color-orange-accent)] mb-2 uppercase">ADMIN: NEW_PROJECT</h3>
                                    <form onSubmit={handleCreateProject} className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="PROJECT_NAME..."
                                            className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-1.5 text-xs focus:border-[var(--color-orange-accent)] focus:outline-none text-[var(--color-text-primary)]"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="DESCRIPTION (OPTIONAL)..."
                                            className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-1.5 text-xs focus:border-[var(--color-orange-accent)] focus:outline-none text-[var(--color-text-primary)]"
                                            value={newProjectDesc}
                                            onChange={(e) => setNewProjectDesc(e.target.value)}
                                        />
                                        <button type="submit" className="w-full py-1.5 bg-[var(--color-orange-accent)] text-[var(--color-bg-dark)] font-bold tracking-widest text-[10px] uppercase hover:opacity-80">
                                            CREATE_PROJECT
                                        </button>
                                        {pmMsg && <div className="text-[10px] text-[var(--color-orange-accent)] text-center uppercase tracking-widest">{pmMsg}</div>}
                                    </form>
                                </div>
                            )}

                            {projects.length === 0 ? (
                                <div className="p-4 text-xs text-[var(--color-text-secondary)] tracking-widest">
                                    NO_PROJECTS_ASSIGNED
                                </div>
                            ) : (
                                projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => setActiveProjectId(project.id)}
                                        className={`text-left p-4 border-b border-[var(--color-panel-border)] transition-colors ${activeProjectId === project.id ? 'bg-[var(--color-panel)] border-l-2 border-l-[var(--color-brand-accent)]' : 'hover:bg-[var(--color-panel)] border-l-2 border-l-transparent'
                                            }`}
                                    >
                                        <div className={`font-bold tracking-widest text-sm uppercase ${activeProjectId === project.id ? 'text-[var(--color-brand-accent)]' : ''
                                            }`}>
                                            {project.name}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-secondary)] mt-1 tracking-widest truncate uppercase">
                                            {project.description || 'NO_DESCRIPTION'}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Project Details */}
                        <div className="w-full lg:w-2/3 flex flex-col bg-[var(--color-panel)] overflow-y-auto scrollbar-custom">
                            {activeProject ? (
                                <div className="p-6 flex flex-col h-full">
                                    <div className="mb-6 pb-4 border-b border-[var(--color-panel-border)]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">
                                                    {activeProject.name}
                                                </h3>
                                                {activeProject.description && (
                                                    <p className="text-xs text-[var(--color-text-secondary)] mt-2 tracking-widest uppercase">
                                                        DESC: {activeProject.description}
                                                    </p>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteProject(activeProject.id, activeProject.name)}
                                                    className="px-3 py-1 text-xs font-bold tracking-widest text-red-500 border border-red-500 hover:bg-red-500 hover:text-[var(--color-bg-dark)] transition-colors uppercase"
                                                >
                                                    DELETE_PROJECT
                                                </button>
                                            )}
                                        </div>

                                        <div className={`mt-4 pt-4 border-t border-[var(--color-panel-border)] ${isAdmin ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
                                            <div>
                                                <h4 className="text-xs font-bold tracking-widest mb-2 uppercase text-[var(--color-text-secondary)]">ASSIGNED_MEMBERS</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeProject.members.length === 0 ? (
                                                        <span className="text-xs text-[var(--color-text-secondary)]">NONE</span>
                                                    ) : (
                                                        activeProject.members.map(m => (
                                                            <span key={m.id} className="group text-[10px] bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] px-2 py-1 tracking-widest uppercase flex items-center gap-2">
                                                                {m.user.username} ({m.user.role})
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => handleRemoveMember(activeProject.id, m.userId)}
                                                                        className="text-red-500 hover:text-red-400 opacity-50 hover:opacity-100"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {isAdmin && (
                                                <div className="flex items-end gap-2">
                                                    <select
                                                        className="flex-1 bg-[var(--color-bg-dark)] border border-[var(--color-orange-accent)]/50 p-1.5 text-xs focus:border-[var(--color-orange-accent)] focus:outline-none text-[var(--color-text-primary)] uppercase"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAssignMember(activeProject.id, e.target.value)
                                                                e.target.value = ''
                                                            }
                                                        }}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>+ ADD_MEMBER_TO_PROJECT</option>
                                                        {users.filter(u => !activeProject.members.some(m => m.userId === u.id)).map(u => (
                                                            <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-0">
                                        <h4 className="text-sm font-bold tracking-widest mb-4 uppercase flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[var(--color-text-secondary)]"></span>
                                            PROJECT_TODOS
                                        </h4>

                                        <div className="space-y-2 mb-6 flex-1 overflow-y-auto scrollbar-custom">
                                            {activeProject.todos.length === 0 ? (
                                                <div className="text-xs text-[var(--color-text-secondary)] tracking-widest">
                                                    NO_TODOS_FOUND
                                                </div>
                                            ) : (
                                                activeProject.todos.map(todo => (
                                                    <div key={todo.id} className="flex items-start justify-between group p-2 border border-transparent hover:border-[var(--color-panel-border)] transition-colors">
                                                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                                                            <div className="relative flex items-center pt-0.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={todo.checked}
                                                                    onChange={() => toggleTodo(activeProject.id, todo.id, todo.checked)}
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-4 h-4 border border-[var(--color-text-secondary)] flex items-center justify-center peer-checked:border-[var(--color-brand-accent)] peer-checked:bg-[var(--color-brand-accent)] transition-colors">
                                                                    {todo.checked && (
                                                                        <svg className="w-3 h-3 text-[var(--color-bg-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className={`text-sm ${todo.checked ? 'text-[var(--color-text-secondary)] line-through' : ''}`}>
                                                                {todo.text}
                                                                {todo.checked && todo.checker && (
                                                                    <span className="ml-2 text-[10px] tracking-widest text-[var(--color-brand-accent)] no-underline">
                                                                        [VERIFIED_BY: {todo.checker.username}]
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </label>
                                                        <button
                                                            onClick={() => deleteTodo(activeProject.id, todo.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-[10px] tracking-widest text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 px-2 py-1 transition-all ml-4"
                                                        >
                                                            DEL
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <form onSubmit={addTodo} className="mt-auto border-t border-[var(--color-panel-border)] pt-4 flex gap-2 shrink-0">
                                            <input
                                                type="text"
                                                className="flex-1 text-sm bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 focus:border-[var(--color-brand-accent)] focus:outline-none placeholder:text-[var(--color-text-secondary)]"
                                                placeholder="NEW_TODO_ACTION..."
                                                value={newTodoText}
                                                onChange={(e) => setNewTodoText(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newTodoText.trim()}
                                                className="text-xs font-bold tracking-widest px-4 border border-[var(--color-panel-border)] disabled:opacity-50 hover:text-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)] transition-colors"
                                            >
                                                ADD
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs tracking-widest text-[var(--color-text-secondary)] uppercase">
                                    SELECT_A_PROJECT
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full flex flex-col p-6 overflow-y-auto scrollbar-custom bg-[var(--color-bg-dark)]">
                        <h3 className="text-xl font-bold tracking-widest text-[var(--color-text-primary)] mb-6 uppercase border-b border-[var(--color-panel-border)] pb-4">
                            GLOBAL_PROJECT_TRACKER
                        </h3>
                        {projects.length === 0 ? (
                            <div className="text-sm tracking-widest text-[var(--color-text-secondary)] uppercase">
                                NO_PROJECTS_AVAILABLE
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {projects.map(project => {
                                    const total = project.todos.length
                                    const completed = project.todos.filter(t => t.checked).length
                                    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

                                    return (
                                        <div key={project.id} className="border border-[var(--color-panel-border)] bg-[var(--color-panel)] p-4">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">{project.name}</h4>
                                                    <div className="text-xs tracking-widest text-[var(--color-text-secondary)] uppercase mt-1">PROGRESS: {completed}/{total}_TASKS ({percent}%)</div>
                                                </div>
                                            </div>

                                            <div className="w-full h-1.5 bg-[var(--color-bg-dark)] mb-6 overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--color-brand-accent)] transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                {project.todos.length === 0 ? (
                                                    <div className="text-[10px] tracking-widest text-[var(--color-text-secondary)] opacity-50">NO_TASKS_LOGGED</div>
                                                ) : (
                                                    project.todos.map(todo => (
                                                        <div key={todo.id} className="flex flex-col md:flex-row md:items-center justify-between p-2 border border-[var(--color-panel-border)] bg-[var(--color-bg-dark)] gap-2 md:gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-3 h-3 flex-shrink-0 flex items-center justify-center border ${todo.checked ? 'border-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]' : 'border-[var(--color-text-secondary)]'}`}>
                                                                    {todo.checked && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <span className={`text-xs ${todo.checked ? 'text-[var(--color-text-secondary)] line-through' : 'text-white'}`}>
                                                                    {todo.text}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col md:items-end gap-1 ml-6 md:ml-0">
                                                                <span className="text-[9px] tracking-widest text-[var(--color-text-secondary)] uppercase">
                                                                    AUTHOR: {todo.creator.username}
                                                                </span>
                                                                {todo.checked && todo.checker && (
                                                                    <span className="text-[9px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">
                                                                        VERIFIED: {todo.checker.username}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
