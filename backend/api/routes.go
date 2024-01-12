package api

import (
	"taskmanager/controllers"

	"github.com/gin-gonic/gin"
)

func InitRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/", controllers.Home)
	}
}
