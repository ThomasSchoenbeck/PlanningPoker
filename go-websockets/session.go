package main

import (
	"github.com/rs/xid"
)

func createNewSession(wsm wsMessage) {
	id := xid.New().String()

	// var clientList []Client
	// var newSession wsSession = wsSession{id, "new Session", nil, clientList}
	var newSession wsSession = wsSession{id, "new Session", nil, nil}

	hub.sessions[id] = newSession

	// sessionId has to be still empty because client is not yet in an active session and therefore the session mapping would miss to send this message to the client because of sessionId missmatch
	var newMessage wsMessage = wsMessage{MessageBody: "id", SessionId: &id, MessageType: "sessionCreated", TargetClientId: wsm.ClientId}

	hub.broadcast <- newMessage
}

func handleSession(wsm wsMessage) {
	switch action := wsm.MessageAction; *action {
	case "create":
		createNewSession(wsm)
	}
}
