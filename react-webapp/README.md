## message input

```ts
// ███    ███ ███████ ███████ ███████  █████   ██████  ███████     ██ ███    ██ ██████  ██    ██ ████████
// ████  ████ ██      ██      ██      ██   ██ ██       ██          ██ ████   ██ ██   ██ ██    ██    ██
// ██ ████ ██ █████   ███████ ███████ ███████ ██   ███ █████       ██ ██ ██  ██ ██████  ██    ██    ██
// ██  ██  ██ ██           ██      ██ ██   ██ ██    ██ ██          ██ ██  ██ ██ ██      ██    ██    ██
// ██      ██ ███████ ███████ ███████ ██   ██  ██████  ███████     ██ ██   ████ ██       ██████     ██

const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
  // console.log("changing value to", e.target.value)
  setMessage(e.target.value)
}

const sendMessage = () => {
  console.log("sending message", message, ws, ws.current)
  if (!ws.current) return
  let newMessage: wsMessage = {
    clientId: wsClientId,
    messageType: "notification",
    messageBody: message,
  }
  // if specific client is selected, add propery to message
  if (selectedClient !== "all") newMessage.targetClientId = selectedClient
  console.log("sending message", newMessage)
  ws.current.send(JSON.stringify(newMessage))
}

const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
  // console.log("used key", e.key)
  switch (e.key) {
    case "Enter":
      sendMessage()
      break
    case "Escape":
      setMessage("")
      break
    default:
      break
  }
}

const handleClientSelect = (e: ChangeEvent<HTMLSelectElement>) => {
  console.log("selected client", e.target.value)
  setSelectedClient(e.target.value)
}
```
