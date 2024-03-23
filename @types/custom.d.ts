export {};

declare global {
  interface Error {
    errors: string;
    value: string;
    code: number;
    statusCode: number;
  }
}
