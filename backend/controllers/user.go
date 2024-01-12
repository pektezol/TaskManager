package controllers

import (
	"net/http"
	"net/mail"
	"os"
	"taskmanager/database"
	"taskmanager/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	type RegisterRequest struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	var req RegisterRequest
	err := c.BindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 8)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	_, err = mail.ParseAddress(req.Email)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse("Invalid email."))
		return
	}
	query := `INSERT INTO users (username,email,password) VALUES ($1,$2,$3)`
	_, err = database.DB.Exec(query, req.Username, req.Email, hashedPassword)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(req))
}

func Login(c *gin.Context) {
	type LoginRequest struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	var req LoginRequest
	err := c.BindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	var email string
	var password string
	sql := `SELECT email, password FROM users WHERE email = $1;`
	database.DB.QueryRow(sql, req.Email).Scan(&email, &password)
	if email != req.Email {
		c.JSON(http.StatusOK, utils.ErrorResponse("Invalid credentials."))
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse("Invalid credentials."))
		return
	}
	token, err := createTokenJWT(email)
	if err != nil {
		c.JSON(http.StatusOK, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.OkayResponse(token))
}

func createTokenJWT(email string) (string, error) {
	token := jwt.New(jwt.GetSigningMethod("HS256"))
	exp := time.Now().Add(time.Hour * 24 * 14)
	token.Claims = &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(exp),
		Subject:   email,
	}
	signed, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		return "", err
	}
	return signed, nil
}
