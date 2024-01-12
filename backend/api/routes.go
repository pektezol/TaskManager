package api

import (
	"taskmanager/controllers"

	"github.com/gin-gonic/gin"
)

func InitRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// users
		api.GET("/users", controllers.Users) // user list
		api.POST("/login", controllers.Login)
		api.POST("/register", controllers.Register)
		// projects
		api.GET("/projects")                                    // project list
		api.GET("/projects/:projectid")                         // project get
		api.POST("/projects")                                   // project create
		api.DELETE("/projects/:projectid")                      // project delete
		api.POST("/projects/:projectid/collaborator")           // project add collaborator
		api.DELETE("/projects/:projectid/collaborator/:userid") // project remove collaborator
		// tasks
		api.GET("/projects/:projectid/tasks")                             // task list
		api.GET("/projects/:projectid/tasks/:taskid")                     // task get
		api.POST("/projects/:projectid/tasks")                            // task create
		api.PUT("/projects/:projectid/tasks/:taskid")                     // task update
		api.DELETE("/projects/:projectid/tasks/:taskid")                  // task delete
		api.POST("/projects/:projectid/tasks/:taskid/comment")            // task add comment
		api.POST("/projects/:projectid/tasks/:taskid/assignee")           // task add assignee
		api.DELETE("/projects/:projectid/tasks/:taskid/assignee/:userid") // task remove assignee
		// priority
		api.GET("/priority") // priority list
		// status
		api.GET("/status") // status list
		// notifications
		api.GET("/notifications")                    // notification list
		api.PUT("/notifications/:notificationid")    // notification update
		api.DELETE("/notifications/:notificationid") // notification delete
	}
}
