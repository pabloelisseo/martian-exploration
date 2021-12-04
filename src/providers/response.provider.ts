import { isNil, get } from 'lodash';
import { AppError } from '~/types/error.types';
import Debug from 'debug';

const debug = Debug('martian-exploration:response');
export interface ApiResponse {
  status: number;
  body: Record<string, any>;
}

export function convertToAppError(error: Error | AppError): AppError {

  debug(`Error ocurred: ${error}`);
  const defaultHttpStatus = 500;
  const defaultDescription = 'Internal server error';
  const defaultError: Error = new Error('Unexpected error');

  if (isNil(error)) {
    return {
      httpStatus: 500,
      description: 'Internal server error',
      error: new Error('Unexpected error happened'),
    };
  }

  return {
    httpStatus: get(error, 'httpStatus', defaultHttpStatus),
    description: get(error, 'description', defaultDescription),
    error: get(error, 'error', defaultError),
  };
}

export function getApiResponse(
  message: Record<string, any> | AppError,
): ApiResponse {
  const isError = !isNil(get(message, 'error', null));
  
  const status =  isError ? message.httpStatus : 200;
  const body = isError ? { error: message.description } : message;

  debug(`Getting API Response with status ${status} and message ${message}`);
  return {
    status,
    body,
  };
}