// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"encoding/json"
	"log"
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[string]*Client

	// Active sessions.
	sessions map[string]wsSession

	// Inbound messages from the clients.
	// broadcast chan []byte
	broadcast chan wsMessage

	// Register requests from the clients.
	// register chan registration

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		// broadcast:  make(chan []byte),
		broadcast: make(chan wsMessage),
		// register:   make(chan registration),
		unregister: make(chan *Client),
		clients:    make(map[string]*Client),
		sessions:   make(map[string]wsSession),
	}
}

func sendMessageToClient(wsm wsMessage, client *Client) {
	var mt int = 1 // textmessage // 2 binarymessage
	message, _ := json.Marshal(wsm)
	if err := client.conn.WriteMessage(mt, message); err != nil {
		log.Println("error write:", err)
		// break
	}
}

func (h *Hub) run() {

	for {
		select {
		// case registration := <-h.register:
		// 	log.Println("new client registered")
		// 	h.clients[registration.Client.Id] = registration.Client

		// 	if registration.sessionAction == "create" {
		// 		createNewSession()
		// 	}
		// 	if registration.Client.Token != nil && registration.Client.SessionId != nil {
		// 		joinSession(*registration.Client, registration.Client.SessionId, registration.Client.Token)
		// 	}

		// 	var wsm wsMessage = wsMessage{MessageBody: registration.Client.Id, MessageType: "connectMessage", ClientId: &registration.Client.Id, SessionId: registration.Client.SessionId, TargetClientId: nil}

		// 	// message := []byte(fmt.Sprintf("%v", wsm))
		// 	message, _ := json.Marshal(wsm)
		// 	if err := registration.Client.conn.WriteMessage(mt, message); err != nil {
		// 		log.Println("error write:", err)
		// 		// break
		// 	}
		case client := <-h.unregister:
			var cId string = client.Id
			var sId *string = client.SessionId
			// log.Printf("client %#v\n", client)
			if _, ok := h.clients[client.Id]; ok {
				log.Println("client unregistered", client.Id, client.SessionId)
				delete(h.clients, client.Id)
				close(client.send)
				if sId != nil {
					clientDisconnectedFromSession(cId, *sId)
				} else {
					log.Println("no session id", client)
				}
				// broadcastClientList(sId)
			} else {
				log.Println("[unregister] client not found in list", client.Id, h.clients[client.Id])
			}
		case message := <-h.broadcast:
			log.Println("got message to send", message.MessageType)

			sessionId := *message.SessionId
			session := hub.sessions[sessionId]

			for _, client := range session.ClientList {
				log.Println("loop session clients", client)
				select {
				case client.send <- message:

					clientSessionId := *client.SessionId

					if message.TargetClientId != nil {
						log.Println("message targetclientId?", *message.TargetClientId, client.Id)
						if *message.TargetClientId == client.Id {

							log.Println("writing message to target id")
							sendMessageToClient(message, client)
						}
						continue
					}

					if sessionId == clientSessionId {

						sendMessageToClient(message, client)
					} else {
						log.Println("client not part of session", *message.SessionId, *client.SessionId)
					}
				default:
					log.Println("Broadcast default, deleting client", client.Id)
					close(client.send)
					delete(h.clients, client.Id)
				}
			}

			// for _, client := range h.clients {
			// 	log.Println("loop client", client)
			// 	select {
			// 	case client.send <- message:

			// 		if message.TargetClientId != nil {
			// 			log.Println("message targetclientId?", *message.TargetClientId, client.Id)
			// 			if *message.TargetClientId == client.Id {

			// 				log.Println("writing message to target id")
			// 				sendMessageToClient(message, client)
			// 			}
			// 			continue
			// 		}

			// 		if message.SessionId == client.SessionId {

			// 			sendMessageToClient(message, client)
			// 		} else {
			// 			log.Println("client not part of session", message, client)
			// 		}
			// 	default:
			// 		log.Println("Broadcast default, deleting client", client.Id)
			// 		close(client.send)
			// 		delete(h.clients, client.Id)
			// 	}
			// }
			log.Println("current clients", len(hub.clients), hub.clients)
		}
	}
}
