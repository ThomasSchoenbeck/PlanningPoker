interface wsClient {
  id: string
  name: string
  connected?: boolean
}

interface wsMessage {
  clientId?: string
  messageBody: string
  messageType: string
  targetClientId?: string
}

interface wsSession {
  sessionId: string
  name: string
  ownerId: string
}
