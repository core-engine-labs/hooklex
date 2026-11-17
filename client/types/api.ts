// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResponse<T = any> =
  | {
      success: true;
      status: number;
      message?: string;
      data?: T;
    }
  | {
      success: false;
      status: number;
      code?: string;
      message: string;
    };
