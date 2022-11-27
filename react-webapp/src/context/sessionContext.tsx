import { createContext, useContext, useEffect, useState } from "react"
import { WebsocketContext, WebsocketContextInterface } from "./websocketContext"

export interface SessionContextInterface {
  session: wsSession
  setSession: (v: wsSession) => void
}

export const SessionContext = createContext<SessionContextInterface | null>(null)

export const SessionProvider = ({ children }) => {
  const { ws, wsClientId } = useContext(WebsocketContext) as WebsocketContextInterface

  const [session, setSession] = useState<wsSession>({
    sessionId: "",
    name: "",
    clientList: [],
    ownerId: "",
  })

  const [isPaused, setPause] = useState(false)

  const messageMapping = (m: wsMessage) => {
    console.log("messageMapping", m)
    switch (m.messageType) {
      //session handlers
      case "sessionCreated":
        break
      default:
        console.log("default", m)
    }
  }

  const handleOnMessage = (e) => {
    if (isPaused) return
    try {
      const message: wsMessage = JSON.parse(e.data)
      console.log("e", message)
      messageMapping(message)
    } catch (err) {
      console.error("cannot parse message", { err, data: e.data })
    }
  }

  useEffect(() => {
    if (!ws.current) return
    ws.current.onmessage = handleOnMessage

    return () => {
      // not sure if needed, but better to remove event listener for safety/memory reason
      console.log("drop event listener onmessage")
      ws.current?.removeEventListener("onmessage", handleOnMessage)
    }
    // event listener has to be re-created, otherwise wsClientList will contain old values
    // }, [isPaused, session?.clientList])
  }, [isPaused])

  const sendMessage = (action: string) => {
    if (!ws.current) return
    let newMessage: wsMessage = {
      clientId: wsClientId,
      messageType: "session",
      messageAction: action,
      messageBody: "",
      targetClientId: wsClientId,
    }
    // if specific client is selected, add propery to message
    console.log("[SESSION]: sending message", newMessage)
    ws.current.send(JSON.stringify(newMessage))
  }

  return (
    <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>
  )
}
