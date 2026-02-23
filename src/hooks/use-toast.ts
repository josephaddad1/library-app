import { useState, useEffect } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

export type ToastVariant = "default" | "destructive"

export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  open?: boolean
}

type ToastAction =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Partial<Toast> & Pick<Toast, "id"> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

function reducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast, ...state].slice(0, TOAST_LIMIT)

    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t,
      )

    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.forEach((t) => addToRemoveQueue(t.id))
      }
      return state.map((t) =>
        toastId === undefined || t.id === toastId
          ? { ...t, open: false }
          : t,
      )
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) return []
      return state.filter((t) => t.id !== action.toastId)

    default:
      return state
  }
}

const listeners: Array<(state: Toast[]) => void> = []
let memoryState: Toast[] = []

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type ToastInput = Omit<Toast, "id" | "open">

function toast(props: ToastInput) {
  const id = genId()

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
    },
  })

  // Auto-dismiss toasts after the configured delay.
  setTimeout(() => {
    dismiss()
  }, TOAST_REMOVE_DELAY)

  return {
    id,
    dismiss,
    update: (updateProps: Partial<ToastInput>) =>
      dispatch({ type: "UPDATE_TOAST", toast: { ...updateProps, id } }),
  }
}

function useToast() {
  const [state, setState] = useState<Toast[]>(memoryState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    toasts: state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { toast, useToast }
