package main

import (
	// "github.com/fasthttp/websocket"
	"github.com/gofiber/websocket/v2"
)

type (
	// wsClient struct {
	// 	Id             string  `json:"id"`
	// 	Name           string  `json:"name"`
	// 	Connected      bool    `json:"connected"`
	// 	SessionId      *string `json:"sessionId"`
	// 	OwnerSessionId *string `json:"ownerSessionId"`
	// 	Conn           *websocket.Conn
	// }

	wsSession struct {
		Id         string   `json:"id"`
		Name       string   `json:"name"`
		OwnerId    *string  `json:"ownerId"`
		ClientList []Client `json:"clientList"`
	}

	wsMessage struct {
		MessageBody   string  `json:"messageBody"`
		MessageType   string  `json:"messageType"`
		MessageAction *string `json:"messageAction"`
		ClientId      *string `json:"clientId"`
		SessionId     *string `json:"sessionId"`
		// if target client id msg is only for that specific client
		TargetClientId *string `json:"targetClientId"`
	}

	// Client is a middleman between the websocket connection and the hub.
	Client struct {
		Id             string  `json:"id"`
		Name           string  `json:"name"`
		Connected      bool    `json:"connected"`
		SessionId      *string `json:"sessionId"`
		OwnerSessionId *string `json:"ownerSessionId"`

		hub *Hub

		// The websocket connection.
		conn *websocket.Conn

		// Buffered channel of outbound messages.
		send chan []byte
	}
)
