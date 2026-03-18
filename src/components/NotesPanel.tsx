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
        <div className="flex flex-col h-full w-full bg-transparent text-white relative z-10 glass-panel !border-0 !shadow-none">
            <div className="flex items-center justify-between p-6 border-b border-[#f97316]/20 bg-[#1E1E2E]">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_10px_#f97316]"></span>
                    Intelligence_Logs
                </h2>
                <button
                    onClick={() => setIsCreatingNote(true)}
                    className="glass-button !py-2 !px-4 text-[10px]"
                >
                    + NEW_ENTRY
                </button>
            </div>

            {isCreatingNote && (
                <form onSubmit={createNote} className="p-6 border-b border-[#f97316]/20 flex gap-4 bg-[#f97316]/5 animate-in slide-in-from-top-2">
                    <input
                        autoFocus
                        className="flex-1 bg-black/40 border border-[#f97316]/20 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-[#f97316] px-4 py-2 text-white transition-all"
                        placeholder="ENTRY_IDENTIFIER..."
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                    />
                    <button type="submit" className="text-[10px] text-[#f97316] font-bold tracking-widest px-4 uppercase hover:bg-[#f97316]/10 rounded-xl transition-all">INITIALIZE</button>
                    <button type="button" onClick={() => setIsCreatingNote(false)} className="text-[10px] text-red-400 font-bold tracking-widest px-4 uppercase hover:bg-red-500/10 rounded-xl transition-all">ABORT</button>
                </form>
            )}

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-[#f97316]/20 scrollbar-hide bg-[#1E1E2E]/40">
                {notes.map((note) => (
                    <button
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`flex-shrink-0 px-6 py-4 text-[10px] font-bold tracking-widest border-r border-[#f97316]/20 transition-all duration-300 uppercase ${activeNoteId === note.id
                            ? 'bg-[#f97316]/10 text-white border-b-2 border-b-[#f97316]'
                            : 'text-[#94A3B8] hover:bg-[#f97316]/5 hover:text-white'
                            }`}
                    >
                        {note.title}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-custom bg-transparent group/content">
                {activeNote ? (
                    <div className="space-y-8 max-w-4xl mx-auto pb-16">
                        <div className="flex justify-between items-start mb-10 border-b border-[#f97316]/10 pb-8 relative">
                            {/* Decorative title glow */}
                            <div className="absolute -left-10 top-0 w-32 h-32 bg-[#f97316]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                            
                            <div>
                                <h3 className="text-3xl font-bold tracking-[0.1em] text-white flex items-center gap-3 uppercase">
                                    {activeNote.title}
                                    <span className="text-[#f97316] animate-pulse">_</span>
                                </h3>
                                <p className="text-[10px] text-[#94A3B8] mt-4 font-bold tracking-widest uppercase flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></span>
                                    Origin: <span className="text-white">{activeNote.creator.username.toUpperCase()}</span>
                                </p>
                            </div>
                            {(session?.user.id === activeNote.createdBy || session?.user.role === 'admin') && (
                                <button
                                    onClick={() => deleteNote(activeNote.id)}
                                    className="font-bold tracking-widest text-[10px] uppercase px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    ERASE_RECORD
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {activeNote.blocks.map((block) => (
                                <div key={block.id} className="p-6 border border-[#f97316]/10 bg-black/40 rounded-2xl hover:border-[#f97316]/30 transition-all duration-300 relative group/block">
                                    {/* Left accent bar */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#f97316] transition-all duration-300 group-hover/block:h-[60%] rounded-r-md shadow-[0_0_10px_#f97316]"></div>
                                    
                                    {block.type === 'text' ? (
                                        editingBlockId === block.id ? (
                                            <div className="space-y-4">
                                                <textarea
                                                    className="glass-input w-full resize-none font-medium !bg-black/40"
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    rows={Math.max(4, editingContent.split('\n').length)}
                                                    autoFocus
                                                />
                                                <div className="flex gap-3">
                                                    <button onClick={saveEdit} className="glass-button !py-2 !px-4 text-[10px] border-[#f97316] hover:bg-[#f97316]/10">COMMIT_CHANGES</button>
                                                    <button onClick={cancelEdit} className="glass-button !py-2 !px-4 text-[10px]">CANCEL</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="group relative cursor-text min-h-[24px]"
                                                onDoubleClick={() => startEditing(block)}
                                            >
                                                <p className="text-sm leading-relaxed text-[#D1D5DB] pr-12">{block.content}</p>
                                                <button
                                                    onClick={() => startEditing(block)}
                                                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-[9px] text-[#f97316] font-bold tracking-widest border border-[#f97316]/40 px-2 py-0.5 rounded transition-all hover:bg-[#f97316]/10"
                                                >
                                                    MODIFY
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-4">
                                            {block.todoItems.map((todo) => (
                                                <label key={todo.id} className="flex items-start gap-4 cursor-pointer group/todo p-3 rounded-xl hover:bg-[#f97316]/5 transition-all border border-transparent hover:border-[#f97316]/20">
                                                    <div className="relative flex items-center pt-0.5 shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={todo.checked}
                                                            onChange={() => toggleTodo(todo.id, todo.checked)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="w-5 h-5 rounded-lg border-2 border-[#f97316]/30 flex items-center justify-center peer-checked:bg-[#f97316] peer-checked:border-[#f97316] transition-all duration-300">
                                                            {todo.checked && (
                                                                <svg className="w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm tracking-wide transition-all duration-300 ${todo.checked ? 'text-[#94A3B8] line-through opacity-50' : 'text-white'}`}>
                                                        {todo.text}
                                                        {todo.checked && todo.checker && (
                                                            <span className="ml-4 inline-block px-3 py-0.5 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 text-[9px] tracking-widest text-[#f97316] font-bold uppercase no-underline">
                                                                VERIFIED_BY: {todo.checker.username.toUpperCase()}
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

                        <div className="mt-12 pt-10 border-t border-[#f97316]/10 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                            {/* Decorative divider glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#f97316]/40 to-transparent"></div>
                            
                            {/* Add Text Block */}
                            <div className="space-y-4 p-6 rounded-2xl bg-black/40 border border-[#f97316]/10">
                                <label className="block text-[9px] font-bold tracking-widest text-[#94A3B8] uppercase">Append_Report_Matrix</label>
                                <textarea
                                    rows={3}
                                    className="glass-input w-full resize-none text-xs"
                                    placeholder="Enter descriptive data..."
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
                                    className="w-full glass-button !py-2.5 text-[10px]"
                                >
                                    INJECT_LOG_BLOCK
                                </button>
                            </div>

                            {/* Add Todo Block */}
                            <div className="space-y-4 p-6 rounded-2xl bg-[#f97316]/5 border border-[#f97316]/20">
                                <label className="block text-[9px] font-bold tracking-widest text-[#94A3B8] uppercase">Append_Action_Vector</label>
                                <input
                                    type="text"
                                    className="glass-input w-full text-xs"
                                    placeholder="Enter directive..."
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
                                    className="w-full glass-button !py-2.5 text-[10px]"
                                >
                                    INJECT_DIRECTIVE
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-[10px] tracking-widest text-[#94A3B8] uppercase">
                        {notes.length === 0 ? 'NULL_RECORD_ARRAY' : 'SELECT_LOG_ENTRY'}
                    </div>
                )}
            </div>
        </div>
    )
}
