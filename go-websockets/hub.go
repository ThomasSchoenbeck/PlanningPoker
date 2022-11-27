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
		clients:    make(map[string]*Client),
		sessions:   make(map[string]wsSession),
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
			h.clients[client.Id] = client

			var wsm wsMessage = wsMessage{MessageBody: client.Id, MessageType: "connectMessage", ClientId: &client.Id, SessionId: nil, TargetClientId: nil}

			// message := []byte(fmt.Sprintf("%v", wsm))
			message, _ := json.Marshal(wsm)
			if err := client.conn.WriteMessage(mt, message); err != nil {
				log.Println("error write:", err)
				// break
			}
		case client := <-h.unregister:
			var cId string = client.Id
			var sId *string = h.clients[client.Id].SessionId
			log.Printf("client %#v\n", client)
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
			}
		case message := <-h.broadcast:
			log.Println("got message to send", message, h.clients)
			msg, _ := json.Marshal(message)
			for _, client := range h.clients {
				log.Println("loop client", client)
				select {
				case client.send <- msg:

					if message.TargetClientId != nil {
						log.Println("message targetclientId?", *message.TargetClientId, client.Id)
						if *message.TargetClientId == client.Id {

							log.Println("writing message to target id")
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
					delete(h.clients, client.Id)
				}
			}
			log.Println("current clients", len(hub.clients), hub.clients)
		}
	}
}
