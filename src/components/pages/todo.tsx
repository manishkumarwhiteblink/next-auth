'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, CalendarClock, CheckCheck, Search, Filter, ListTodo, Sparkles } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Types
interface Todo {
    id: string
    text: string
    completed: boolean
    priority: 'low' | 'medium' | 'high'
    due?: string | null // ISO date string
    createdAt: number
}

const STORAGE_KEY = 'shadcn-todo-v1'

function useLocalStorage<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(initial)
    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
            if (raw) setValue(JSON.parse(raw))
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(value))
            }
        } catch {}
    }, [key, value])
    return [value, setValue] as const
}

function priorityBadge(priority: Todo['priority']) {
    const map = {
        low: { label: 'Low', className: 'bg-muted text-foreground' },
        medium: { label: 'Medium', className: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200' },
        high: { label: 'High', className: 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200' },
    }
    const p = map[priority]
    return <Badge className={cn('rounded-full px-2 py-1 text-[11px] font-medium', p.className)}>{p.label}</Badge>
}

export default function TodoApp() {
    const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEY, [])
    const [text, setText] = useState('')
    const [priority, setPriority] = useState<Todo['priority']>('medium')
    const [due, setDue] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [tab, setTab] = useState<'all' | 'active' | 'completed'>('all')

    // Derived list
    const visible = useMemo(() => {
        let list = todos
        if (tab === 'active') list = list.filter(t => !t.completed)
        if (tab === 'completed') list = list.filter(t => t.completed)
        if (query.trim()) {
            const q = query.toLowerCase()
            list = list.filter(t => t.text.toLowerCase().includes(q))
        }
        // sort: incomplete first, by priority, then by createdAt desc
        const weight = { high: 0, medium: 1, low: 2 } as const
        return [...list].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            if (weight[a.priority] !== weight[b.priority]) return weight[a.priority] - weight[b.priority]
            return b.createdAt - a.createdAt
        })
    }, [todos, tab, query])

    const remaining = useMemo(() => todos.filter(t => !t.completed).length, [todos])

    function addTodo() {
        const value = text.trim()
        if (!value) return
        const todo: Todo = {
            id: crypto.randomUUID(),
            text: value,
            completed: false,
            priority,
            due,
            createdAt: Date.now(),
        }
        setTodos(prev => [todo, ...prev])
        setText('')
        setPriority('medium')
        setDue(null)
    }

    function toggle(id: string) {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    }

    function remove(id: string) {
        setTodos(prev => prev.filter(t => t.id !== id))
    }

    function clearCompleted() {
        setTodos(prev => prev.filter(t => !t.completed))
    }

    function update(id: string, patch: Partial<Todo>) {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
    }

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-b from-background to-muted/30 py-10">
            <div className="mx-auto max-w-4xl px-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2"><ListTodo className="h-6 w-6"/> Todos</CardTitle>
                                <CardDescription></CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Sparkles className="h-4 w-4"/>
                            </Button>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-2">
                            <div className="md:col-span-3">
                                <Label htmlFor="todo-input" className="sr-only">Add todo</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="todo-input"
                                        placeholder="Add a task..."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') addTodo() }}
                                        className=""
                                    />
                                    <Button onClick={addTodo} aria-label="Add todo" className="shrink-0"><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                    <SelectTrigger className="w-full" aria-label="Priority">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="relative w-full">
                                    <Input type="date" value={due ?? ''} onChange={e => setDue(e.target.value || null)} aria-label="Due date"/>
                                    <CalendarClock className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 opacity-60" />
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                <div className="relative">
                                    <Input
                                        placeholder="Search"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        aria-label="Search"
                                        className="pl-8"
                                    />
                                    <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 opacity-60" />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4">
                        <Tabs value={tab} onValueChange={(v: any) => setTab(v)} className="w-full">
                            <div className="flex items-center justify-between">
                                <TabsList className="grid grid-cols-3 w-[260px]">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                    <TabsTrigger value="completed">Completed</TabsTrigger>
                                </TabsList>
                                <div className="text-sm text-muted-foreground flex items-center gap-2"><Filter className="h-4 w-4"/> {remaining} left</div>
                            </div>
                            <TabsContent value="all" className="mt-4">
                                <TodoList todos={visible} onToggle={toggle} onRemove={remove} onUpdate={update} />
                            </TabsContent>
                            <TabsContent value="active" className="mt-4">
                                <TodoList todos={visible} onToggle={toggle} onRemove={remove} onUpdate={update} />
                            </TabsContent>
                            <TabsContent value="completed" className="mt-4">
                                <TodoList todos={visible} onToggle={toggle} onRemove={remove} onUpdate={update} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Pro tip: Press Enter to add quickly.</div>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={clearCompleted} disabled={!todos.some(t => t.completed)}>
                            <CheckCheck className="h-4 w-4"/> Clear completed
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

