package utils

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

func ErrorResponse(message string) Response {
	return Response{
		Success: false,
		Message: message,
		Data:    nil,
	}
}

func OkayResponse(data any) Response {
	return Response{
		Success: true,
		Message: "Completed successfuly.",
		Data:    data,
	}
}
