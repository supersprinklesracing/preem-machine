export type FormActionResult<T = object> = {} & T;

export class FormActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormActionError';
  }
}
