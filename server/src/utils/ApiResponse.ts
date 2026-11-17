export class ApiResponse<T = any> {
  public success: boolean;
  public status: number;
  public message: string;
  public data?: T;

  constructor(status: number, message: string, data?: T) {
    this.success = status < 400;
    this.status = status;
    this.message = message;
    this.data = data;
  }
}