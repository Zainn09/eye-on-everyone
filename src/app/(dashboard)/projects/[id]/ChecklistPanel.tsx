"use client"

import { useState, useTransition, useOptimistic } from "react"
import {
  ListChecks, Plus, Trash2, Check, Loader2, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react"
import {
  createChecklist, addChecklistItem, toggleChecklistItem,
  deleteChecklistItem, deleteChecklist
} from "@/actions/checklists"
import { validateTitle } from "@/lib/taskUtils"
import type { ChecklistPanelProps, ChecklistWithItems, ChecklistItem } from "@/types/platform"

// Pure function — no side effects
export function completionPct(items: { completed: boolean }[]): number {
  if (items.length === 0) return 0
  return Math.round((items.filter(i => i.completed).length / items.length) * 100)
}

export function ChecklistPanel({ projectId, initialChecklists, currentUser }: ChecklistPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticChecklists, updateOptimistic] = useOptimistic(
    initialChecklists,
    (state: ChecklistWithItems[], action: { type: string; payload: any }) => {
      switch (action.type) {
        case "ADD_CHECKLIST":
          return [action.payload, ...state]
        case "DELETE_CHECKLIST":
          return state.filter(c => c.id !== action.payload.id)
        case "ADD_ITEM":
          return state.map(c =>
            c.id === action.payload.checklistId
              ? { ...c, items: [...c.items, action.payload.item] }
              : c
          )
        case "TOGGLE_ITEM":
          return state.map(c => ({
            ...c,
            items: c.items.map(i =>
              i.id === action.payload.id ? { ...i, completed: !i.completed } : i
            ),
          }))
        case "DELETE_ITEM":
          return state.map(c => ({
            ...c,
            items: c.items.filter(i => i.id !== action.payload.id),
          }))
        default:
          return state
      }
    }
  )

  const [newChecklistTitle, setNewChecklistTitle] = useState("")
  const [checklistError, setChecklistError] = useState<string | null>(null)
  const [showNewChecklist, setShowNewChecklist] = useState(false)

  // Per-checklist new item state
  const [newItemTitles, setNewItemTitles] = useState<Record<string, string>>({})
  const [newItemErrors, setNewItemErrors] = useState<Record<string, string>>({})
  const [collapsedChecklists, setCollapsedChecklists] = useState<Record<string, boolean>>({})
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({})

  const isAdmin = currentUser.role === "ADMIN"

  function setActionError(key: string, msg: string) {
    setActionErrors(prev => ({ ...prev, [key]: msg }))
    setTimeout(() => setActionErrors(prev => { const n = { ...prev }; delete n[key]; return n }), 4000)
  }

  async function handleCreateChecklist(e: React.FormEvent) {
    e.preventDefault()
    const err = validateTitle(newChecklistTitle)
    if (err) { setChecklistError(err); return }
    setChecklistError(null)

    const optimistic: ChecklistWithItems = {
      id: `temp-cl-${Date.now()}`,
      title: newChecklistTitle.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: { id: currentUser.id, name: currentUser.name },
      items: [],
    }

    startTransition(async () => {
      updateOptimistic({ type: "ADD_CHECKLIST", payload: optimistic })
      try {
        await createChecklist({ title: newChecklistTitle.trim(), projectId })
        setNewChecklistTitle("")
        setShowNewChecklist(false)
      } catch (e) {
        setChecklistError(e instanceof Error ? e.message : "Failed to create checklist")
      }
    })
  }

  async function handleDeleteChecklist(checklist: ChecklistWithItems) {
    startTransition(async () => {
      updateOptimistic({ type: "DELETE_CHECKLIST", payload: { id: checklist.id } })
      try {
        await deleteChecklist(checklist.id)
      } catch (e) {
        setActionError(checklist.id, e instanceof Error ? e.message : "Failed to delete checklist")
      }
    })
  }

  async function handleAddItem(checklistId: string) {
    const title = newItemTitles[checklistId] ?? ""
    const err = validateTitle(title)
    if (err) {
      setNewItemErrors(prev => ({ ...prev, [checklistId]: err }))
      return
    }
    setNewItemErrors(prev => { const n = { ...prev }; delete n[checklistId]; return n })

    const optimisticItem: ChecklistItem = {
      id: `temp-item-${Date.now()}`,
      title: title.trim(),
      completed: false,
      order: 999,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    startTransition(async () => {
      updateOptimistic({ type: "ADD_ITEM", payload: { checklistId, item: optimisticItem } })
      try {
        await addChecklistItem(checklistId, title.trim())
        setNewItemTitles(prev => { const n = { ...prev }; delete n[checklistId]; return n })
      } catch (e) {
        setActionError(checklistId, e instanceof Error ? e.message : "Failed to add item")
      }
    })
  }

  async function handleToggleItem(item: ChecklistItem) {
    startTransition(async () => {
      updateOptimistic({ type: "TOGGLE_ITEM", payload: { id: item.id } })
      try {
        await toggleChecklistItem(item.id)
      } catch (e) {
        // revert optimistic on error
        updateOptimistic({ type: "TOGGLE_ITEM", payload: { id: item.id } })
        setActionError(item.id, e instanceof Error ? e.message : "Failed to update item")
      }
    })
  }

  async function handleDeleteItem(item: ChecklistItem) {
    startTransition(async () => {
      updateOptimistic({ type: "DELETE_ITEM", payload: { id: item.id } })
      try {
        await deleteChecklistItem(item.id)
      } catch (e) {
        setActionError(item.id, e instanceof Error ? e.message : "Failed to delete item")
      }
    })
  }

  function toggleCollapse(id: string) {
    setCollapsedChecklists(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const canDeleteChecklist = (checklist: ChecklistWithItems) =>
    isAdmin || checklist.creator.id === currentUser.id

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ListChecks size={18} style={{ color: "#a78bfa" }} />
          Checklists
          <span style={{
            fontSize: "0.72rem", fontWeight: 600,
            background: "rgba(139,92,246,0.15)", color: "#a78bfa",
            padding: "0.1rem 0.5rem", borderRadius: "9999px",
          }}>
            {optimisticChecklists.length}
          </span>
        </h3>
        <button
          onClick={() => setShowNewChecklist(v => !v)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={14} /> Add Checklist
        </button>
      </div>

      {/* New checklist form */}
      {showNewChecklist && (
        <form
          onSubmit={handleCreateChecklist}
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <input
            className="input"
            placeholder="Checklist title *"
            value={newChecklistTitle}
            onChange={e => { setNewChecklistTitle(e.target.value); setChecklistError(null) }}
            disabled={isPending}
            autoFocus
          />
          {checklistError && (
            <div style={{ fontSize: "0.78rem", color: "#f87171", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <AlertCircle size={13} /> {checklistError}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewChecklist(false)} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
              {isPending ? <Loader2 size={13} /> : <Plus size={13} />}
              Create
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {optimisticChecklists.length === 0 && !showNewChecklist && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
          <ListChecks size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>No checklists yet</div>
          <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Add a checklist to track completion steps</div>
        </div>
      )}

      {/* Checklist cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {optimisticChecklists.map(checklist => {
          const pct = completionPct(checklist.items)
          const isCollapsed = collapsedChecklists[checklist.id]
          const canDelete = canDeleteChecklist(checklist)
          const err = actionErrors[checklist.id]

          return (
            <div
              key={checklist.id}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              {/* Checklist header */}
              <div style={{
                padding: "0.875rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                borderBottom: isCollapsed ? "none" : "1px solid var(--color-border)",
              }}>
                <button
                  onClick={() => toggleCollapse(checklist.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}
                >
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    {checklist.title}
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className="progress progress-sm" style={{ flex: 1 }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700, minWidth: "36px",
                      color: pct === 100 ? "#34d399" : "var(--color-text-secondary)",
                    }}>
                      {pct}%
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                      {checklist.items.filter(i => i.completed).length}/{checklist.items.length}
                    </span>
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDeleteChecklist(checklist)}
                    disabled={isPending}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--color-text-muted)", padding: "0.2rem",
                      display: "flex", alignItems: "center",
                      transition: "color 0.15s",
                    }}
                    title="Delete checklist"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Error */}
              {err && (
                <div style={{ padding: "0.5rem 1rem", fontSize: "0.78rem", color: "#f87171", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <AlertCircle size={13} /> {err}
                </div>
              )}

              {/* Items */}
              {!isCollapsed && (
                <div style={{ padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {checklist.items.map(item => {
                    const itemErr = actionErrors[item.id]
                    return (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.35rem 0.25rem",
                        borderRadius: "var(--radius-sm)",
                        transition: "background 0.1s",
                      }}>
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleItem(item)}
                          disabled={isPending}
                          style={{
                            width: "18px", height: "18px",
                            borderRadius: "4px",
                            border: `2px solid ${item.completed ? "#10b981" : "var(--color-border)"}`,
                            background: item.completed ? "#10b981" : "transparent",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                          aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {item.completed && <Check size={11} color="#fff" strokeWidth={3} />}
                        </button>

                        <span style={{
                          flex: 1,
                          fontSize: "0.82rem",
                          color: item.completed ? "var(--color-text-muted)" : "var(--color-text)",
                          textDecoration: item.completed ? "line-through" : "none",
                          transition: "all 0.15s",
                        }}>
                          {item.title}
                        </span>

                        {itemErr && (
                          <span style={{ fontSize: "0.68rem", color: "#f87171" }}>{itemErr}</span>
                        )}

                        <button
                          onClick={() => handleDeleteItem(item)}
                          disabled={isPending}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--color-text-muted)", padding: "0.1rem",
                            display: "flex", alignItems: "center", opacity: 0.6,
                          }}
                          aria-label="Delete item"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )
                  })}

                  {/* Add item form */}
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.35rem", paddingTop: "0.35rem", borderTop: "1px solid var(--color-border)" }}>
                    <input
                      className="input"
                      style={{ flex: 1, fontSize: "0.8rem", padding: "0.35rem 0.6rem" }}
                      placeholder="Add item..."
                      value={newItemTitles[checklist.id] ?? ""}
                      onChange={e => {
                        setNewItemTitles(prev => ({ ...prev, [checklist.id]: e.target.value }))
                        setNewItemErrors(prev => { const n = { ...prev }; delete n[checklist.id]; return n })
                      }}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddItem(checklist.id) } }}
                      disabled={isPending}
                    />
                    <button
                      onClick={() => handleAddItem(checklist.id)}
                      disabled={isPending}
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      {isPending ? <Loader2 size={13} /> : <Plus size={13} />}
                    </button>
                  </div>
                  {newItemErrors[checklist.id] && (
                    <div style={{ fontSize: "0.72rem", color: "#f87171", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <AlertCircle size={11} /> {newItemErrors[checklist.id]}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
