export interface RegisterUserDto {
  email: string
  password: string
  name?: string
}

export interface LoginUserDto {
  email: string
  password: string
}

export interface UserResponseDto {
  id: string
  email: string
  name: string | null
}

export interface OrganizationResponseDto {
  id: string
  name: string
  userId: string
}

export interface AuthResponseDto {
  message: string
  user: UserResponseDto
  organization?: OrganizationResponseDto | null
}
