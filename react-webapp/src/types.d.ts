interface wsClient {
  id: string
  name: string
  connected?: boolean
  SessionId?: string
  OwnerSessionId?: string
}

interface wsMessage {
  clientId?: string
  messageBody: string
  messageType: string
  messageAction?: string
  targetClientId?: string
}

interface wsSession {
  sessionId: string
  name: string
  ownerId: string
  clientList: wsClient[]
}
