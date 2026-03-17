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
        <div className="flex flex-col h-full w-full bg-transparent text-[var(--color-text-primary)] relative rounded-2xl overflow-hidden glass-panel z-10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-brand-accent)] via-[var(--color-orange-accent)] to-[var(--color-brand-accent)] bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"></div>

            <div className="flex items-center justify-between p-4 border-b border-[var(--color-panel-border)]/30 bg-[var(--color-panel)] relative">
                {/* Subtle header glow */}
                <div className="absolute -left-10 top-0 w-32 h-10 bg-[var(--color-brand-accent)]/10 blur-2xl rounded-full pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]"></span>
                        PROJECTS
                    </h2>
                    <div className="hidden md:flex ml-8 bg-[var(--color-panel)] rounded-lg p-1 border border-[var(--color-panel-border)]/30">
                        <button
                            onClick={() => setView('MY_PROJECTS')}
                            className={`px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-md ${view === 'MY_PROJECTS' ? 'bg-[var(--color-brand-accent)] text-black shadow-sm scale-105' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5'}`}
                        >
                            MY_PROJECTS
                        </button>
                        <button
                            onClick={() => setView('PROJECT_TRACKER')}
                            className={`px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-md ml-1 ${view === 'PROJECT_TRACKER' ? 'bg-[var(--color-brand-accent)] text-black shadow-sm scale-105' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5'}`}
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
                        <div className="w-full lg:w-1/3 border-r border-[var(--color-panel-border)]/30 flex flex-col overflow-y-auto scrollbar-custom bg-[var(--color-panel)]">
                            {isAdmin && (
                                <div className="p-5 border-b border-[var(--color-panel-border)] bg-[var(--color-orange-accent)]/5 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-orange-accent)] to-transparent group-hover:via-[var(--color-orange-accent)] transition-all duration-500"></div>
                                    <h3 className="text-[10px] font-bold tracking-widest text-[var(--color-orange-accent)] mb-3 uppercase flex items-center gap-2">
                                        <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        ADMIN: NEW_PROJECT
                                    </h3>
                                    <form onSubmit={handleCreateProject} className="flex flex-col gap-3 relative z-10">
                                        <input
                                            type="text"
                                            required
                                            placeholder="PROJECT_NAME..."
                                            className="glass-input w-full text-xs"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="DESCRIPTION (OPTIONAL)..."
                                            className="glass-input w-full text-xs"
                                            value={newProjectDesc}
                                            onChange={(e) => setNewProjectDesc(e.target.value)}
                                        />
                                        <button type="submit" className="glass-button">
                                            CREATE_PROJECT
                                        </button>
                                        {pmMsg && <div className="text-[10px] text-[var(--color-orange-accent)] text-center uppercase tracking-widest font-bold drop-shadow-md">{pmMsg}</div>}
                                    </form>
                                    {/* Admin panel background glow */}
                                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-[var(--color-orange-accent)]/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
                                </div>
                            )}

                            <div className="flex-1 flex flex-col p-2 gap-2">
                                {projects.length === 0 ? (
                                    <div className="p-4 text-xs text-[var(--color-text-secondary)] tracking-widest text-center mt-4 border border-dashed border-[var(--color-panel-border)]/30 rounded-xl bg-white">
                                        NO_PROJECTS_ASSIGNED
                                    </div>
                                ) : (
                                    projects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => setActiveProjectId(project.id)}
                                            className={`text-left p-4 rounded-xl border border-[var(--color-panel-border)]/30 transition-all duration-300 relative overflow-hidden group/item ${activeProjectId === project.id ? 'bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)]/50 shadow-sm scale-[1.02]' : 'bg-white hover:bg-[var(--color-panel-hover)] hover:border-[var(--color-panel-border)]/60 hover:scale-[1.01]'
                                                }`}
                                        >
                                            {/* Hover highlight bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${activeProjectId === project.id ? 'bg-[var(--color-brand-accent)] h-full' : 'bg-black/10 h-0 group-hover/item:h-full group-hover/item:bg-black/20'}`}></div>
                                            
                                            <div className={`font-bold tracking-widest text-sm uppercase flex items-center justify-between ${activeProjectId === project.id ? 'text-[var(--color-brand-accent)]' : 'text-[var(--color-text-primary)]'
                                                }`}>
                                                <span className="truncate pr-4">{project.name}</span>
                                                {activeProjectId === project.id && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)] animate-pulse shadow-[0_0_5px_var(--color-brand-accent)] shrink-0"></span>}
                                            </div>
                                            <div className={`text-xs mt-1.5 tracking-widest truncate uppercase transition-colors ${activeProjectId === project.id ? 'text-[var(--color-brand-accent)]/70' : 'text-[var(--color-text-secondary)] group-hover/item:text-[var(--color-text-primary)]'}`}>
                                                {project.description || 'NO_DESCRIPTION'}
                                            </div>
                                            
                                            {/* decorative gradient background inside item */}
                                            {activeProjectId === project.id && (
                                                <div className="absolute right-0 bottom-0 w-24 h-24 bg-[var(--color-brand-accent)]/10 blur-xl pointer-events-none -z-10 rounded-full"></div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="w-full lg:w-2/3 flex flex-col bg-transparent overflow-y-auto scrollbar-custom relative">
                            {/* Decorative ambient background */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/[0.01] blur-3xl -z-10 rounded-full pointer-events-none"></div>
                            
                            {activeProject ? (
                                <div className="p-6 md:p-8 flex flex-col h-full z-10">
                                    <div className="mb-8 pb-6 border-b border-[var(--color-panel-border)] border-dashed">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-3xl font-bold tracking-widest text-[var(--color-text-primary)]">
                                                    {activeProject.name}
                                                </h3>
                                                {activeProject.description && (
                                                    <p className="text-[10px] text-[var(--color-brand-accent)] mt-3 font-bold tracking-widest uppercase bg-[var(--color-brand-accent)]/10 inline-block px-3 py-1 rounded-full border border-[var(--color-brand-accent)]/20 shadow-sm">
                                                        DESC: <span className="text-[var(--color-text-primary)] font-normal">{activeProject.description}</span>
                                                    </p>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteProject(activeProject.id, activeProject.name)}
                                                    className="font-bold tracking-widest text-xs uppercase px-4 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 active:scale-95 transition-all cursor-pointer shrink-0 ml-4"
                                                >
                                                    DELETE_PROJECT
                                                </button>
                                            )}
                                        </div>

                                        <div className={`mt-6 pt-6 border-t border-[var(--color-panel-border)] border-dashed ${isAdmin ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                                            <div>
                                                <h4 className="text-[10px] font-bold tracking-widest mb-3 uppercase text-[var(--color-text-secondary)] flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                    ASSIGNED_MEMBERS
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeProject.members.length === 0 ? (
                                                        <span className="text-xs text-[var(--color-text-secondary)] italic border border-dashed border-[var(--color-panel-border)] px-3 py-1 rounded-md">NONE_ASSIGNED</span>
                                                    ) : (
                                                        activeProject.members.map(m => (
                                                            <span key={m.id} className="group text-[10px] bg-white border border-[var(--color-panel-border)]/30 hover:border-[var(--color-panel-border)]/60 transition-colors px-3 py-1.5 rounded-full tracking-widest uppercase flex items-center gap-2 shadow-sm font-medium">
                                                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[var(--color-brand-accent)]/60 to-[var(--color-brand-accent)] flex items-center justify-center text-[7px] border border-[var(--color-brand-accent)]/20 text-black">{m.user.username.charAt(0).toUpperCase()}</div>
                                                                <span className="text-[var(--color-text-primary)]">{m.user.username} <span className="opacity-50">({m.user.role})</span></span>
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => handleRemoveMember(activeProject.id, m.userId)}
                                                                        className="text-red-400 hover:text-red-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-red-500/20 w-4 h-4 rounded-full"
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
                                                <div className="flex items-end gap-2 relative z-20">
                                                    <select
                                                        className="glass-input flex-1 uppercase text-xs cursor-pointer appearance-none pr-8"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAssignMember(activeProject.id, e.target.value)
                                                                e.target.value = ''
                                                            }
                                                        }}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled className="bg-[#1a1a1a] text-gray-400">+ ADD_MEMBER_TO_PROJECT</option>
                                                        {users.filter(u => !activeProject.members.some(m => m.userId === u.id)).map(u => (
                                                            <option key={u.id} value={u.id} className="bg-[#1a1a1a] text-white">{u.username} ({u.role})</option>
                                                        ))}
                                                    </select>
                                                    {/* custom dropdown arrow to sit over the input */}
                                                    <div className="absolute right-3 bottom-0 top-0 flex items-center pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-0 mt-4 relative z-10">
                                        <h4 className="text-sm font-bold tracking-widest mb-4 uppercase flex items-center gap-3">
                                            <span className="w-1.5 h-4 bg-[var(--color-brand-accent)] rounded-full shadow-[0_0_8px_var(--color-brand-accent)]"></span>
                                            PROJECT_TASKS
                                        </h4>

                                        <div className="space-y-3 mb-6 flex-1 overflow-y-auto scrollbar-custom pr-2">
                                            {activeProject.todos.length === 0 ? (
                                                <div className="text-xs text-[var(--color-text-secondary)] tracking-widest flex items-center justify-center p-8 border border-dashed border-[var(--color-panel-border)]/20 rounded-xl bg-white">
                                                    NO_TASKS_FOUND
                                                </div>
                                            ) : (
                                                activeProject.todos.map(todo => (
                                                    <div key={todo.id} className="flex items-start justify-between group/todo p-3.5 rounded-xl border border-[var(--color-panel-border)]/20 bg-white hover:bg-[var(--color-panel-hover)] hover:border-[var(--color-panel-border)]/40 transition-all duration-300">
                                                        <label className="flex items-start gap-4 cursor-pointer flex-1">
                                                            <div className="relative flex items-center pt-0.5 shrink-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={todo.checked}
                                                                    onChange={() => toggleTodo(activeProject.id, todo.id, todo.checked)}
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-5 h-5 rounded border-2 border-[var(--color-panel-border)]/40 flex items-center justify-center peer-checked:border-[var(--color-brand-accent)] peer-checked:bg-[var(--color-brand-accent)] transition-all duration-300 shadow-sm">
                                                                    {todo.checked && (
                                                                        <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className={`text-sm mt-0.5 tracking-wide transition-all duration-300 ${todo.checked ? 'text-[var(--color-text-secondary)] line-through opacity-60' : 'text-[var(--color-text-primary)]'}`}>
                                                                {todo.text}
                                                                {todo.checked && todo.checker && (
                                                                    <span className="ml-3 inline-block px-2 py-0.5 rounded-full bg-[var(--color-brand-accent)]/10 border border-[var(--color-brand-accent)]/20 text-[9px] tracking-widest text-[var(--color-brand-accent)] no-underline font-bold uppercase">
                                                                        VERIFIED_BY: <span className="text-[var(--color-text-primary)] ml-1">{todo.checker.username}</span>
                                                                    </span>
                                                                )}
                                                                <div className="mt-2 text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-mono">
                                                                    Created by {todo.creator.username}
                                                                </div>
                                                            </div>
                                                        </label>
                                                        <button
                                                            onClick={() => deleteTodo(activeProject.id, todo.id)}
                                                            className="opacity-0 group-hover/todo:opacity-100 mt-1 mr-1 p-2 rounded-lg text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all shrink-0"
                                                            title="Delete Task"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <form onSubmit={addTodo} className="mt-auto border-t border-[var(--color-panel-border)]/20 border-dashed pt-4 flex gap-3 shrink-0 relative bg-white p-3 rounded-xl border-x border-b">
                                            {/* Decorative glow line top */}
                                            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--color-brand-accent)]/50 to-transparent"></div>
                                            <input
                                                type="text"
                                                className="glass-input flex-1 font-medium"
                                                placeholder="Enter new task description..."
                                                value={newTodoText}
                                                onChange={(e) => setNewTodoText(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newTodoText.trim()}
                                                className="glass-button disabled:opacity-40 disabled:hover:border-transparent min-w-[120px]"
                                            >
                                                ADD_TASK
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
                                                                <span className={`text-xs ${todo.checked ? 'text-[var(--color-text-secondary)] line-through' : 'text-[var(--color-text-primary)]'}`}>
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
