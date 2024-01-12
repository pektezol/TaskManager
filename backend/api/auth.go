package api

import (
	"fmt"
	"os"
	"taskmanager/database"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func CheckAuth(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	// Validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET_KEY")), nil
	})
	if token == nil {
		c.Next()
		return
	}
	if err != nil {
		c.Next()
		return
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check exp
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.Next()
			return
		}
		var customerID int
		database.DB.QueryRow(`SELECT id FROM users WHERE email = $1`, claims["sub"]).Scan(&customerID)
		if customerID == 0 {
			c.Next()
			return
		}
		c.Set("user", customerID)
		c.Next()
	} else {
		c.Next()
		return
	}
}
