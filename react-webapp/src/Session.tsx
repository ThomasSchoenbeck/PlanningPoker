import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import { SessionProvider } from "./context/sessionContext"
import { WebsocketProvider } from "./context/websocketContext"
import CreateSession from "./pages/createSession"
import ErrorPage from "./pages/error-page"
import SessionDetail from "./pages/sessionDetail"

interface SessionInfo {
  action: string
  sessionId: string
  token: string | null
}

export default function Session() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>()

  let { sessionId } = useParams()
  const useQuery = () => new URLSearchParams(useLocation().search)
  let query = useQuery()
  const urlToken = query.get("token")

  useEffect(() => {
    if (sessionId && urlToken !== null) {
      setSessionInfo({ action: "join", sessionId: sessionId, token: urlToken })
      // } else if (!sessionId && urlToken === null) {
      //   setSessionInfo({ action: "create", sessionId: "", token: null })
    }
  }, [])

  const createSession = () => {
    setSessionInfo({ action: "create", sessionId: "", token: null })
  }

  useEffect(() => {
    if (sessionInfo) console.info("SessionInfo changed", sessionInfo)
  }, [sessionInfo])

  return (
    <>
      {!sessionInfo ? (
        <CreateSession createSession={createSession} />
      ) : (
        <WebsocketProvider sessionInfo={sessionInfo}>
          <SessionProvider>
            <Routes>
              <Route path="/:sessionId" element={<SessionDetail />} errorElement={<ErrorPage />} />
              {/* <Route path="/" element={<CreateSession />} errorElement={<ErrorPage />} /> */}
            </Routes>
          </SessionProvider>
        </WebsocketProvider>
      )}
    </>
  )
}
