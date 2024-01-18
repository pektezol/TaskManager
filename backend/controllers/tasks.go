package controllers

import (
	"fmt"
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
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
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
		CreatedAt   string     `json:"created_at"`
		Deadline    *string    `json:"deadline"`
	}
	type TasksResponse struct {
		Tasks []Task `json:"tasks"`
	}
	tasks := []Task{}
	sql := `SELECT t.id, u.id, u.username, u.email, t.name, t.description, s.name, p.name, t.created_at, t.deadline FROM tasks t JOIN users u ON t.owner_id = u.id JOIN status s ON t.status = s.id JOIN priority p ON t.priority = p.id JOIN projects pr ON t.project_id = pr.id WHERE pr.id = $1 AND t.active = true;`
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
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	type Comment struct {
		ID        int        `json:"id"`
		Commentor utils.User `json:"commentor"`
		Comment   string     `json:"comment"`
		CreatedAt string     `json:"created_at"`
	}
	type Task struct {
		ID          int          `json:"id"`
		Owner       utils.User   `json:"owner"`
		Name        string       `json:"name"`
		Description string       `json:"description"`
		Status      string       `json:"status"`
		Priority    string       `json:"priority"`
		Assignees   []utils.User `json:"assignees"`
		Comments    []Comment    `json:"comments"`
		CreatedAt   string       `json:"created_at"`
		Deadline    *string      `json:"deadline"`
	}
	var t Task
	sql := `SELECT t.id, u.id, u.username, u.email, t.name, t.description, s.name, p.name, t.created_at, t.deadline FROM tasks t JOIN users u ON t.owner_id = u.id JOIN status s ON t.status = s.id JOIN priority p ON t.priority = p.id JOIN projects pr ON t.project_id = pr.id WHERE pr.id = $1 AND t.id = $2 AND t.active = true;`
	database.DB.QueryRow(sql, projectID, taskID).Scan(&t.ID, &t.Owner.ID, &t.Owner.Username, &t.Owner.Email, &t.Name, &t.Description, &t.Status, &t.Priority, &t.CreatedAt, &t.Deadline)
	if t.ID != taskID {
		c.JSON(http.StatusOK, utils.ErrorResponse("Given task is not found."))
		return
	}
	sql = `SELECT c.id, c.comment, c.created_at, u.id, u.username, u.email FROM task_comments c JOIN users u ON c.user_id = u.id WHERE c.task_id = $1`
	rows, err := database.DB.Query(sql, t.ID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	t.Comments = []Comment{}
	for rows.Next() {
		var c Comment
		rows.Scan(&c.ID, &c.Comment, &c.CreatedAt, &c.Commentor.ID, &c.Commentor.Username, &c.Commentor.Email)
		t.Comments = append(t.Comments, c)
	}
	sql = `SELECT u.id, u.username, u.email FROM task_assignees a JOIN users u ON a.user_id = u.id WHERE a.task_id = $1`
	rows, err = database.DB.Query(sql, t.ID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	t.Assignees = []utils.User{}
	for rows.Next() {
		var u utils.User
		rows.Scan(&u.ID, &u.Username, &u.Email)
		t.Assignees = append(t.Assignees, u)
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
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
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
	type TaskCreateResponse struct {
		ID          int    `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		StatusID    int    `json:"status_id"`
		PriorityID  int    `json:"priority_id"`
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
	var taskID int
	sql := `INSERT INTO tasks (project_id,owner_id,name,description,status,priority,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id;`
	err = database.DB.QueryRow(sql, projectID, userID, req.Name, req.Description, req.StatusID, req.PriorityID, deadlineTime).Scan(&taskID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	resp := TaskCreateResponse{
		ID:          taskID,
		Name:        req.Name,
		Description: req.Description,
		StatusID:    req.StatusID,
		PriorityID:  req.PriorityID,
		Deadline:    req.Deadline,
	}
	c.JSON(http.StatusOK, utils.OkayResponse(resp))
}

func UpdateTask(c *gin.Context) {
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
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	type TaskUpdateRequest struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description" binding:"required"`
		StatusID    int    `json:"status_id" binding:"required"`
		PriorityID  int    `json:"priority_id" binding:"required"`
		Deadline    string `json:"deadline"`
	}
	var req TaskUpdateRequest
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
	sql := `UPDATE tasks SET project_id = $1, owner_id = $2, name = $3, description = $4, status = $5, priority = $6, deadline = $7 WHERE id = $8 AND active = true`
	_, err = database.DB.Exec(sql, projectID, userID, req.Name, req.Description, req.StatusID, req.PriorityID, deadlineTime, taskID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	sql = `SELECT a.user_id FROM task_assignees a WHERE a.task_id = $1`
	rows, err := database.DB.Query(sql, taskID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var aID int
		err = rows.Scan(&aID)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		CreateNotification(aID, fmt.Sprintf("The task #%d that you are assigned to has been updated.", taskID))
	}
	sql = `SELECT t.owner_id FROM tasks t WHERE t.id = $1`
	var oID int
	err = database.DB.QueryRow(sql, taskID).Scan(&oID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	CreateNotification(oID, fmt.Sprintf("The task #%d that you are the owner to has been updated.", taskID))
	c.JSON(http.StatusOK, utils.OkayResponse(req))
}

func DeleteTask(c *gin.Context) {
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
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	sql := `UPDATE tasks SET active = false WHERE id = $1`
	_, err = database.DB.Exec(sql, taskID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	sql = `SELECT a.user_id FROM task_assignees a WHERE a.task_id = $1`
	rows, err := database.DB.Query(sql, taskID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var aID int
		err = rows.Scan(&aID)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		CreateNotification(aID, fmt.Sprintf("The task #%d that you are assigned to has been deleted.", taskID))
	}
	sql = `SELECT t.owner_id FROM tasks t WHERE t.id = $1`
	var oID int
	err = database.DB.QueryRow(sql, taskID).Scan(&oID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	CreateNotification(oID, fmt.Sprintf("The task #%d that you are the owner to has been deleted.", taskID))
	c.JSON(http.StatusOK, utils.OkayResponse(nil))
}

func CreateComment(c *gin.Context) {
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
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	type CommentCreateRequest struct {
		Comment string `json:"comment" binding:"required"`
	}
	var req CommentCreateRequest
	err = c.BindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	sql := `INSERT INTO task_comments (task_id,user_id,comment) VALUES ($1,$2,$3);`
	_, err = database.DB.Exec(sql, taskID, userID, req.Comment)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	sql = `SELECT a.user_id FROM task_assignees a WHERE a.task_id = $1`
	rows, err := database.DB.Query(sql, taskID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var aID int
		err = rows.Scan(&aID)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		CreateNotification(aID, fmt.Sprintf("A new comment has been added to task #%d that you are assigned to.", taskID))
	}
	sql = `SELECT t.owner_id FROM tasks t WHERE t.id = $1`
	var oID int
	err = database.DB.QueryRow(sql, taskID).Scan(&oID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	CreateNotification(oID, fmt.Sprintf("A new comment has been added to task #%d that you are the owner to.", taskID))
	c.JSON(http.StatusOK, utils.OkayResponse(req))
}

func AddAssignee(c *gin.Context) {
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
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	type AssigneeAddRequest struct {
		UserID int `json:"user_id" binding:"required"`
	}
	var req AssigneeAddRequest
	err = c.BindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var assigneeID int
	sql := `SELECT u.id FROM users u WHERE u.id = $1`
	database.DB.QueryRow(sql, req.UserID).Scan(&assigneeID)
	if assigneeID != req.UserID {
		c.JSON(http.StatusOK, utils.ErrorResponse("The given user does not exist."))
		return
	}
	sql = `INSERT INTO task_assignees (task_id,user_id) VALUES ($1,$2);`
	_, err = database.DB.Exec(sql, taskID, assigneeID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	CreateNotification(assigneeID, fmt.Sprintf("You have been added as an asignee for task #%d", taskID))
	c.JSON(http.StatusOK, utils.OkayResponse(req))
}

func RemoveAssignee(c *gin.Context) {
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
	pathUserID := c.Param("userid")
	assigneeID, err := strconv.Atoi(pathUserID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var validateUserIsOwner int
	var validateUserIsCollaborator int
	database.DB.QueryRow("SELECT id FROM projects WHERE id = $1 AND owner_id = $2;", projectID, userID).Scan(&validateUserIsOwner)
	database.DB.QueryRow("SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2;", projectID, userID).Scan(&validateUserIsCollaborator)
	if validateUserIsOwner == 0 && validateUserIsCollaborator == 0 {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this project."))
		return
	}
	var verifyAssigneeID int
	sql := `SELECT u.id FROM users u WHERE u.id = $1`
	database.DB.QueryRow(sql, assigneeID).Scan(&verifyAssigneeID)
	if assigneeID != verifyAssigneeID {
		c.JSON(http.StatusOK, utils.ErrorResponse("The given user does not exist."))
		return
	}
	sql = `DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2;`
	_, err = database.DB.Exec(sql, taskID, assigneeID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	CreateNotification(assigneeID, fmt.Sprintf("You have been removed as an asignee from task #%d.", taskID))
	c.JSON(http.StatusOK, utils.OkayResponse(nil))
}

func ListPriority(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	type Priority struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}
	type ListPriorityResponse struct {
		Priorities []Priority `json:"priorities"`
	}
	var priorities []Priority
	rows, err := database.DB.Query("SELECT p.id, p.name FROM priority p ORDER BY id")
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var p Priority
		err = rows.Scan(&p.ID, &p.Name)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		priorities = append(priorities, p)
	}
	c.JSON(http.StatusOK, utils.OkayResponse(ListPriorityResponse{
		Priorities: priorities,
	}))
}

func ListStatus(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	type Status struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}
	type ListStatusResponse struct {
		Statuses []Status `json:"statuses"`
	}
	var statuses []Status
	rows, err := database.DB.Query("SELECT s.id, s.name FROM status s ORDER BY id")
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var s Status
		err = rows.Scan(&s.ID, &s.Name)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		statuses = append(statuses, s)
	}
	c.JSON(http.StatusOK, utils.OkayResponse(ListStatusResponse{
		Statuses: statuses,
	}))
}
