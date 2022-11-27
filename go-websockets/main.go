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
	case "session":
		handleSession(wsm, client)
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

	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		// c.Locals is added to the *websocket.Conn
		log.Println(c.Locals("allowed"))  // true
		log.Println(c.Params("id"))       // 123
		log.Println(c.Query("v"))         // 1.0
		log.Println(c.Cookies("session")) // ""

		// log.Printf("c: %#v\n", c)
		// log.Printf("conn: %#v\n", c.Conn)

		// addClientToList(c.Conn)
		id := xid.New()
		client := &Client{Id: id.String(), Name: "", Connected: true, SessionId: nil, OwnerSessionId: nil, hub: hub, conn: c, send: make(chan []byte, 256)}
		client.hub.register <- client

		// websocket.Conn bindings https://pkg.go.dev/github.com/fasthttp/websocket?tab=doc#pkg-index
		var (
			mt  int
			msg []byte
			err error
		)
		for {
			if mt, msg, err = c.ReadMessage(); err != nil {
				log.Println("error read:", err, client)
				if strings.Contains(err.Error(), "websocket: close") {
					client.hub.unregister <- client
				}
				break
			}
			log.Printf("recv: %s\n%#v\n", msg, c)
			log.Printf("mt: %#v\n", mt)
			log.Printf("err: %#v\n", err)

			var wsm wsMessage
			if err := json.Unmarshal(msg, &wsm); err != nil {
				log.Println("error unmarshalling message", err, string(msg))
				return
			}

			processMessage(wsm, *client)

			// if err = c.WriteMessage(mt, msg); err != nil {
			// 	log.Println("error write:", err)
			// 	break
			// }
		}

	}))

	// app.Get("ws2/:id", fhws.New(wsHandler))

	log.Fatal(app.Listen("127.0.0.1:3000"))
	// Access the websocket server: ws://localhost:3000/ws/123?v=1.0
	// https://www.websocket.org/echo.html
}
