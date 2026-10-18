package main

import (
 "embed"
 "flag"
 "fmt"
 "io/fs"
 "net/http"
)

//go:embed site/*
var site embed.FS

func main() {
 listen := flag.String("listen", "127.0.0.1:8099", "local listen address")
 flag.Parse()
 root, err := fs.Sub(site, "site")
 if err != nil { panic(err) }
 http.Handle("/", http.FileServer(http.FS(root)))
 http.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")
  fmt.Fprintln(w, `{"message":"Hello from the delivered service."}`)
 })
 if err := http.ListenAndServe(*listen, nil); err != nil { panic(err) }
}
