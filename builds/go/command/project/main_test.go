package main

import "testing"

func TestGreeting(t *testing.T) {
	if greeting() != "Hello from Go." {
		t.Fatal("unexpected greeting")
	}
}
