// Types
import { AppError } from '~/types/error.types';

export function getNonValidCredentialsErrorMessage(): AppError {
    return {
        httpStatus: 401,
        description: 'Email or password does not match',
        error: new Error('Invalid credentials'),
    };
}

export const AuthProvider = {
    getNonValidCredentialsErrorMessage,
};
