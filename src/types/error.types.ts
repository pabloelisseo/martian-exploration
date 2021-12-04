export interface AppError {
    httpStatus?: number;
    description?: string;
    error: Error;
    errorCode?: string;
  }