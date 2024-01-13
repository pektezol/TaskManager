package controllers

import (
	"net/http"
	"strconv"
	"taskmanager/database"
	"taskmanager/utils"

	"github.com/gin-gonic/gin"
)

func ListNotifications(c *gin.Context) {
	userID, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	type Notification struct {
		ID           int    `json:"id"`
		Notification string `json:"notification"`
		Read         bool   `json:"read"`
	}
	type NotificationsResponse struct {
		Notifications []Notification `json:"notifications"`
	}
	notificaitons := []Notification{}
	sql := `SELECT n.id, n.notification, n.read FROM notifications n WHERE n.user_id = $1`
	rows, err := database.DB.Query(sql, userID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	for rows.Next() {
		var n Notification
		err = rows.Scan(&n.ID, &n.Notification, &n.Read)
		if err != nil {
			c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
			return
		}
		notificaitons = append(notificaitons, n)
	}
	c.JSON(http.StatusOK, utils.OkayResponse(
		NotificationsResponse{
			Notifications: notificaitons,
		},
	))
}

func ReadNotification(c *gin.Context) {
	userID, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	pathNotificationID := c.Param("projectid")
	notificationID, err := strconv.Atoi(pathNotificationID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var verifyNotificationID int
	sql := `SELECT n.id FROM notifications n WHERE n.user_id = $1 AND n.id = $2`
	database.DB.QueryRow(sql, userID, notificationID).Scan(&verifyNotificationID)
	if verifyNotificationID != notificationID {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this notification."))
		return
	}
	sql = `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`
	_, err = database.DB.Exec(sql, notificationID, userID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(nil))
}

func DeleteNotification(c *gin.Context) {
	userID, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusOK, utils.ErrorResponse("User not logged in."))
		return
	}
	pathNotificationID := c.Param("projectid")
	notificationID, err := strconv.Atoi(pathNotificationID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var verifyNotificationID int
	sql := `SELECT n.id FROM notifications n WHERE n.user_id = $1 AND n.id = $2`
	database.DB.QueryRow(sql, userID, notificationID).Scan(&verifyNotificationID)
	if verifyNotificationID != notificationID {
		c.JSON(http.StatusOK, utils.ErrorResponse("You are not authorized to perform on this notification."))
		return
	}
	sql = `DELETE FROM notifications WHERE id = $1 AND user_id = $2`
	_, err = database.DB.Exec(sql, notificationID, userID)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(nil))
}

func CreateNotification(userID int, message string) error {
	_, err := database.DB.Exec("INSERT INTO notifications (user_id,notification) VALUES ($1,$2)", userID, message)
	return err
}
