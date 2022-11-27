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
	clients map[*Client]bool

	// Active sessions.
	sessions map[string]wsSession

	// Inbound messages from the clients.
	// broadcast chan []byte
	broadcast chan wsMessage

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		// broadcast:  make(chan []byte),
		broadcast:  make(chan wsMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		sessions:   make(map[string]wsSession),
	}
}

func broadcastClientList(sessionId *string) {
	// if sessionId == nil {
	// 	return
	// }
	var clientList []Client

	for client := range hub.clients {
		log.Println("adding client to list", client, *client)
		log.Println("adding client to list", *client)
		clientList = append(clientList, *client)
	}

	clb, _ := json.Marshal(clientList)

	clientId := "Server"
	var newMessage wsMessage = wsMessage{MessageBody: string(clb), MessageType: "clientListUpdate", ClientId: &clientId, SessionId: sessionId, TargetClientId: nil}

	msg, _ := json.Marshal(newMessage)

	// hub.broadcast <- msg
	log.Println("broadcastClientList", sessionId, clientList, string(msg))

	// hub.broadcast <- newMessage

	for client := range hub.clients {
		if newMessage.SessionId == client.SessionId {

			if err := client.conn.WriteMessage(1, msg); err != nil {
				log.Println("error write:", err)
				// break
			}
		} else {
			log.Println("client not part of session", newMessage, client)
		}
	}

}

func (h *Hub) run() {
	var (
		mt int = 1 // textmessage // 2 binarymessage
	)
	for {
		select {
		case client := <-h.register:
			log.Println("new client registered")
			h.clients[client] = true

			var wsm wsMessage = wsMessage{MessageBody: client.Id, MessageType: "connectMessage", ClientId: &client.Id, SessionId: nil, TargetClientId: nil}

			// message := []byte(fmt.Sprintf("%v", wsm))
			message, _ := json.Marshal(wsm)
			if err := client.conn.WriteMessage(mt, message); err != nil {
				log.Println("error write:", err)
				// break
			}
		case client := <-h.unregister:
			var sId *string = client.SessionId
			if _, ok := h.clients[client]; ok {
				log.Println("client unregistered", client.Id)
				delete(h.clients, client)
				close(client.send)
				broadcastClientList(sId)
			}
		case message := <-h.broadcast:
			log.Println("got message to send", message, h.clients)
			msg, _ := json.Marshal(message)
			for client := range h.clients {
				log.Println("loop client", client)
				select {
				case client.send <- msg:

					// w, err := client.conn.NextWriter(websocket.TextMessage)
					// if err != nil {
					// 	log.Println("error", err)
					// 	return
					// }
					// log.Println("want to send message to", client)
					// w.Write(message)
					// // Add queued chat messages to the current websocket message.
					// n := len(client.send)
					// for i := 0; i < n; i++ {
					// 	w.Write(newline)
					// 	w.Write(<-client.send)
					// }

					// if err := w.Close(); err != nil {
					// 	return
					// }

					if message.TargetClientId != nil {
						if message.TargetClientId == &client.Id {

							if err := client.conn.WriteMessage(mt, msg); err != nil {
								log.Println("error write:", err)
								// break
								return
							}
						}
						continue
					}

					if message.SessionId == client.SessionId {

						if err := client.conn.WriteMessage(mt, msg); err != nil {
							log.Println("error write:", err)
							// break
						}
					} else {
						log.Println("client not part of session", message, client)
					}
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			log.Println("current clients", len(hub.clients), hub.clients)
		}
	}
}
