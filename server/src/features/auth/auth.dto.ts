/**
 * Data Transfer Objects (DTOs) for Authentication Feature.
 * 
 * Purpose:
 * Defines type contracts for parameters sent between client and server.
 * Ensures compile-time check matches across features.
 */

/**
 * RegisterUserDto.
 * Expected request payload format for POST `/api/auth/register`.
 */
export interface RegisterUserDto {
  email: string
  password: string
  name?: string
}

/**
 * LoginUserDto.
 * Expected request payload format for POST `/api/auth/login`.
 */
export interface LoginUserDto {
  email: string
  password: string
}

/**
 * UserResponseDto.
 * Structure of the user sub-object returned in response packages.
 */
export interface UserResponseDto {
  id: string
  email: string
  name: string | null
}

/**
 * OrganizationResponseDto.
 * Structure of the organization sub-object returned in response packages.
 */
export interface OrganizationResponseDto {
  id: string
  name: string
  userId: string
}

/**
 * AuthResponseDto.
 * Unified response payload format returned upon login or registration.
 */
export interface AuthResponseDto {
  message: string
  user: UserResponseDto
  organization?: OrganizationResponseDto | null
}

