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
  id: string
  name: string
  ownerId: string
  clientList: Map<string, wsClient>
  token?: string
  // clientList: wsClient[]
}
