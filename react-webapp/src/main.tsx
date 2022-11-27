import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

import { BrowserRouter } from "react-router-dom"
import { WebsocketProvider } from "./context/websocketContext"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <WebsocketProvider>
      <App />
    </WebsocketProvider>
  </BrowserRouter>
)
