import { useContext } from "react"
import { SessionContext, SessionContextInterface } from "../context/sessionContext"

export default function CreateSession() {
  const { session, setSession } = useContext(SessionContext) as SessionContextInterface

  return (
    <>
      {session.sessionId === "" ? (
        <div>
          <button>Create Session</button>
        </div>
      ) : (
        <div>
          <div>{session?.name}</div>
          <div>
            <div>ClientList</div>
            <div></div>
          </div>
        </div>
      )}
    </>
  )
}
