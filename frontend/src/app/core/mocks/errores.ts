import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/api-error';

export function notFound(message: string): HttpErrorResponse {
  const body: ApiErrorBody = { error: { code: 'NOT_FOUND', message } };
  return new HttpErrorResponse({ status: 404, statusText: 'Not Found', error: body });
}
