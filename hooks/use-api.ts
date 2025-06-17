"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function useAPI<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, dependencies)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch, setData }
}

export function useContacts() {
  return useAPI(() => api.getContacts())
}

export function useConversations() {
  return useAPI(() => api.getConversations())
}

export function useMessages(conversationId: string | null) {
  return useAPI(() => (conversationId ? api.getMessages(conversationId) : Promise.resolve([])), [conversationId])
}

export function useGroups() {
  return useAPI(() => api.getGroups())
}

export function useStatuses() {
  return useAPI(() => api.getStatuses())
}

export function useCalls() {
  return useAPI(() => api.getCalls())
}