function TodoList({ todos, onToggle, onRemove, onUpdate }: {
    todos: Todo[]
    onToggle: (id: string) => void
    onRemove: (id: string) => void
    onUpdate: (id: string, patch: Partial<Todo>) => void
}) {
    if (todos.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                No tasks match your filters. Enjoy the calm ✨
            </div>
        )
    }
    return (
        <ul className="space-y-2">
            <AnimatePresence initial={false}>
                {todos.map(todo => (
                    <motion.li
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        <TodoItem todo={todo} onToggle={onToggle} onRemove={onRemove} onUpdate={onUpdate} />
                    </motion.li>
                ))}
            </AnimatePresence>
        </ul>
    )
}

function TodoItem({ todo, onToggle, onRemove, onUpdate }: {
    todo: Todo
    onToggle: (id: string) => void
    onRemove: (id: string) => void
    onUpdate: (id: string, patch: Partial<Todo>) => void
}) {
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [editText, setEditText] = useState(todo.text)
    const [editPriority, setEditPriority] = useState<Todo['priority']>(todo.priority)
    const [editDue, setEditDue] = useState<string | ''>(todo.due ?? '')

    const isOverdue = todo.due && !todo.completed && new Date(todo.due) < new Date(new Date().toDateString())

    return (
        <div className={cn(
            'group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-colors',
            todo.completed ? 'opacity-80' : ''
        )}>
            <Checkbox checked={todo.completed} onCheckedChange={() => onToggle(todo.id)} aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'} />

            <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className={cn('truncate text-sm font-medium', todo.completed ? 'line-through text-muted-foreground' : '')}>{todo.text}</p>
                        <div className="mt-1 flex items-center gap-2">
                            {priorityBadge(todo.priority)}
                            {todo.due && (
                                <div className={cn('text-[11px] rounded-full px-2 py-0.5', isOverdue ? 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200' : 'bg-muted text-foreground/70')}>
                                    due {new Date(todo.due).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenEdit(true)} aria-label="Edit">
                            <Pencil className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenDelete(true)} aria-label="Delete">
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit dialog */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit task</DialogTitle>
                        <DialogDescription>Update the text, priority, or due date.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                        <div className="grid gap-1">
                            <Label htmlFor={`edit-text-${todo.id}`}>Task</Label>
                            <Input id={`edit-text-${todo.id}`} value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ onUpdate(todo.id, { text: editText }); setOpenEdit(false) } }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-1">
                                <Label>Priority</Label>
                                <Select value={editPriority} onValueChange={(v: any) => setEditPriority(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1">
                                <Label>Due</Label>
                                <Input type="date" value={editDue} onChange={e => setEditDue(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setOpenEdit(false)}>Cancel</Button>
                        <Button onClick={() => { onUpdate(todo.id, { text: editText.trim() || todo.text, priority: editPriority, due: editDue || null }); setOpenEdit(false) }}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemove(todo.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
