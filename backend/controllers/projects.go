package controllers

import (
	"net/http"
	"strconv"
	"taskmanager/database"
	"taskmanager/utils"
	"time"

	"github.com/gin-gonic/gin"
)

func ListProjects(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	type Project struct {
		ID            int          `json:"id"`
		Name          string       `json:"username"`
		Owner         utils.User   `json:"owner"`
		Collaborators []utils.User `json:"collaborators"`
		CreatedAt     time.Time    `json:"created_at"`
	}
	type ProjectsResponse struct {
		Projects []Project `json:"projects"`
	}
	projects := []Project{}
	sql := `SELECT p.id, p.name, p.created_at, u.id, u.username, u.email FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.active = true;`
	rows, err := database.DB.Query(sql)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var p Project
		p.Collaborators = []utils.User{}
		err = rows.Scan(&p.ID, &p.Name, &p.CreatedAt, &p.Owner.ID, &p.Owner.Username, &p.Owner.Email)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		sql2 := `SELECT u.id, u.username, u.email FROM project_collaborators pc JOIN users u ON pc.user_id = u.id WHERE pc.project_id = $1`
		rows2, err := database.DB.Query(sql2, p.ID)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		for rows2.Next() {
			var u utils.User
			err = rows2.Scan(&u.ID, &u.Username, &u.Email)
			if err != nil {
				c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
				return
			}
			p.Collaborators = append(p.Collaborators, u)
		}
		projects = append(projects, p)
	}
	c.JSON(http.StatusOK, utils.OkayResponse(
		ProjectsResponse{
			Projects: projects,
		},
	))
}

func GetProject(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	type Project struct {
		ID            int          `json:"id"`
		Name          string       `json:"username"`
		Owner         utils.User   `json:"owner"`
		Collaborators []utils.User `json:"collaborators"`
		CreatedAt     time.Time    `json:"created_at"`
	}
	pathProjectID := c.Param("projectid")
	projectID, err := strconv.Atoi(pathProjectID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var p Project
	sql := `SELECT p.id, p.name, p.created_at, u.id, u.username, u.email FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = $1 AND active = true;`
	database.DB.QueryRow(sql, projectID).Scan(&p.ID, &p.Name, &p.CreatedAt, &p.Owner.ID, &p.Owner.Username, &p.Owner.Email)
	if p.ID != projectID {
		c.JSON(http.StatusOK, utils.ErrorResponse("No project found with given id."))
		return
	}
	p.Collaborators = []utils.User{}
	sql = `SELECT u.id, u.username, u.email FROM project_collaborators pc JOIN users u ON pc.user_id = u.id WHERE pc.project_id = $1`
	rows, err := database.DB.Query(sql, projectID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var u utils.User
		err = rows.Scan(&u.ID, &u.Username, &u.Email)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		p.Collaborators = append(p.Collaborators, u)
	}
	c.JSON(http.StatusOK, utils.OkayResponse(p))
}

func CreateProject(c *gin.Context) {
	ownerID, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	type ProjectCreateRequest struct {
		Name string `json:"name" binding:"required"`
	}
	var req ProjectCreateRequest
	err := c.BindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	sql := `INSERT INTO projects (name,owner_id) VALUES ($1,$2)`
	_, err = database.DB.Exec(sql, req.Name, ownerID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(req))
}

func DeleteProject(c *gin.Context) {
	ownerID, exists := c.Get("user")
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
	var projectOwnerID int
	sql := `SELECT p.owner_id FROM projects p WHERE p.id = $1`
	database.DB.QueryRow(sql, projectID).Scan(&projectOwnerID)
	if projectOwnerID != ownerID.(int) {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not the owner of this project."))
		return
	}
	sql = `UPDATE projects SET active = false WHERE id = $1`
	_, err = database.DB.Exec(sql, projectID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(nil))
}

func AddCollaborator(c *gin.Context) {
	ownerID, exists := c.Get("user")
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
	type CollaboratorAddRequest struct {
		UserID int `json:"user_id" binding:"required"`
	}
	var req CollaboratorAddRequest
	err = c.BindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var userID int
	sql := `SELECT u.id FROM users u WHERE u.id = $1`
	database.DB.QueryRow(sql, req.UserID).Scan(&userID)
	if userID != req.UserID {
		c.JSON(http.StatusOK, utils.ErrorResponse("The given user does not exist."))
		return
	}
	var projectOwnerID int
	sql = `SELECT p.owner_id FROM projects p WHERE p.id = $1`
	database.DB.QueryRow(sql, projectID).Scan(&projectOwnerID)
	if projectOwnerID != ownerID.(int) {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not the owner of this project."))
		return
	}
	sql = `INSERT INTO project_collaborators (project_id,user_id) VALUES ($1,$2)`
	_, err = database.DB.Exec(sql, projectID, userID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(req))
}

func RemoveCollaborator(c *gin.Context) {
	ownerID, exists := c.Get("user")
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
	pathUserID := c.Param("userid")
	userID, err := strconv.Atoi(pathUserID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var existsUserID int
	sql := `SELECT u.id FROM users u WHERE u.id = $1`
	database.DB.QueryRow(sql, userID).Scan(&existsUserID)
	if userID != existsUserID {
		c.JSON(http.StatusOK, utils.ErrorResponse("The given user does not exist."))
		return
	}
	var projectOwnerID int
	sql = `SELECT p.owner_id FROM projects p WHERE p.id = $1`
	database.DB.QueryRow(sql, projectID).Scan(&projectOwnerID)
	if projectOwnerID != ownerID.(int) {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not the owner of this project."))
		return
	}
	sql = `DELETE FROM project_collaborators WHERE project_id = $1 AND user_id = $2`
	_, err = database.DB.Exec(sql, projectID, userID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(nil))
}
