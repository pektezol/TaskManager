package api

import (
	"taskmanager/controllers"

	"github.com/gin-gonic/gin"
)

func InitRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// users
		api.GET("/users", CheckAuth, controllers.Users) // user list
		api.POST("/login", controllers.Login)
		api.POST("/register", controllers.Register)
		// projects
		api.GET("/projects", CheckAuth, controllers.ListProjects)                                          // project list
		api.GET("/projects/:projectid", CheckAuth, controllers.GetProject)                                 // project get
		api.POST("/projects", CheckAuth, controllers.CreateProject)                                        // project create
		api.DELETE("/projects/:projectid", CheckAuth, controllers.DeleteProject)                           // project delete
		api.POST("/projects/:projectid/collaborator", CheckAuth, controllers.AddCollaborator)              // project add collaborator
		api.DELETE("/projects/:projectid/collaborator/:userid", CheckAuth, controllers.RemoveCollaborator) // project remove collaborator
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
