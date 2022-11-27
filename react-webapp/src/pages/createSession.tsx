import { useContext, useState } from "react"
import { SessionContext, SessionContextInterface } from "../context/sessionContext"
import { generate_token } from "../tokenGenerator"

export default function CreateSession() {
  const { session, setSession, sendMessage } = useContext(SessionContext) as SessionContextInterface

  const [token] = useState<string>(generate_token(128))

  const createSession = () => {
    sendMessage("create", undefined, token)
  }

  return (
    <>
      {session.id === "" && (
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <button onClick={createSession}>Create Session</button>
        </div>
      )}
    </>
  )
}
