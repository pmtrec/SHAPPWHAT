const API_BASE_URL = "http://localhost:3001"

class WhatsAppAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Erreur API pour ${endpoint}:`, error)
      throw error
    }
  }

  // Users
  async getUser(id: string) {
    return this.request(`/users/${id}`)
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Contacts
  async getContacts() {
    try {
      return await this.request("/contacts")
    } catch (error) {
      console.warn("API non disponible, retour de contacts par défaut")
      return [
        {
          id: "default_1",
          nom: "Contact Test",
          telephone: "+221771234567",
          avatar: null,
          isOnline: true,
          lastSeen: new Date().toISOString(),
          description: "Contact de démonstration",
          isBlocked: false,
          isFavorite: false,
          labels: [],
        },
      ]
    }
  }

  async addContact(contact: any) {
    return this.request("/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    })
  }

  async updateContact(id: string, data: any) {
    return this.request(`/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: "DELETE",
    })
  }

  // Conversations
  async getConversations() {
    try {
      return await this.request("/conversations")
    } catch (error) {
      console.warn("API non disponible, retour de conversations par défaut")
      return []
    }
  }

  async createConversation(conversation: any) {
    return this.request("/conversations", {
      method: "POST",
      body: JSON.stringify(conversation),
    })
  }

  async updateConversation(id: string, data: any) {
    return this.request(`/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Messages
  async getMessages(conversationId: string) {
    try {
      return await this.request(`/messages?conversationId=${conversationId}&_sort=timestamp&_order=asc`)
    } catch (error) {
      console.warn("API non disponible, retour de messages par défaut")
      return []
    }
  }

  async sendMessage(message: any) {
    return this.request("/messages", {
      method: "POST",
      body: JSON.stringify(message),
    })
  }

  async updateMessage(id: string, data: any) {
    return this.request(`/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteMessage(id: string) {
    return this.request(`/messages/${id}`, {
      method: "DELETE",
    })
  }

  // Groups
  async getGroups() {
    try {
      return await this.request("/groups")
    } catch (error) {
      console.warn("API non disponible, retour de groupes par défaut")
      return []
    }
  }

  async createGroup(group: any) {
    return this.request("/groups", {
      method: "POST",
      body: JSON.stringify(group),
    })
  }

  async updateGroup(id: string, data: any) {
    return this.request(`/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async addGroupMember(groupId: string, userId: string) {
    const group = await this.request(`/groups/${groupId}`)
    const updatedMembers = [...group.members, userId]
    return this.updateGroup(groupId, { members: updatedMembers })
  }

  async removeGroupMember(groupId: string, userId: string) {
    const group = await this.request(`/groups/${groupId}`)
    const updatedMembers = group.members.filter((id: string) => id !== userId)
    return this.updateGroup(groupId, { members: updatedMembers })
  }

  // Statuses
  async getStatuses() {
    try {
      return await this.request("/statuses?_sort=timestamp&_order=desc")
    } catch (error) {
      console.warn("API non disponible, retour de statuts par défaut")
      return []
    }
  }

  async createStatus(status: any) {
    return this.request("/statuses", {
      method: "POST",
      body: JSON.stringify(status),
    })
  }

  async updateStatus(id: string, data: any) {
    return this.request(`/statuses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteStatus(id: string) {
    return this.request(`/statuses/${id}`, {
      method: "DELETE",
    })
  }

  // Calls
  async getCalls() {
    try {
      return await this.request("/calls?_sort=startTime&_order=desc")
    } catch (error) {
      console.warn("API non disponible, retour d'appels par défaut")
      return []
    }
  }

  async createCall(call: any) {
    return this.request("/calls", {
      method: "POST",
      body: JSON.stringify(call),
    })
  }

  async updateCall(id: string, data: any) {
    return this.request(`/calls/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Communities
  async getCommunities() {
    try {
      return await this.request("/communities")
    } catch (error) {
      console.warn("API non disponible, retour de communautés par défaut")
      return []
    }
  }

  async createCommunity(community: any) {
    return this.request("/communities", {
      method: "POST",
      body: JSON.stringify(community),
    })
  }

  // Business
  async getBusinessCatalog(businessId: string) {
    try {
      return await this.request(`/businessCatalogs?businessId=${businessId}`)
    } catch (error) {
      console.warn("API non disponible, retour de catalogue par défaut")
      return []
    }
  }

  async createProduct(catalogId: string, product: any) {
    const catalog = await this.request(`/businessCatalogs/${catalogId}`)
    const updatedProducts = [...catalog.products, { ...product, id: Date.now().toString() }]
    return this.request(`/businessCatalogs/${catalogId}`, {
      method: "PATCH",
      body: JSON.stringify({ products: updatedProducts }),
    })
  }
}

export const api = new WhatsAppAPI()
