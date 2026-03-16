'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type TodoItem = {
    id: string
    text: string
    checked: boolean
    checker: { username: string } | null
}

type NoteBlock = {
    id: string
    type: 'text' | 'todo'
    content: string
    todoItems: TodoItem[]
}

type Note = {
    id: string
    title: string
    createdBy: string
    creator: { username: string }
    blocks: NoteBlock[]
}

export function NotesPanel() {
    const { data: session } = useSession()
    const [notes, setNotes] = useState<Note[]>([])
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
    const [newNoteTitle, setNewNoteTitle] = useState('')
    const [isCreatingNote, setIsCreatingNote] = useState(false)
    const [newText, setNewText] = useState('')
    const [newTodo, setNewTodo] = useState('')
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
    const [editingContent, setEditingContent] = useState('')

    useEffect(() => {
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        const res = await fetch('/api/notes', { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            setNotes(data)
            if (data.length > 0 && !activeNoteId) {
                setActiveNoteId(data[0].id)
            } else if (data.length === 0) {
                setActiveNoteId(null)
            }
        }
    }

    const createNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNoteTitle.trim()) return
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newNoteTitle }),
        })
        if (res.ok) {
            setNewNoteTitle('')
            setIsCreatingNote(false)
            fetchNotes()
        }
    }

    const deleteNote = async (id: string) => {
        if (!confirm('DELETE_RECORD?')) return
        await fetch(`/api/notes/${id}`, { method: 'DELETE' })
        if (activeNoteId === id) setActiveNoteId(null)
        fetchNotes()
    }

    const addBlock = async (type: 'text' | 'todo', contentOrText: string) => {
        if (!activeNoteId || !contentOrText.trim()) return
        await fetch(`/api/notes/${activeNoteId}/blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                type === 'text' ? { type, content: contentOrText } : { type, text: contentOrText }
            ),
        })
        setNewText('')
        setNewTodo('')
        fetchNotes()
    }

    const toggleTodo = async (todoId: string, currentStatus: boolean) => {
        await fetch(`/api/todos/${todoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: !currentStatus }),
        })
        fetchNotes()
    }

    const startEditing = (block: NoteBlock) => {
        setEditingBlockId(block.id)
        setEditingContent(block.content)
    }

    const saveEdit = async () => {
        if (!activeNoteId || !editingBlockId) return
        await fetch(`/api/notes/${activeNoteId}/blocks`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blockId: editingBlockId, content: editingContent }),
        })
        setEditingBlockId(null)
        fetchNotes()
    }

    const cancelEdit = () => {
        setEditingBlockId(null)
        setEditingContent('')
    }

    const activeNote = notes.find((n) => n.id === activeNoteId)

    return (
        <div className="flex flex-col h-full w-full bg-transparent text-[var(--color-text-primary)] relative z-10">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-panel-border)] shadow-sm bg-black/10">
                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]"></span>
                    Notes
                </h2>
                <button
                    onClick={() => setIsCreatingNote(true)}
                    className="glass-button text-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent)]/10 hover:border-[var(--color-brand-accent)]/50 transition-all border-dashed"
                >
                    + NEW_RECORD
                </button>
            </div>

            {isCreatingNote && (
                <form onSubmit={createNote} className="p-4 border-b border-[var(--color-brand-accent)]/50 flex gap-3 bg-[var(--color-brand-accent)]/5 shadow-[inset_0_-2px_15px_rgba(45,212,191,0.05)] animate-in slide-in-from-top-2">
                    <input
                        autoFocus
                        className="flex-1 bg-transparent border-b border-white/20 text-sm font-medium tracking-wide focus:outline-none focus:border-[var(--color-brand-accent)] px-2 py-1 transition-colors"
                        placeholder="RECORD_TITLE..."
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                    />
                    <button type="submit" className="text-xs text-[var(--color-brand-accent)] tracking-widest px-2">CREATE</button>
                    <button type="button" onClick={() => setIsCreatingNote(false)} className="text-xs text-red-500 tracking-widest px-2">CANCEL</button>
                </form>
            )}

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-[var(--color-panel-border)] scrollbar-hide bg-black/10">
                {notes.map((note) => (
                    <button
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`flex-shrink-0 px-5 py-3 text-xs font-bold tracking-widest border-r border-[var(--color-panel-border)] transition-all duration-300 ${activeNoteId === note.id
                            ? 'bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] border-b-2 border-b-[var(--color-brand-accent)] shadow-[inset_0_-10px_20px_-10px_rgba(45,212,191,0.3)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        {note.title.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-custom bg-transparent group/content">
                {activeNote ? (
                    <div className="space-y-6 max-w-3xl mx-auto pb-12">
                        <div className="flex justify-between items-start mb-8 border-b border-[var(--color-panel-border)] pb-6 relative">
                            {/* Decorative title glow */}
                            <div className="absolute -left-4 top-0 w-20 h-20 bg-[var(--color-brand-accent)]/10 rounded-full blur-xl -z-10 pointer-events-none"></div>
                            
                            <div>
                                <h3 className="text-2xl font-bold tracking-widest text-white drop-shadow-md flex items-center gap-3">
                                    {activeNote.title}
                                    <span className="text-[var(--color-brand-accent)] animate-pulse">_</span>
                                </h3>
                                <p className="text-[10px] text-[var(--color-text-secondary)] mt-2 font-bold tracking-widest uppercase">
                                    AUTHOR: <span className="text-white/80">{activeNote.creator.username}</span>
                                </p>
                            </div>
                            {(session?.user.id === activeNote.createdBy || session?.user.role === 'admin') && (
                                <button
                                    onClick={() => deleteNote(activeNote.id)}
                                    className="glass-button text-[var(--color-text-secondary)] border-red-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
                                >
                                    DELETE
                                </button>
                            )}
                        </div>

                        <div className="space-y-5">
                            {activeNote.blocks.map((block) => (
                                <div key={block.id} className="p-4 border border-[var(--color-panel-border)] bg-white/[0.02] rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 relative group/block">
                                    {/* Left accent bar */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[var(--color-brand-accent)] transition-all duration-300 group-hover/block:h-[60%] rounded-r-md"></div>
                                    
                                    {block.type === 'text' ? (
                                        editingBlockId === block.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    className="glass-input w-full resize-none font-medium text-white/90"
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    rows={Math.max(3, editingContent.split('\n').length)}
                                                    autoFocus
                                                />
                                                <div className="flex gap-3">
                                                    <button onClick={saveEdit} className="glass-button text-[var(--color-brand-accent)] border-[var(--color-brand-accent)]/30 hover:bg-[var(--color-brand-accent)]/10">SAVE_CHANGES</button>
                                                    <button onClick={cancelEdit} className="glass-button">CANCEL</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="group relative cursor-text min-h-[24px]"
                                                onDoubleClick={() => startEditing(block)}
                                            >
                                                <p className="text-sm whitespace-pre-wrap pr-12">{block.content}</p>
                                                <button
                                                    onClick={() => startEditing(block)}
                                                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-[10px] text-[var(--color-brand-accent)] tracking-widest border border-[var(--color-brand-accent)] px-1 transition-opacity"
                                                >
                                                    EDIT
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-3">
                                            {block.todoItems.map((todo) => (
                                                <label key={todo.id} className="flex items-start gap-3 cursor-pointer group/todo p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                                    <div className="relative flex items-center pt-0.5 shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={todo.checked}
                                                            onChange={() => toggleTodo(todo.id, todo.checked)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="w-5 h-5 rounded-md border-2 border-[var(--color-panel-border)] flex items-center justify-center peer-checked:border-[var(--color-brand-accent)] peer-checked:bg-[var(--color-brand-accent)] transition-all duration-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] peer-checked:shadow-[0_0_10px_rgba(45,212,191,0.4)]">
                                                            {todo.checked && (
                                                                <svg className="w-3.5 h-3.5 text-[#09090b] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm tracking-wide mt-0.5 transition-all duration-300 ${todo.checked ? 'text-[var(--color-text-secondary)] line-through opacity-60' : 'text-white/90'}`}>
                                                        {todo.text}
                                                        {todo.checked && todo.checker && (
                                                            <span className="ml-3 inline-block px-2 py-0.5 rounded-full bg-[var(--color-brand-accent)]/10 border border-[var(--color-brand-accent)]/20 text-[10px] tracking-widest text-[var(--color-brand-accent)] no-underline">
                                                                VERIFIER: {todo.checker.username}
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-[var(--color-panel-border)] grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            {/* Decorative divider glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            
                            {/* Add Text Block */}
                            <div className="space-y-3 p-4 rounded-xl bg-black/20 border border-white/5 shadow-inner">
                                <label className="block text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">APPEND_REPORT_LOG</label>
                                <textarea
                                    rows={2}
                                    className="glass-input w-full resize-none"
                                    placeholder="Enter descriptive block..."
                                    value={newText}
                                    onChange={(e) => setNewText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            addBlock('text', newText)
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => addBlock('text', newText)}
                                    className="w-full glass-button relative overflow-hidden group/btn"
                                >
                                    <div className="absolute inset-0 w-0 bg-white/5 transition-all duration-300 ease-out group-hover/btn:w-full"></div>
                                    <span className="relative">ADD_TEXT_BLOCK</span>
                                </button>
                            </div>

                            {/* Add Todo Block */}
                            <div className="space-y-3 p-4 rounded-xl bg-[var(--color-brand-accent)]/5 border border-[var(--color-brand-accent)]/10 shadow-[inset_0_2px_15px_rgba(45,212,191,0.02)]">
                                <label className="block text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">APPEND_ACTION_ITEM</label>
                                <input
                                    type="text"
                                    className="glass-input w-full"
                                    placeholder="Enter to-do task..."
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addBlock('todo', newTodo)
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => addBlock('todo', newTodo)}
                                    className="w-full glass-button text-[var(--color-brand-accent)] border-[var(--color-brand-accent)]/20 hover:bg-[var(--color-brand-accent)]/10 relative overflow-hidden group/btn"
                                >
                                    <div className="absolute inset-0 w-0 bg-[var(--color-brand-accent)]/5 transition-all duration-300 ease-out group-hover/btn:w-full"></div>
                                    <span className="relative">ADD_TODO_BLOCK</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-[var(--color-text-secondary)] text-sm tracking-widest">
                        {notes.length === 0 ? 'NO_RECORDS_FOUND' : 'SELECT_A_RECORD'}
                    </div>
                )}
            </div>
        </div>
    )
}
