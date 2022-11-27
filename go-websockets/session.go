package main

import (
	"encoding/json"
	"log"

	"github.com/rs/xid"
)

func createNewSession(wsm wsMessage, client Client) {

	id := xid.New().String()
	client.SessionId = &id

	clientList := make(map[string]Client)
	clientList[client.Id] = client
	// var newSession wsSession = wsSession{id, "new Session", nil, clientList}

	var wssmb wsSessionMsgBody
	if err := json.Unmarshal([]byte(wsm.MessageBody), &wssmb); err != nil {
		log.Println("[SESSION]: createNewSession -> error unmarshalling wsm.MessageBody", err, string(wsm.MessageBody))
		return
	}

	var newSession wsSession = wsSession{id, "new Session", &client.Id, clientList, *wssmb.Token}

	hub.sessions[id] = newSession
	hub.clients[client.Id] = &client

	log.Println("client", *client.SessionId, *hub.clients[client.Id].SessionId)

	log.Println("got", len(hub.sessions), "sessions")

	// sessionId has to be still empty because client is not yet in an active session and therefore the session mapping would miss to send this message to the client because of sessionId missmatch

	ns, _ := json.Marshal(newSession)

	var newMessage wsMessage = wsMessage{MessageBody: string(ns), SessionId: &id, MessageType: "sessionCreated", TargetClientId: wsm.ClientId}

	log.Println("create new Session", newSession.Name, client.Id, "targetclientId:", *newMessage.TargetClientId, wsm)

	hub.broadcast <- newMessage
}

func joinSession(wsm wsMessage, client Client) {
	var wssmb wsSessionMsgBody
	if err := json.Unmarshal([]byte(wsm.MessageBody), &wssmb); err != nil {
		log.Println("[SESSION]: joinSession -> error unmarshalling wsm.MessageBody", err, string(wsm.MessageBody))
		return
	}

	if wssmb.SessionId != nil && wssmb.Token != nil {

		session := hub.sessions[*wssmb.SessionId]

		if *wssmb.Token == session.Token {

			// clientList := make(map[string]Client)
			clientList := session.ClientList
			client.SessionId = wssmb.SessionId
			hub.clients[client.Id] = &client

			clientList[client.Id] = client
			log.Println("added client to session", client.Id, *client.SessionId, *hub.clients[client.Id].SessionId)
			session.ClientList = clientList
			hub.sessions[*wssmb.SessionId] = session

			s, _ := json.Marshal(session)

			var newMessage wsMessage = wsMessage{MessageBody: string(s), SessionId: wssmb.SessionId, MessageType: "sessionJoined", TargetClientId: nil}

			hub.broadcast <- newMessage

			msg, _ := json.Marshal(newMessage)

			log.Printf("[%s] -> send message to %d clients\n", *wssmb.SessionId, len(clientList))
			for _, c := range clientList {
				log.Printf("[%s] -> send message to client: %s\n", *wssmb.SessionId, c.Id)
				if err := c.conn.WriteMessage(1, msg); err != nil {
					log.Println("error write:", err)
					// break
				}
			}

		} else {
			log.Println("wrong token client to session", *client.SessionId, *wssmb.Token, session.Token)
			var newMessage wsMessage = wsMessage{MessageBody: "wrong token", SessionId: wssmb.SessionId, MessageType: "sessionWrongToken", TargetClientId: &client.Id}

			hub.broadcast <- newMessage
		}
	}

}

func handleSession(wsm wsMessage, client Client) {
	switch action := wsm.MessageAction; *action {
	case "create":
		createNewSession(wsm, client)
	case "join":
		joinSession(wsm, client)
	}

}

func clientDisconnectedFromSession(cId string, sId string) {
	log.Println("clientDisconnectedFromSession", "client", cId, "session", sId)
	session := hub.sessions[sId]
	log.Println("delete client from session clientList", len(session.ClientList), session.ClientList)
	delete(session.ClientList, cId)
	if len(session.ClientList) == 0 {
		log.Println("deleting session because no more clients", len(session.ClientList), "session", sId)
		delete(hub.sessions, sId)
	} else {
		broadcastClientListToSession(sId)
	}

}

func broadcastClientListToSession(sessionId string) {

	log.Println("broadcastClientListToSession", sessionId)

	// if sessionId == nil {
	// 	return
	// }
	var clientList []Client

	for _, client := range hub.clients {
		log.Println("adding client to list", client, *client)
		log.Println("adding client to list", *client)
		clientList = append(clientList, *client)
	}

	clb, _ := json.Marshal(clientList)

	clientId := "Server"
	var newMessage wsMessage = wsMessage{MessageBody: string(clb), MessageType: "sessionClientListUpdate", ClientId: &clientId, SessionId: &sessionId, TargetClientId: nil}

	msg, _ := json.Marshal(newMessage)

	// hub.broadcast <- msg
	log.Println("broadcastClientList", sessionId, clientList, string(msg))

	// hub.broadcast <- newMessage

	for _, client := range hub.clients {
		if newMessage.SessionId == client.SessionId {

			if err := client.conn.WriteMessage(1, msg); err != nil {
				log.Println("error write:", err)
				// break
			}
		} else {
			log.Println("[SESSION]: broadcastClientListToSession -> client not part of session", newMessage, client)
		}
	}
}
