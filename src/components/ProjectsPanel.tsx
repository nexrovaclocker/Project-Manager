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
        <div className="flex flex-col h-full w-full bg-transparent text-white relative rounded-2xl overflow-hidden glass-panel z-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1] shadow-[0_0_10px_#6366F1]"></div>

            <div className="flex items-center justify-between p-6 border-b border-[#6366F1]/20 bg-[#1E1E2E] relative">
                <div className="flex items-center gap-4 relative z-10">
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_10px_#6366F1]"></span>
                        Project_Matrix
                    </h2>
                    <div className="hidden md:flex ml-8 bg-black/20 rounded-lg p-1 border border-[#6366F1]/20">
                        <button
                            onClick={() => setView('MY_PROJECTS')}
                            className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-md ${view === 'MY_PROJECTS' ? 'bg-[#6366F1] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'}`}
                        >
                            Active_Nodes
                        </button>
                        <button
                            onClick={() => setView('PROJECT_TRACKER')}
                            className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-md ml-1 ${view === 'PROJECT_TRACKER' ? 'bg-[#6366F1] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'}`}
                        >
                            Global_Stream
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {view === 'MY_PROJECTS' ? (
                    <>
                        <div className="w-full lg:w-1/3 border-r border-[#6366F1]/20 flex flex-col overflow-y-auto scrollbar-custom bg-[#1E1E2E]/40">
                            {isAdmin && (
                                <div className="p-6 border-b border-[#6366F1]/20 bg-[#6366F1]/5 relative overflow-hidden group">
                                    <h3 className="text-[10px] font-bold tracking-widest text-[#6366F1] mb-4 uppercase flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Deploy_New_Node
                                    </h3>
                                    <form onSubmit={handleCreateProject} className="flex flex-col gap-3 relative z-10">
                                        <input
                                            type="text"
                                            required
                                            placeholder="NODE_NAME..."
                                            className="glass-input !bg-black/20"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="METADATA..."
                                            className="glass-input !bg-black/20"
                                            value={newProjectDesc}
                                            onChange={(e) => setNewProjectDesc(e.target.value)}
                                        />
                                        <button type="submit" className="glass-button py-2.5 text-[10px]">
                                            INITIATE_DEPLOYMENT
                                        </button>
                                        {pmMsg && <div className="text-[10px] text-[#6366F1] text-center uppercase tracking-widest font-bold mt-2">{pmMsg}</div>}
                                    </form>
                                </div>
                            )}

                            <div className="flex-1 flex flex-col p-3 gap-3">
                                {projects.length === 0 ? (
                                    <div className="p-6 text-[10px] text-[#94A3B8] tracking-widest text-center mt-4 border border-dashed border-[#6366F1]/20 rounded-2xl">
                                        NULL_PROJECT_ARRAY
                                    </div>
                                ) : (
                                    projects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => setActiveProjectId(project.id)}
                                            className={`text-left p-5 rounded-2xl border transition-all duration-300 relative group/item ${activeProjectId === project.id ? 'bg-[#6366F1]/10 border-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-transparent border-[#6366F1]/10 hover:border-[#6366F1]/40'}`}
                                        >
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity rounded-r"></div>
                                            
                                            <div className={`font-bold tracking-widest text-xs uppercase flex items-center justify-between ${activeProjectId === project.id ? 'text-white' : 'text-[#94A3B8]'}`}>
                                                <span className="truncate pr-4">{project.name}</span>
                                                {activeProjectId === project.id && <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1] animate-pulse"></span>}
                                            </div>
                                            <div className="text-[9px] mt-2 tracking-widest truncate uppercase text-[#94A3B8]/60">
                                                {project.description || 'SECURE_NODE'}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-2/3 flex flex-col bg-transparent overflow-y-auto scrollbar-custom relative">
                            {activeProject ? (
                                <div className="p-8 flex flex-col h-full z-10">
                                    <div className="mb-8 pb-8 border-b border-[#6366F1]/10">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold tracking-[0.1em] text-white uppercase">
                                                    {activeProject.name}
                                                </h3>
                                                {activeProject.description && (
                                                    <p className="text-[10px] text-[#94A3B8] mt-3 font-bold tracking-widest uppercase">
                                                        [DATA_PACKET] <span className="text-white ml-2 font-medium">{activeProject.description}</span>
                                                    </p>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteProject(activeProject.id, activeProject.name)}
                                                    className="font-bold tracking-widest text-[10px] uppercase px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                                                >
                                                    ERASE_NODE
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-[#6366F1]/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-[10px] font-bold tracking-widest mb-4 uppercase text-[#94A3B8] flex items-center gap-2">
                                                    Assigned_Protocol_Units
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeProject.members.length === 0 ? (
                                                        <span className="text-[10px] text-[#94A3B8] tracking-widest uppercase opacity-40">Null_Assignment</span>
                                                    ) : (
                                                        activeProject.members.map(m => (
                                                            <span key={m.id} className="group text-[10px] bg-black/40 border border-[#6366F1]/20 px-3 py-1.5 rounded-full tracking-widest uppercase flex items-center gap-3">
                                                                <span className="text-white">{m.user.username}</span>
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => handleRemoveMember(activeProject.id, m.userId)}
                                                                        className="text-red-400 hover:text-white transition-colors"
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
                                                        className="glass-input !py-2 !text-[10px] tracking-widest"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAssignMember(activeProject.id, e.target.value)
                                                                e.target.value = ''
                                                            }
                                                        }}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled className="bg-[#1E1E2E]">+ ASSIGN_UNIT</option>
                                                        {users.filter(u => !activeProject.members.some(m => m.userId === u.id)).map(u => (
                                                            <option key={u.id} value={u.id} className="bg-[#1E1E2E]">{u.username}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-0 relative z-10">
                                        <h4 className="text-xs font-bold tracking-widest mb-6 uppercase flex items-center gap-3 text-white">
                                            <span className="w-1.5 h-4 bg-[#6366F1] rounded-full"></span>
                                            Operational_Directives
                                        </h4>

                                        <div className="space-y-4 mb-8 flex-1 overflow-y-auto scrollbar-custom pr-2">
                                            {activeProject.todos.length === 0 ? (
                                                <div className="text-[10px] text-[#94A3B8] tracking-widest text-center py-10 border border-dashed border-[#6366F1]/10 rounded-2xl bg-black/20">
                                                    NULL_DIRECTIVES
                                                </div>
                                            ) : (
                                                activeProject.todos.map(todo => (
                                                    <div key={todo.id} className="flex items-start justify-between group/todo p-5 rounded-2xl border border-[#6366F1]/10 bg-black/40 hover:border-[#6366F1]/30 transition-all">
                                                        <label className="flex items-start gap-4 cursor-pointer flex-1">
                                                            <div className="relative flex items-center pt-0.5 shrink-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={todo.checked}
                                                                    onChange={() => toggleTodo(activeProject.id, todo.id, todo.checked)}
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-5 h-5 rounded-lg border border-[#6366F1]/30 flex items-center justify-center peer-checked:bg-[#6366F1] peer-checked:border-[#6366F1] transition-all">
                                                                    {todo.checked && (
                                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className={`text-sm tracking-wide transition-all ${todo.checked ? 'text-[#94A3B8] line-through opacity-50' : 'text-white'}`}>
                                                                {todo.text}
                                                                <div className="mt-2 text-[9px] text-[#94A3B8] font-bold tracking-widest uppercase">
                                                                    Unit: {todo.creator.username} {todo.checked && todo.checker && `| VERIFIED: ${todo.checker.username}`}
                                                                </div>
                                                            </div>
                                                        </label>
                                                        <button
                                                            onClick={() => deleteTodo(activeProject.id, todo.id)}
                                                            className="opacity-0 group-hover/todo:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <form onSubmit={addTodo} className="mt-auto pt-6 border-t border-[#6366F1]/10 flex gap-4">
                                            <input
                                                type="text"
                                                className="glass-input flex-1"
                                                placeholder="Inject new directive..."
                                                value={newTodoText}
                                                onChange={(e) => setNewTodoText(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newTodoText.trim()}
                                                className="glass-button min-w-[140px] text-[10px]"
                                            >
                                                INJECT_TASK
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[10px] tracking-widest text-[#94A3B8] uppercase">
                                    SELECT_NODE_FOR_QUERY
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full flex flex-col p-8 overflow-y-auto scrollbar-custom bg-[#0A0A0B]">
                        <h3 className="text-xl font-bold tracking-widest text-white mb-10 uppercase border-l-4 border-[#6366F1] pl-6">
                            GLOBAL_CONSTELLATION
                        </h3>
                        {projects.length === 0 ? (
                            <div className="text-[10px] tracking-widest text-[#94A3B8] uppercase">
                                NULL_STREAM
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {projects.map(project => {
                                    const total = project.todos.length
                                    const completed = project.todos.filter(t => t.checked).length
                                    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

                                    return (
                                        <div key={project.id} className="glass-panel p-8 group hover:border-[#6366F1] transition-all">
                                            <div className="flex justify-between items-end mb-6">
                                                <div>
                                                    <h4 className="text-lg font-bold tracking-widest text-white uppercase">{project.name}</h4>
                                                    <div className="text-[10px] tracking-widest text-[#94A3B8] uppercase mt-2 font-bold">
                                                        SYNC_STATUS: {percent}% COMPLETE
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full h-1 bg-white/5 mb-8 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#6366F1] shadow-[0_0_10px_#6366F1] transition-all duration-1000"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                {project.todos.slice(0, 3).map(todo => (
                                                    <div key={todo.id} className="flex items-center gap-3 text-[11px] text-[#94A3B8] tracking-wide">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${todo.checked ? 'bg-[#6366F1]' : 'border border-[#6366F1]'}`}></div>
                                                        <span className={todo.checked ? 'line-through opacity-40' : ''}>{todo.text}</span>
                                                    </div>
                                                ))}
                                                {total > 3 && <div className="text-[9px] text-[#6366F1] font-bold tracking-widest ml-4 mt-2">+{total - 3} MORE_TASKS</div>}
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
