from pydantic import BaseModel, EmailStr, field_validator

class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str

    @field_validator("name")
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty.")
        return v.strip()

    @field_validator("password")
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token:        str
    new_password: str

    @field_validator("new_password")
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v