import { useContext, useState } from "react"
import { ClientContext, ClientContextInterface } from "../context/clientContext"

export default function SetupClient() {
  const { setClientName } = useContext(ClientContext) as ClientContextInterface

  const [localClientName, setLocalClientName] = useState<string>("")

  return (
    <div>
      <div>
        <label htmlFor="clientName">Client Name:</label>
        <input
          id="clientName"
          value={localClientName}
          onChange={(e) => setLocalClientName(e.target.value)}
        />
      </div>
      <div>
        <button onClick={() => setLocalClientName("")}>cancel</button>
        <button onClick={() => setClientName(localClientName)}>accept</button>
      </div>
    </div>
  )
}
