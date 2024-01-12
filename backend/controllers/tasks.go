package controllers

import (
	"net/http"
	"strconv"
	"taskmanager/database"
	"taskmanager/utils"
	"time"

	"github.com/gin-gonic/gin"
)

func ListTasks(c *gin.Context) {
	userID, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	pathProjectID := c.Param("projectid")
	projectID, err := strconv.Atoi(pathProjectID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var validateUserIsOwner int
	var validateUserIsCollaborator int
	database.DB.QueryRow("SELECT id FROM projects WHERE project_id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	type Task struct {
		ID          int        `json:"id"`
		Owner       utils.User `json:"owner"`
		Name        string     `json:"name"`
		Description string     `json:"description"`
		Status      string     `json:"status"`
		Priority    string     `json:"priority"`
		CreatedAt   time.Time  `json:"created_at"`
		Deadline    time.Time  `json:"deadline"`
	}
	type TasksResponse struct {
		Tasks []Task `json:"tasks"`
	}
	tasks := []Task{}
	sql := `SELECT t.id, u.id, u.username, u.email, t.name, t.description, s.name, p.name t.created_at, t.deadline FROM tasks t JOIN users u ON t.owner_id = u.id JOIN status s ON t.status = s.id JOIN priority p ON t.priority = p.id JOIN projects p ON t.project_id = p.id WHERE p.id = $1 AND t.active = true;`
	rows, err := database.DB.Query(sql, projectID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var t Task
		err = rows.Scan(&t.ID, &t.Owner.ID, &t.Owner.Username, &t.Owner.Email, &t.Name, &t.Description, &t.Status, &t.Priority, &t.CreatedAt, &t.Deadline)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		tasks = append(tasks, t)
	}
	c.JSON(http.StatusOK, utils.OkayResponse(
		TasksResponse{
			Tasks: tasks,
		},
	))
}

func GetTask(c *gin.Context) {
	userID, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	pathProjectID := c.Param("projectid")
	projectID, err := strconv.Atoi(pathProjectID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	pathTaskID := c.Param("taskid")
	taskID, err := strconv.Atoi(pathTaskID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var validateUserIsOwner int
	var validateUserIsCollaborator int
	database.DB.QueryRow("SELECT id FROM projects WHERE project_id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	type Task struct {
		ID          int        `json:"id"`
		Owner       utils.User `json:"owner"`
		Name        string     `json:"name"`
		Description string     `json:"description"`
		Status      string     `json:"status"`
		Priority    string     `json:"priority"`
		CreatedAt   time.Time  `json:"created_at"`
		Deadline    time.Time  `json:"deadline"`
	}
	var t Task
	sql := `SELECT t.id, u.id, u.username, u.email, t.name, t.description, s.name, p.name t.created_at, t.deadline FROM tasks t JOIN users u ON t.owner_id = u.id JOIN status s ON t.status = s.id JOIN priority p ON t.priority = p.id JOIN projects p ON t.project_id = p.id WHERE p.id = $1 AND t.id = $2 AND t.active = true;`
	database.DB.QueryRow(sql, projectID, taskID).Scan(&t.ID, &t.Owner.ID, &t.Owner.Username, &t.Owner.Email, &t.Name, &t.Description, &t.Status, &t.Priority, &t.CreatedAt, &t.Deadline)
	if t.ID != taskID {
		c.JSON(http.StatusOK, utils.ErrorResponse("Given task is not found."))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(t))
}

func CreateTask(c *gin.Context) {
	userID, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	pathProjectID := c.Param("projectid")
	projectID, err := strconv.Atoi(pathProjectID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var validateUserIsOwner int
	var validateUserIsCollaborator int
	database.DB.QueryRow("SELECT id FROM projects WHERE project_id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	type TaskCreateRequest struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description" binding:"required"`
		StatusID    int    `json:"status_id" binding:"required"`
		PriorityID  int    `json:"priority_id" binding:"required"`
		Deadline    string `json:"deadline"`
	}
	var req TaskCreateRequest
	err = c.BindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var deadlineTime any
	if req.Deadline != "" {
		deadlineTime, err = time.Parse("2006-01-02", req.Deadline)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
	} else {
		deadlineTime = nil
	}
	sql := `INSERT INTO tasks (project_id,owner_id,name,description,status,priority,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7)`
	_, err = database.DB.Exec(sql, projectID, userID, req.Name, req.Description, req.StatusID, req.PriorityID, deadlineTime)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(req))
}
