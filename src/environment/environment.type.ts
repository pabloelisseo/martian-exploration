
export interface Environment {
  autoInstance: boolean;
  api: {
    port: number;
    xApiKey: string;
  };
  db: IDbParameters | string;
}

export interface IDbParameters {
  db: string;
  host: string;
  password: string;
  protocol: string;
  username: string;
  options: IDbParametersOptions;
}

export interface IDbParametersOptions {
  authSource: string;
  retryWrites: boolean;
  w: string;
}
