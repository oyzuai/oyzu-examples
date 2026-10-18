package shared

import "testing"

func TestGreeting(t *testing.T) {
	if Greeting() != "Hello from the workspace library." {
		t.Fatal("unexpected greeting")
	}
}
