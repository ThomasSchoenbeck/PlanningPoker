import { useEffect } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import "./App.css"
import ErrorPage from "./pages/error-page"
import Session from "./Session"

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log("location", location, location.pathname.includes("/session/"))
    if (location.pathname.includes("/session/")) {
      return
    } else {
      console.log("changing route to session")
      // navigate("/session")
    }
  }, [])

  // const ws = useRef<WebSocket>()

  // // ███████ ████████  █████  ████████ ███████ ███████
  // // ██         ██    ██   ██    ██    ██      ██
  // // ███████    ██    ███████    ██    █████   ███████
  // //      ██    ██    ██   ██    ██    ██           ██
  // // ███████    ██    ██   ██    ██    ███████ ███████

  // const [message, setMessage] = useState<string>("")
  // const [connected, setConnected] = useState<boolean>(false)
  // const [wsClientId, setWsClientId] = useState<string>("")
  // const [wsMessages, setWsMessages] = useState<wsMessage[]>([])
  // const [clientName, setClientName] = useState<string>(generateName())
  // const [wsClientList, setWsClientList] = useState<wsClient[]>([])
  // const [isPaused, setPause] = useState(false)
  // const [selectedClient, setSelectedClient] = useState<string>("all")

  // // ███    ███ ███████ ███████ ███████  █████   ██████  ███████     ██ ███    ██ ██████  ██    ██ ████████
  // // ████  ████ ██      ██      ██      ██   ██ ██       ██          ██ ████   ██ ██   ██ ██    ██    ██
  // // ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████       ██ ██ ██  ██ ██████  ██    ██    ██
  // // ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██          ██ ██  ██ ██ ██      ██    ██    ██
  // // ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████     ██ ██   ████ ██       ██████     ██

  // const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // console.log("changing value to", e.target.value)
  //   setMessage(e.target.value)
  // }

  // const sendMessage = () => {
  //   console.log("sending message", message, ws, ws.current)
  //   if (!ws.current) return
  //   let newMessage: wsMessage = {
  //     clientId: wsClientId,
  //     messageType: "notification",
  //     messageBody: message,
  //   }
  //   // if specific client is selected, add propery to message
  //   if (selectedClient !== "all") newMessage.targetClientId = selectedClient
  //   console.log("sending message", newMessage)
  //   ws.current.send(JSON.stringify(newMessage))
  // }

  // const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
  //   // console.log("used key", e.key)
  //   switch (e.key) {
  //     case "Enter":
  //       sendMessage()
  //       break
  //     case "Escape":
  //       setMessage("")
  //       break
  //     default:
  //       break
  //   }
  // }

  // const handleClientSelect = (e: ChangeEvent<HTMLSelectElement>) => {
  //   console.log("selected client", e.target.value)
  //   setSelectedClient(e.target.value)
  // }

  // ██   ██ ████████ ███    ███ ██           ██████  ██    ██ ████████ ██████  ██    ██ ████████
  // ██   ██    ██    ████  ████ ██          ██    ██ ██    ██    ██    ██   ██ ██    ██    ██
  // ███████    ██    ██ ████ ██ ██          ██    ██ ██    ██    ██    ██████  ██    ██    ██
  // ██   ██    ██    ██  ██  ██ ██          ██    ██ ██    ██    ██    ██      ██    ██    ██
  // ██   ██    ██    ██      ██ ███████      ██████   ██████     ██    ██       ██████     ██

  return (
    <div className="App" style={{ display: "flex", justifyContent: "space-between" }}>
      {/* <div> */}
      {/*

██              ██████ ██      ██ ███████ ███    ██ ████████     ██      ██ ███████ ████████ 
██      ██     ██      ██      ██ ██      ████   ██    ██        ██      ██ ██         ██    
██             ██      ██      ██ █████   ██ ██  ██    ██        ██      ██ ███████    ██    
██      ██     ██      ██      ██ ██      ██  ██ ██    ██        ██      ██      ██    ██    
███████         ██████ ███████ ██ ███████ ██   ████    ██        ███████ ██ ███████    ██    

*/}

      {/* <div style={{ backgroundColor: "#f080805e", padding: 20 }}>
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
        </div> */}

      {/*

██████          ██████ ██   ██  █████  ████████      ██████  ██████  ███    ██ ████████ ██████   ██████  ██      ███████ 
██   ██ ██     ██      ██   ██ ██   ██    ██        ██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      ██      
██████         ██      ███████ ███████    ██        ██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      ███████ 
██   ██ ██     ██      ██   ██ ██   ██    ██        ██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██           ██ 
██   ██         ██████ ██   ██ ██   ██    ██         ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ ███████ 

*/}

      {/* <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            backgroundColor: "#add8e65c",
            padding: 20,
          }}
        >
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
              <input
                disabled
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
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
        </div> */}
      {/* </div> */}
      <div style={{ width: "100%" }}>
        <Routes>
          <Route path="session/*" element={<Session />} errorElement={<ErrorPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
