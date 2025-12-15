import type { Note } from "@/types"

/**
 * Normalize a note from backend response
 * Parses JSON string fields like todos
 */
export function normalizeNote(note: any): Note {
  return {
    ...note,
    todos: note.todos ? (typeof note.todos === 'string' ? JSON.parse(note.todos) : note.todos) : undefined,
  }
}

/**
 * Normalize multiple notes
 */
export function normalizeNotes(notes: any[]): Note[] {
  return notes.map(normalizeNote)
}
