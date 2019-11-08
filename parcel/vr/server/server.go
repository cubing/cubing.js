package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     checkOrigin,
}

func checkOrigin(r *http.Request) bool {
	// u, err := url.Parse(r.Header.Get("Origin"))
	// if err != nil {
	// 	_ = fmt.Errorf("%s", err)
	// 	return false
	// }
	// // fmt.Printf("hostname: %#v\n", u.Hostname())
	// return u.Hostname() == "mirzakhani.local" || u.Hostname() == "localhost"

	// TODO: Local hostnames don't work on Android.
	return true
}

func echo(w http.ResponseWriter, r *http.Request) {
	fmt.Println("echo")
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	fmt.Println("echooooo")
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func send(w http.ResponseWriter, r *http.Request) {
	fmt.Println("echo")
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		_ = fmt.Errorf("upgrade: %s", err)
		return
	}
	fmt.Println("echooooo")
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			_ = fmt.Errorf("read: %s", err)
			break
		}
		log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message)
		if err != nil {
			_ = fmt.Errorf("write: %s", err)
			break
		}
	}
}

var receivers [](chan []byte)
var receiverListLock sync.Mutex

func registerSender(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Registering sender... ")
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	fmt.Println("registered sender!")
	for {
		mt, message, err := c.ReadMessage()
		if mt != websocket.TextMessage {
			_ = fmt.Errorf("wrong message type")
			break
		}
		if err != nil {
			_ = fmt.Errorf("read: %s", err)
			break
		}
		// _, _ = fmt.Printf("Received: %s", message)
		_, _ = fmt.Printf(" <")
		receiverListLock.Lock()
		for _, receiver := range receivers {
			go func(capturedReceiver chan []byte) {
				capturedReceiver <- message
			}(receiver)
		}
		receiverListLock.Unlock()
	}
}

func registerReceiver(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Registering receiver... ")
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		_ = fmt.Errorf("upgrade: %s", err)
		return
	}
	defer c.Close()
	fmt.Println("registered receiver!")
	messageChannel := make(chan []byte)
	receiverListLock.Lock()
	receivers = append(receivers, messageChannel)
	receiverListLock.Unlock()
	for message := range messageChannel {
		// _, _ = fmt.Printf("Sending: %s", message)
		_, _ = fmt.Printf(">")
		err = c.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			_ = fmt.Errorf("writed: %s", err)
			break
		}
	}
}

func main() {
	http.HandleFunc("/echo", echo)
	http.HandleFunc("/register-sender", registerSender)
	http.HandleFunc("/register-receiver", registerReceiver)

	log.Fatal(http.ListenAndServe(":8888", nil))
	fmt.Printf("Serving!")
}
