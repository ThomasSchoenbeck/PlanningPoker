import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
import "./App.css"
import { generateName } from "./randomNameGenerator"

function App() {
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
  const [selectedClient, setSelectedClient] = useState<string>("all")

  // ███    ███ ███████ ███████ ███████  █████   ██████  ███████     ██ ███    ██ ██████  ██    ██ ████████
  // ████  ████ ██      ██      ██      ██   ██ ██       ██          ██ ████   ██ ██   ██ ██    ██    ██
  // ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████       ██ ██ ██  ██ ██████  ██    ██    ██
  // ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██          ██ ██  ██ ██ ██      ██    ██    ██
  // ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████     ██ ██   ████ ██       ██████     ██

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("changing value to", e.target.value)
    setMessage(e.target.value)
  }

  const sendMessage = () => {
    console.log("sending message", message, ws, ws.current)
    if (!ws.current) return
    let newMessage: wsMessage = { clientId: wsClientId, messageType: "notification", messageBody: message }
    // if specific client is selected, add propery to message
    if (selectedClient !== "all") newMessage.targetClientId = selectedClient
    console.log("sending message", newMessage)
    ws.current.send(JSON.stringify(newMessage))
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // console.log("used key", e.key)
    switch (e.key) {
      case "Enter":
        sendMessage()
        break
      case "Escape":
        setMessage("")
        break
      default:
        break
    }
  }

  const handleClientSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    console.log("selected client", e.target.value)
    setSelectedClient(e.target.value)
  }

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
    ws.current.send(JSON.stringify({ clientId: wsClientId, messageType: "updateName", messageBody: clientName }))
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
    console.log("currentClientList", currentClientList.length, currentClientList, wsClientList.length, wsClientList)

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

  useEffect(() => {
    console.log("selectedClient changed", selectedClient)
  }, [selectedClient])

  // ██   ██ ████████ ███    ███ ██           ██████  ██    ██ ████████ ██████  ██    ██ ████████
  // ██   ██    ██    ████  ████ ██          ██    ██ ██    ██    ██    ██   ██ ██    ██    ██
  // ███████    ██    ██ ████ ██ ██          ██    ██ ██    ██    ██    ██████  ██    ██    ██
  // ██   ██    ██    ██  ██  ██ ██          ██    ██ ██    ██    ██    ██      ██    ██    ██
  // ██   ██    ██    ██      ██ ███████      ██████   ██████     ██    ██       ██████     ██

  return (
    <div className="App" style={{ display: "flex", justifyContent: "space-between", width: "1280px" }}>
      {/*

██              ██████ ██      ██ ███████ ███    ██ ████████     ██      ██ ███████ ████████ 
██      ██     ██      ██      ██ ██      ████   ██    ██        ██      ██ ██         ██    
██             ██      ██      ██ █████   ██ ██  ██    ██        ██      ██ ███████    ██    
██      ██     ██      ██      ██ ██      ██  ██ ██    ██        ██      ██      ██    ██    
███████         ██████ ███████ ██ ███████ ██   ████    ██        ███████ ██ ███████    ██    

*/}

      <div style={{ backgroundColor: "#f080805e", padding: 20 }}>
        <h1>Client List</h1>
        <div>
          <table border={1} cellPadding={5}>
            <thead>
              <tr>
                <th style={{ width: 300 }}>Id</th>
                <th style={{ width: 200 }}>Name</th>
                <th style={{ width: 100 }}>Connected</th>
              </tr>
            </thead>
            <tbody>
              {wsClientList.map((e) => (
                <tr key={"connectedClient-" + e.id} style={{ maxHeight: 50 }}>
                  <td style={{ height: 50 }}>{e.id}</td>
                  <td>{e.name}</td>
                  <td>
                    {e.connected ? (
                      <span style={{ fontWeight: "bold", color: "green" }}>Connected</span>
                    ) : (
                      <span style={{ fontWeight: "bold", color: "red" }}>Not Connected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*

██████          ██████ ██   ██  █████  ████████      ██████  ██████  ███    ██ ████████ ██████   ██████  ██      ███████ 
██   ██ ██     ██      ██   ██ ██   ██    ██        ██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      ██      
██████         ██      ███████ ███████    ██        ██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      ███████ 
██   ██ ██     ██      ██   ██ ██   ██    ██        ██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██           ██ 
██   ██         ██████ ██   ██ ██   ██    ██         ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ ███████ 

*/}

      <div style={{ display: "flex", flexDirection: "column", gap: 20, backgroundColor: "#add8e65c", padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
          <div>
            WebSocket Server &nbsp;
            {connected ? (
              <span style={{ fontWeight: "bold", color: "green" }}>Connected</span>
            ) : (
              <span style={{ fontWeight: "bold", color: "red" }}>Not Connected</span>
            )}
          </div>

          <div>ClientId: {wsClientId}</div>
          <div>
            <label htmlFor="clientName">Client Name:&nbsp;</label>
            <input disabled id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 20, gap: 10 }}>
            <label htmlFor="message">Message:&nbsp;</label>
            <input id="message" value={message} onChange={changeValue} onKeyDown={handleKey} />
            <button disabled={wsClientId === ""} onClick={sendMessage}>
              send
            </button>
            <select value={selectedClient} onChange={handleClientSelect}>
              <option key="all" value="all">
                send to all
              </option>
              {wsClientList
                .filter((e) => e.id !== wsClientId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th style={{ width: 400 }}>Client Id</th>
              <th style={{ width: 200 }}>Message</th>
              <th style={{ width: 200 }}>Channel</th>
            </tr>
          </thead>
          <tbody>
            {wsMessages.length > 0 &&
              wsMessages.map((item, index) => (
                <tr key={"message-" + index}>
                  <td>{item.clientId}</td>
                  <td>{item.messageBody}</td>
                  <td>{item.messageType}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
