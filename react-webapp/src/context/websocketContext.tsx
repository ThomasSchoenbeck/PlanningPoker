import { createContext, useEffect, useRef, useState } from "react"
import { generateName } from "../randomNameGenerator"

export interface WebsocketContextInterface {
  ws: React.MutableRefObject<WebSocket | undefined>

  wsClientId: string
}

export const WebsocketContext = createContext<WebsocketContextInterface | null>(null)

export const WebsocketProvider = ({ children }) => {
  const ws = useRef<WebSocket>()

  // ███████ ████████  █████  ████████ ███████ ███████
  // ██         ██    ██   ██    ██    ██      ██
  // ███████    ██    ███████    ██    █████   ███████
  //      ██    ██    ██   ██    ██    ██           ██
  // ███████    ██    ██   ██    ██    ███████ ███████

  const [message, setMessage] = useState<string>("")
  const [connected, setConnected] = useState<boolean>(false)
  const [wsClientId, setWsClientId] = useState<string>("")
  const [wsMessages, setWsMessages] = useState<wsMessage[]>([])
  const [clientName, setClientName] = useState<string>(generateName())
  const [wsClientList, setWsClientList] = useState<wsClient[]>([])
  const [isPaused, setPause] = useState(false)

  //  ██████  ██████  ███    ██     ██   ██  █████  ███    ██ ██████  ██      ███████ ██████
  // ██      ██    ██ ████   ██     ██   ██ ██   ██ ████   ██ ██   ██ ██      ██      ██   ██
  // ██      ██    ██ ██ ██  ██     ███████ ███████ ██ ██  ██ ██   ██ ██      █████   ██████
  // ██      ██    ██ ██  ██ ██     ██   ██ ██   ██ ██  ██ ██ ██   ██ ██      ██      ██   ██
  //  ██████  ██████  ██   ████     ██   ██ ██   ██ ██   ████ ██████  ███████ ███████ ██   ██

  const handleConnectionOpen = (e: Event) => {
    console.log("ws opened", e)
    setConnected(true)
  }

  const handleConnectionClosed = (e: Event) => {
    console.log("ws closed", e)
    setWsClientId("")
    setConnected(false)
  }

  const handleConnectionError = (e: Event) => {
    console.log("ws error", e)
  }

  // ██     ██ ███████      ██████  ██████  ███    ██ ███    ██ ███████  ██████ ████████
  // ██     ██ ██          ██      ██    ██ ████   ██ ████   ██ ██      ██         ██
  // ██  █  ██ ███████     ██      ██    ██ ██ ██  ██ ██ ██  ██ █████   ██         ██
  // ██ ███ ██      ██     ██      ██    ██ ██  ██ ██ ██  ██ ██ ██      ██         ██
  //  ███ ███  ███████      ██████  ██████  ██   ████ ██   ████ ███████  ██████    ██

  useEffect(() => {
    console.log("init websocket")
    ws.current = new WebSocket("ws://localhost:3000/ws/planningPoker?v=1.0")
    ws.current.onopen = (e) => handleConnectionOpen(e)
    ws.current.onclose = (e) => handleConnectionClosed(e)
    ws.current.onerror = (e) => handleConnectionError(e)

    const wsCurrent = ws.current

    return () => {
      // close websocket connection
      wsCurrent.close()
    }
  }, [])

  //  ██████  ███    ██     ███    ███ ███████ ███████ ███████  █████   ██████  ███████
  // ██    ██ ████   ██     ████  ████ ██      ██      ██      ██   ██ ██       ██
  // ██    ██ ██ ██  ██     ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████
  // ██    ██ ██  ██ ██     ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██
  //  ██████  ██   ████     ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████

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
  }, [isPaused, wsClientList])

  const sendClientName = () => {
    if (!ws.current || wsClientId === "") return
    console.log("sending client name", clientName, wsClientId)
    ws.current.send(
      JSON.stringify({ clientId: wsClientId, messageType: "updateName", messageBody: clientName })
    )
  }

  // ███    ███ ███████  ██████      ██   ██  █████  ███    ██ ██████  ██      ███████ ██████
  // ████  ████ ██      ██           ██   ██ ██   ██ ████   ██ ██   ██ ██      ██      ██   ██
  // ██ ████ ██ ███████ ██   ███     ███████ ███████ ██ ██  ██ ██   ██ ██      █████   ██████
  // ██  ██  ██      ██ ██    ██     ██   ██ ██   ██ ██  ██ ██ ██   ██ ██      ██      ██   ██
  // ██      ██ ███████  ██████      ██   ██ ██   ██ ██   ████ ██████  ███████ ███████ ██   ██

  const handleNotification = (m: wsMessage) => {
    console.log("received message", m)
    setWsMessages((prev) => [...prev, m])
  }

  const handleConnectMessage = (m: wsMessage) => {
    console.log("handleConnectMessage", m)
    if (!m.clientId || m.clientId === "") return
    console.info("our client id is", m.clientId)
    setWsClientId(m.clientId)
  }

  const handleClientListUpdate = (m: wsMessage) => {
    console.log("received clientListUpdate", m)
    let serverList: wsClient[] = []
    try {
      serverList = JSON.parse(m.messageBody)
    } catch (err) {
      console.error("error parsing clientList", err, m)
      return
    }

    const currentClientList = [...wsClientList]
    console.log(
      "currentClientList",
      currentClientList.length,
      currentClientList,
      wsClientList.length,
      wsClientList
    )

    // if in server List
    // sc = serverClient
    // lc = localClient
    for (let sc of serverList) {
      let found: boolean = false

      for (let lc of currentClientList) {
        if (sc.id === lc.id) {
          found = true
          // if found, update client name
          lc.name = sc.name
          lc.connected = true // set to true, because value is not send by server
        }
      }

      if (!found) currentClientList.push({ ...sc, connected: true })
    }

    // if not in server list anymore
    for (let lc of currentClientList) {
      let foundIndex: number = serverList.findIndex((e) => e.id === lc.id)
      console.log("client missing?", foundIndex, lc)

      if (foundIndex === -1) lc.connected = false
    }
    console.log("new currentClientList", currentClientList.length, currentClientList)
    setWsClientList(currentClientList)
  }

  // ████████ ██    ██ ██████  ███████     ███    ███  █████  ██████  ██████  ███████ ██████
  //    ██     ██  ██  ██   ██ ██          ████  ████ ██   ██ ██   ██ ██   ██ ██      ██   ██
  //    ██      ████   ██████  █████       ██ ████ ██ ███████ ██████  ██████  █████   ██████
  //    ██       ██    ██      ██          ██  ██  ██ ██   ██ ██      ██      ██      ██   ██
  //    ██       ██    ██      ███████     ██      ██ ██   ██ ██      ██      ███████ ██   ██

  const messageMapping = (m: wsMessage) => {
    console.log("messageMapping", m)
    switch (m.messageType) {
      case "notification":
        handleNotification(m)
        break
      case "update":
        console.log(m)
        break
      case "error":
        console.error(m)
        break
      case "connectMessage":
        handleConnectMessage(m)
        break
      case "clientListUpdate":
        handleClientListUpdate(m)
        break
      //session handlers
      case "sessionCreated":
        break
      default:
        console.log("default", m)
    }
  }

  // ██    ██ ███████ ███████     ███████ ███████ ███████ ███████  ██████ ████████
  // ██    ██ ██      ██          ██      ██      ██      ██      ██         ██
  // ██    ██ ███████ █████       █████   █████   █████   █████   ██         ██
  // ██    ██      ██ ██          ██      ██      ██      ██      ██         ██
  //  ██████  ███████ ███████     ███████ ██      ██      ███████  ██████    ██

  useEffect(() => {
    if (wsClientList.length === 0) return
    console.log("🎨🎨🎨🎨 wsClientList changed", wsClientList.length, wsClientList)
  }, [wsClientList])

  useEffect(() => {
    console.log("🗿 mount app")

    return () => {
      console.log("🧨 unmount app")
    }
  }, [])

  useEffect(() => {
    // once received clientID from server, tell him our name
    if (wsClientId !== "") {
      sendClientName()
    }
  }, [wsClientId])

  useEffect(() => {
    // update name when we change it.
    sendClientName()
  }, [clientName])

  return (
    <WebsocketContext.Provider value={{ ws, wsClientId }}>{children}</WebsocketContext.Provider>
  )
}
