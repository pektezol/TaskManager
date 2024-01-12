package main

import (
	"fmt"
	"log"
	"os"
	"taskmanager/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	router := gin.Default()
	database.ConnectDB()
	// api.InitRoutes(router)
	router.Run(fmt.Sprintf(":%s", os.Getenv("PORT")))
}
