import { createContext, useContext, useEffect, useState } from "react"
import { json, useNavigate } from "react-router-dom"
import { WebsocketContext, WebsocketContextInterface } from "./websocketContext"

export interface SessionContextInterface {
  session: wsSession
  setSession: (v: wsSession) => void
  sendMessage: (action: string, sessionId?: string, token?: string) => void
}

export const SessionContext = createContext<SessionContextInterface | null>(null)

export const SessionProvider = ({ children }) => {
  const { ws, wsClientId } = useContext(WebsocketContext) as WebsocketContextInterface

  const navigate = useNavigate()

  const [session, setSession] = useState<wsSession>({
    id: "",
    name: "",
    clientList: new Map<string, wsClient>(),
    ownerId: "",
  })

  const messageMapping = (m: wsMessage) => {
    console.log("messageMapping", m)
    switch (m.messageType) {
      //session handlers
      case "sessionCreated":
        try {
          let s: wsSession = JSON.parse(m.messageBody)
          console.log("[sessionCreated] s.clientList", s.clientList)
          s.clientList = new Map(Object.entries(s.clientList))
          setSession(s)
        } catch (e) {
          console.error("error parsing session from message", e, m)
          return
        }
        break
      case "sessionJoined":
        try {
          let s: wsSession = JSON.parse(m.messageBody)
          console.log("[sessionJoined] s.clientList", s.clientList)
          s.clientList = new Map(Object.entries(s.clientList))
          setSession(s)
        } catch (e) {
          console.error("error parsing session from message", e, m)
          return
        }
        break
      case "sessionWrongToken":
        alert(m.messageBody)
        console.error("wrong token")
        break
      case "sessionClientListUpdate":
        break
      default:
        console.log("default", m)
    }
  }

  const handleSessionOnMessage = (e) => {
    try {
      const message: wsMessage = JSON.parse(e.data)
      if (message.messageType.includes("session")) {
        console.log("[SESSION]: got message", e)
        messageMapping(message)
      }
    } catch (err) {
      console.error("cannot parse message", { err, data: e.data })
    }
  }

  useEffect(() => {
    if (!ws.current) {
      console.log("no websocket, no on message")
    } else {
      console.log("we have websocket, on message registered")
      // ws.current.onmessage = handleSessionOnMessage
      ws.current.addEventListener("message", handleSessionOnMessage)
    }

    return () => {
      // not sure if needed, but better to remove event listener for safety/memory reason
      console.log("drop session event listener onmessage")
      ws.current?.removeEventListener("onmessage", handleSessionOnMessage)
    }
    // event listener has to be re-created, otherwise wsClientList will contain old values
  }, [ws.current])

  const sendMessage = (action: string, sessionId?: string, token?: string) => {
    let body: Object = {}
    if (sessionId) body["sessionId"] = sessionId
    if (token) body["token"] = token

    if (!ws.current) return
    let newMessage: wsMessage = {
      clientId: wsClientId,
      messageType: "session",
      messageAction: action,
      messageBody: JSON.stringify(body),
      targetClientId: wsClientId,
    }
    // if specific client is selected, add propery to message
    console.log("[SESSION]: sending message", newMessage)
    ws.current.send(JSON.stringify(newMessage))
  }

  useEffect(() => {
    console.log("session changed", session)
    if (session.id !== "") {
      navigate("/session/" + session.id)
    } else {
      if (!location.pathname.includes("/session/")) {
        navigate("/session")
      }
    }
  }, [session])

  return (
    <SessionContext.Provider value={{ session, setSession, sendMessage }}>
      {children}
    </SessionContext.Provider>
  )
}
