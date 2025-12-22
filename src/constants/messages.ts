export const USER_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_FORMAT_IS_INVALID: 'Email format is invalid',
  PASSWORD_LENGTH_MUST_BE_AT_LEAST_6_CHARACTERS: 'Password must be at least 6 characters',
  PASSWORD_CONFIRMATION_DOES_NOT_MATCH_PASSWORD: 'Password confirmation does not match password',
  PASSWORD_MUST_BE_STRONG: 'Password must be strong',
  VALIDATION_ERROR: 'Validation error',
  EMAIL_IS_REQUIRED: 'Email is required',
  PASSWORD_IS_REQUIRED: 'Password is required',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_STRONG: 'Confirm password must be strong',
  CONFIRM_PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS: 'Confirm password must be at least 6 characters',
  EMAIL_NOT_FOUND: 'Email not found',
  PASSWORD_INCORRECT: 'Password incorrect',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_USED_OR_NOT_EXIST: 'Refresh token used or not exist',
  LOGOUT_SUCCESS: 'Logout success',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_USED_OR_NOT_EXIST: 'Email verify token used or not exist',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  USER_NOT_FOUND: 'User not found',
  EMAIL_VERIFIED: 'Email verified',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_VERIFY_TOKEN_IS_REQUIRED: 'Forgot verify token is required',
  FORGOT_VERIFY_TOKEN_IS_INVALID: 'Forgot verify token is invalid',
  FORGOT_VERIFY_PASSWORD_SUCCESS: 'Forgot verify password success',
  RESET_PASSSWORD_SUCCESS: 'Reset password success',
  GET_ACCOUNT_SUCCESS: 'Get account success',
  USER_NOT_VERIFIED: 'User not verified',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_2_TO_50_CHARACTERS: 'Name  length must be from 2 to 50 characters',
  AVATAR_MUST_BE_A_STRING: 'Avatar must be a string',
  AVATAR_LENGTH_MUST_BE_FROM_2_TO_50_CHARACTERS: 'Avatar length must be from 2 to 50 characters',
  UPDATE_ACCOUNT_SUCCESS: 'Update account success',
  GET_PROFILE_SUCCESS: 'Get profile success',
  ADD_FAVORITES_SUCCESS: 'add favorites success',
  USERNAME_INVALID: 'Username is invalid',
  USERNAME_EXISTED: 'Username is existed',
  OLD_PASSWORD_NOT_MATCH: 'Old password does not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  GMAIL_NOT_VERIFIED: 'GMAIL_NOT_VERIFIED',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS'
} as const

export const MOVIE_MESSAGES = {
  GET_GENRES_SUCCESS: 'Get genres success',
  FILTER_MOVIES_SUCCESS: 'Filter movies success',
  TITLE_IS_NOT_EXIST: 'title is not exist',
  GET_COUNTRIES_SUCCESS: 'Get countries success',
  GET_MOVIE_DETAIL_SUCCESS: 'Get movie detail success',
  MOVIE_NOT_FOUND: 'Movie not found'
} as const

export const SEASON_MESSAGES = {
  GET_SEASON_BY_MOVIE_ID_SUCCESS: 'Get season by movie ID success'
}
export const COMMENT_MESSAGES = {
  CONTENT_IS_REQUIRED: 'Content is required',
  CONTENT_MUST_BE_STRING: 'Content must be a string',
  CONTENT_ID_IS_REQUIRED: 'Content ID is required',
  CONTENT_ID_INVALID: 'Content ID is invalid',
  CONTENT_NOT_FOUND: 'Content (Movie/Series) not found',
  PARENT_ID_INVALID: 'Parent ID is invalid',
  PARENT_COMMENT_NOT_FOUND: 'Parent comment not found',
  COMMENT_NOT_FOUND: 'Comment not found',
  CONTENT_CONTAINS_FORBIDDEN_WORDS: 'Nội dung chứa từ ngữ không phù hợp hoặc vi phạm tiêu chuẩn cộng đồng'
}
