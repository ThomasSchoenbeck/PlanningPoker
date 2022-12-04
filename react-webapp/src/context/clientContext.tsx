import { createContext, useContext, useEffect, useState } from "react"
import { json, useLocation, useNavigate } from "react-router-dom"
import { WebsocketContext, WebsocketContextInterface } from "./websocketContext"

export interface ClientContextInterface {
  clientName: string
  setClientName: (v: string) => void
}

export const ClientContext = createContext<ClientContextInterface | null>(null)

export const ClientProvider = ({ children }) => {
  const [clientName, setClientName] = useState<string>("")

  let location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (clientName !== "") {
      console.log("clientName changed", clientName)
      console.log("location", location)
      if (location.pathname === "/") {
        navigate("/session")
      }
      // navigate()
    }
  }, [clientName])

  return (
    <ClientContext.Provider value={{ clientName, setClientName }}>
      {children}
    </ClientContext.Provider>
  )
}
