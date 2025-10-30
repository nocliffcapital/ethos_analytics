/**
 * Custom error classes for better error handling
 */

export class EthosAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "EthosAPIError";
  }
}

export class ProfileNotFoundError extends Error {
  constructor(public identifier: string) {
    super(`No Ethos profile found for: ${identifier}`);
    this.name = "ProfileNotFoundError";
  }
}

export class RateLimitError extends Error {
  constructor(
    public retryAfter?: number
  ) {
    super(`Rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ""}`);
    this.name = "RateLimitError";
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

