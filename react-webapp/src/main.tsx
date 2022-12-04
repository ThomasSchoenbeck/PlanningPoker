import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

import { BrowserRouter } from "react-router-dom"
import { ClientProvider } from "./context/clientContext"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <ClientProvider>
      <App />
    </ClientProvider>
  </BrowserRouter>
)
