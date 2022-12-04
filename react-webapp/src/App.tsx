import { useContext, useEffect } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import "./App.css"
import { ClientContext, ClientContextInterface } from "./context/clientContext"
import ErrorPage from "./pages/error-page"
import SetupClient from "./pages/setupClient"
import Session from "./Session"

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const { clientName } = useContext(ClientContext) as ClientContextInterface

  useEffect(() => {
    console.log("location", location, location.pathname.includes("/session/"))
    if (location.pathname.includes("/session/")) {
      return
    } else {
      console.log("changing route to session")
      // navigate("/session")
    }
  }, [])

  return (
    <div className="App" style={{ display: "flex", justifyContent: "space-between" }}>
      {clientName === "" ? (
        <SetupClient />
      ) : (
        <div style={{ width: "100%" }}>
          <Routes>
            <Route path="session/*" element={<Session />} errorElement={<ErrorPage />} />
          </Routes>
        </div>
      )}
    </div>
  )
}

export default App
