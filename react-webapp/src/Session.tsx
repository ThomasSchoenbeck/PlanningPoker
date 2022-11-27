import { useContext, useEffect, useState } from "react"
import { Route, Routes } from "react-router-dom"
import { SessionContextInterface, SessionContext, SessionProvider } from "./context/sessionContext"
import { WebsocketContext, WebsocketContextInterface } from "./context/websocketContext"
import CreateSession from "./pages/createSession"
import ErrorPage from "./pages/error-page"

export default function Session() {
  const createSession = (e) => {}

  const sessionCreated = () => {}

  return (
    <SessionProvider>
      <Routes>
        <Route path="/" element={<CreateSession />} errorElement={<ErrorPage />} />
      </Routes>
    </SessionProvider>
  )
}
