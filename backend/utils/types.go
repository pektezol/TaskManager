package utils

import "time"

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

type Project struct {
	ID            int       `json:"id"`
	Name          string    `json:"username"`
	Owner         User      `json:"owner"`
	Collaborators []User    `json:"collaborators"`
	CreatedAt     time.Time `json:"created_at"`
}
