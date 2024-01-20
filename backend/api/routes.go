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
		api.GET("/projects/:projectid/tasks", CheckAuth, controllers.ListTasks)                                  // task list
		api.GET("/projects/:projectid/tasks/:taskid", CheckAuth, controllers.GetTask)                            // task get
		api.POST("/projects/:projectid/tasks", CheckAuth, controllers.CreateTask)                                // task create
		api.PUT("/projects/:projectid/tasks/:taskid", CheckAuth, controllers.UpdateTask)                         // task update
		api.DELETE("/projects/:projectid/tasks/:taskid", CheckAuth, controllers.DeleteTask)                      // task delete
		api.POST("/projects/:projectid/tasks/:taskid/comment", CheckAuth, controllers.CreateComment)             // task add comment
		api.POST("/projects/:projectid/tasks/:taskid/assignee", CheckAuth, controllers.AddAssignee)              // task add assignee
		api.DELETE("/projects/:projectid/tasks/:taskid/assignee/:userid", CheckAuth, controllers.RemoveAssignee) // task remove assignee
		// priority
		api.GET("/priority", CheckAuth, controllers.ListPriority) // priority list
		// status
		api.GET("/status", CheckAuth, controllers.ListStatus) // status list
		// notifications
		api.GET("/notifications", CheckAuth, controllers.ListNotifications)                     // notification list
		api.PUT("/notifications/:notificationid", CheckAuth, controllers.ReadNotification)      // notification update
		api.DELETE("/notifications/:notificationid", CheckAuth, controllers.DeleteNotification) // notification delete
		// contact
		api.POST("/contact", controllers.Contact) // contact
	}
}
