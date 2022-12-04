package main

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/rs/xid"
	// fhws "github.com/fasthttp/websocket"
)

var (
	hub *Hub
)

// func wsHandler(c *fhws.Conn) {

// 	// serveWs(hub, w, r)
// 	serveWs(hub, c)

// }

func processMessage(wsm wsMessage, client Client) {
	switch messageType := wsm.MessageType; messageType {
	case "notification":
		log.Println("we got notification", wsm)
		hub.broadcast <- wsm
	// case "session":
	// 	handleSession(wsm, client)
	case "updateName":
		for _, client := range hub.clients {
			if client.Id == *wsm.ClientId {
				client.Name = wsm.MessageBody
			}
		}
	default:
		log.Println("we got default", wsm)
	}
}

func wsRespondWithError(client *Client, msg string) {
	log.Println("[ERROR]: responding ->", client.Id, *client.SessionId, msg)
	var newMessage wsMessage = wsMessage{MessageBody: msg, SessionId: client.SessionId, MessageType: "error", TargetClientId: &client.Id}
	client.conn.WriteJSON(newMessage)
}

func onMessage(client *Client) {
	var (
		msg []byte
		err error
	)
	for {
		if _, msg, err = client.conn.ReadMessage(); err != nil {
			log.Printf("error read: %v, %#v\n", err, client)
			if strings.Contains(err.Error(), "websocket: close") {
				client.hub.unregister <- client
			}
			break
		}

		var wsm wsMessage
		if err := json.Unmarshal(msg, &wsm); err != nil {
			log.Println("error unmarshalling message", err, string(msg))
			return
		}

		processMessage(wsm, *client)

	}
}

func createClient(sessionId *string, c *websocket.Conn) *Client {
	clientName := c.Query("clientName")
	id := xid.New().String()
	client := &Client{Id: id, Name: clientName, Connected: true, SessionId: sessionId, hub: hub, conn: c, send: make(chan wsMessage, 256)}
	var wsm wsMessage = wsMessage{MessageBody: client.Id, MessageType: "connectMessage", ClientId: &client.Id, SessionId: client.SessionId, TargetClientId: &client.Id}
	sendMessageToClient(wsm, client)
	return client
}

func main() {
	app := fiber.New()

	app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	hub = newHub()
	go hub.run()

	app.Get("/ws/createSession", websocket.New(func(conn *websocket.Conn) {
		client := createClient(nil, conn)

		createSession(client)
		onMessage(client)
	}))

	app.Get("/ws/:sessionId", websocket.New(func(conn *websocket.Conn) {
		// c.Locals is added to the *websocket.Conn
		// log.Println(c.Locals("allowed"))   // true
		// log.Println(c.Params("sessionId")) // 123
		// log.Println(c.Query("v"))          // 1.0
		// log.Println(c.Cookies("session"))  // ""
		// log.Println(c.Query("token"))

		sessionId := conn.Params("sessionId")
		token := conn.Query("token")

		client := createClient(&sessionId, conn)

		err := joinSession(&sessionId, &token, client)
		if err != nil {
			wsRespondWithError(client, err.Error())
			return
		}
		// client.hub.register <- registration{Client: client, sessionAction: sessionAction}

		// websocket.Conn bindings https://pkg.go.dev/github.com/fasthttp/websocket?tab=doc#pkg-index
		onMessage(client)

	}))

	// app.Get("ws2/:id", fhws.New(wsHandler))

	log.Fatal(app.Listen("127.0.0.1:3000"))
	// Access the websocket server: ws://localhost:3000/ws/123?v=1.0
	// https://www.websocket.org/echo.html
}
