package main

import (
	"log"

	"github.com/gofiber/websocket/v2"
	"github.com/rs/xid"
)

var (
	clientList []wsClient
)

func addClientToList(conn *websocket.Conn) {
	id := xid.New()
	var newClient wsClient = wsClient{id.String(), "", true, nil, nil, conn}

	clientList = append(clientList, newClient)
	log.Println("added client", clientList)
}

func getClientList() []wsClient {
	return clientList
}
