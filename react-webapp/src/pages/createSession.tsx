interface Props {
  createSession: () => void
}

export default function CreateSession(props: Props) {
  const createSession = () => {
    props.createSession()
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      <button onClick={createSession}>Create Session</button>
    </div>
  )
}
