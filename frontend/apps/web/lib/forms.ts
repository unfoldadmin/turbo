import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

/**
 * Helper function processing error messages from API server
 *
 * Example API response (4xx status code):
 *
 * {
 *   "first_name": [
 *     "first validation message",
 *     "second validation message"
 *   ]
 * }
 */
export function fieldApiError<TFieldValues extends FieldValues>(
  fieldName: string,
  fieldPath: Path<TFieldValues>,
  response: { [key: string]: string[] } | undefined,
  setError: UseFormSetError<TFieldValues>
) {
  if (
    response &&
    typeof response !== 'boolean' &&
    typeof response === 'object' &&
    fieldName in response
  ) {
    for (const error of response[fieldName]) {
      setError(fieldPath, {
        message: error
      })
    }
  }
}
