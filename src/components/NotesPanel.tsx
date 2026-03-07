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
        <div className="flex flex-col h-full w-full bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] relative">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-panel-border)]">
                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--color-brand-accent)]"></span>
                    Notes
                </h2>
                <button
                    onClick={() => setIsCreatingNote(true)}
                    className="text-xs font-bold tracking-widest px-2 py-1 border border-[var(--color-panel-border)] hover:border-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)] transition-colors text-[var(--color-text-secondary)]"
                >
                    + NEW_RECORD
                </button>
            </div>

            {isCreatingNote && (
                <form onSubmit={createNote} className="p-4 border-b border-[var(--color-brand-accent)] flex gap-2 bg-[var(--color-panel)]">
                    <input
                        autoFocus
                        className="flex-1 bg-transparent border-b border-[var(--color-panel-border)] text-sm focus:outline-none focus:border-[var(--color-brand-accent)] px-2"
                        placeholder="RECORD_TITLE..."
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                    />
                    <button type="submit" className="text-xs text-[var(--color-brand-accent)] tracking-widest px-2">CREATE</button>
                    <button type="button" onClick={() => setIsCreatingNote(false)} className="text-xs text-red-500 tracking-widest px-2">CANCEL</button>
                </form>
            )}

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-[var(--color-panel-border)] scrollbar-hide">
                {notes.map((note) => (
                    <button
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`flex-shrink-0 px-4 py-3 text-xs font-bold tracking-widest border-r border-[var(--color-panel-border)] transition-colors ${activeNoteId === note.id
                            ? 'bg-[var(--color-panel)] text-[var(--color-brand-accent)] border-b-2 border-b-[var(--color-brand-accent)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-panel)]'
                            }`}
                    >
                        {note.title.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-custom bg-[var(--color-panel)]">
                {activeNote ? (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <div className="flex justify-between items-start mb-8 border-b border-[var(--color-panel-border)] pb-4">
                            <div>
                                <h3 className="text-2xl font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">
                                    {activeNote.title}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1 tracking-widest">
                                    AUTHOR: {activeNote.creator.username}
                                </p>
                            </div>
                            {(session?.user.id === activeNote.createdBy || session?.user.role === 'admin') && (
                                <button
                                    onClick={() => deleteNote(activeNote.id)}
                                    className="text-xs text-red-500 tracking-widest border border-red-500/30 px-2 py-1 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    DELETE
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {activeNote.blocks.map((block) => (
                                <div key={block.id} className="p-3 border-l-2 border-[var(--color-panel-border)] pl-4">
                                    {block.type === 'text' ? (
                                        editingBlockId === block.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full text-sm bg-[var(--color-bg-dark)] border border-[var(--color-brand-accent)] p-2 focus:outline-none resize-none"
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    rows={Math.max(3, editingContent.split('\n').length)}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="text-xs text-[var(--color-brand-accent)] tracking-widest border border-[var(--color-brand-accent)] px-2 py-1">SAVE</button>
                                                    <button onClick={cancelEdit} className="text-xs text-[var(--color-text-secondary)] tracking-widest border border-[var(--color-panel-border)] px-2 py-1">CANCEL</button>
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
                                        <div className="space-y-2">
                                            {block.todoItems.map((todo) => (
                                                <label key={todo.id} className="flex items-start gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center pt-0.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={todo.checked}
                                                            onChange={() => toggleTodo(todo.id, todo.checked)}
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
                                                                [O.K: {todo.checker.username}]
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

                        <div className="mt-8 pt-8 border-t border-[var(--color-panel-border)] grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Add Text Block */}
                            <div className="space-y-2">
                                <textarea
                                    rows={2}
                                    className="w-full text-sm bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 focus:border-[var(--color-brand-accent)] focus:outline-none resize-none"
                                    placeholder="ADD_TEXT_BLOCK..."
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
                                    className="w-full text-xs font-bold tracking-widest py-1 border border-[var(--color-panel-border)] hover:text-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)] transition-colors"
                                >
                                    Add Note
                                </button>
                            </div>

                            {/* Add Todo Block */}
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    className="w-full text-sm bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 focus:border-[var(--color-brand-accent)] focus:outline-none"
                                    placeholder="ADD_TODO_ITEM..."
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
                                    className="w-full text-xs font-bold tracking-widest py-1 border border-[var(--color-panel-border)] hover:text-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)] transition-colors"
                                >
                                    Add Todo Item
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
