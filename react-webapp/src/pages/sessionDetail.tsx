import { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { SessionContext, SessionContextInterface } from "../context/sessionContext"
import { WebsocketContext, WebsocketContextInterface } from "../context/websocketContext"
import { generate_token } from "../tokenGenerator"

export default function SessionDetail() {
  let navigate = useNavigate()

  const { ws, wsClientId } = useContext(WebsocketContext) as WebsocketContextInterface
  const { session, setSession, sendMessage } = useContext(SessionContext) as SessionContextInterface

  let { id } = useParams()

  const useQuery = () => new URLSearchParams(useLocation().search)
  let query = useQuery()
  // let [urlToken] = useQuery()
  const joinSession = (sid: string, token: string) => {
    console.log("asking to join session", sid, token)
    sendMessage("join", sid, token)
  }

  useEffect(() => {
    const urlToken = query.get("token")
    console.log("sessionDetail", { session, id, urlToken })
  }, [])

  useEffect(() => {
    if (!ws.current) return
    const urlToken = query.get("token")
    console.log("we have a session", session, urlToken)

    // if (session.id === "" && id !== "" && token !== "") {
    if (session.id === "" && id && id !== "" && urlToken !== null) {
      joinSession(id, urlToken)
    }
  }, [ws.current, session])

  // useEffect(() => {
  //   console.log("we have a session id", id)
  // }, [id])

  // const [clientList, setClientList] = useState<wsClient[]>([])

  // useEffect(() => {
  //   console.log("we have a session id", id)

  //   console.log("session.clientList", session.clientList, typeof session.clientList)
  //   // session.clientList = new Map(Object.entries(session.clientList))
  //   // console.log("session.clientList", session.clientList, typeof session.clientList)

  //   let nameAgeMapping = new Map<string, wsClient>()

  //   nameAgeMapping.set("Lokesh", { id: "", name: "" })
  //   // nameAgeMapping.set("Raj", 35)
  //   // nameAgeMapping.set("John", 40)

  //   //1. Iterate over map keys

  //   for (let key of nameAgeMapping.keys()) {
  //     console.log(key) //Lokesh Raj John
  //   }

  //   console.log("nameAgeMapping", nameAgeMapping)

  //   let clients: wsClient[] = []
  //   if (session.clientList && session.clientList !== null) {
  //     console.log(session.clientList.size)
  //     console.log(session.clientList.keys())
  //     let keys = session.clientList.keys()
  //     console.log("keys", keys)
  //     session.clientList.forEach((e) => {
  //       clients.push(e)
  //     })

  //     // for (let value of session.clientList.values()) {
  //     //   console.log(value)
  //     // }

  //     // setClientList(Array.from(session.clientList.values()))
  //     // setClientList(clients)
  //   }
  // }, [session.clientList])

  return (
    <div style={{ width: "100%", display: "flex", gap: 5, justifyContent: "space-around" }}>
      <div>
        <div>
          <button onClick={() => navigate("/session")}>go back</button>
          <button>close session</button>
          <h3>Session: {session.id}</h3>
          <div>
            <div>urlToken: {query.get("token")}</div>
            <div>ownerToken: {session.ownerId === wsClientId && session.token}</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
        <div>Client List</div>
        <div>
          {[...session.clientList.values()].map((e) => (
            <button key={e.id}>{e.name}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
