package main

import (
	"github.com/rs/xid"
)

var (
	sessionList []wsSession
)

func createNewSession() {
	id := xid.New()
	var newSession wsSession = wsSession{id.String(), "new Session", nil}
	sessionList = append(sessionList, newSession)
}
