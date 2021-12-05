export interface DecodedTokenPayload {
    _id: string;
    name: string;
  }

export interface TokenAuthArgs {
    expireHours: string;
    payload: Record<string, any>;
}
