import { isNil, get } from 'lodash';
import { Logger } from '~/logger/logger';
import { AppError } from '~/types/error.types';

export interface ApiResponse {
  status: number;
  body: Record<string, any>;
}

export function convertToAppError(err: Error | AppError): AppError {
  const defaultHttpStatus = 500;
  const defaultDescription = 'Internal server error';
  const defaultError: Error = new Error('Unexpected error');

  if (isNil(err)) {
    return {
      httpStatus: 500,
      description: 'Internal server error',
      error: new Error('Unexpected error happened'),
    };
  }

  return {
    httpStatus: get(err, 'httpStatus', defaultHttpStatus),
    description: get(err, 'description', defaultDescription),
    error: get(err, 'error', defaultError),
  };
}

export function getApiResponse(
  message: Record<string, any> | AppError,
): ApiResponse {
  const isError = !isNil(get(message, 'error', null));
  
  const status =  isError ? message.httpStatus : 200;
  const body = isError ? { error: message.description } : message;

  Logger.debug(`Getting API Response with status ${status} and message ${message}`);
  return {
    status,
    body,
  };
}