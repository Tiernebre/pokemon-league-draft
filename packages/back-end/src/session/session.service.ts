import { SessionRequest } from "./session-request";
import { SessionTokenBag } from "./session-token-bag";

export interface SessionService {
  /**
   * Creates an authenticated session for a given request.
   *
   * @param request The request a user provides to get a session.
   * @returns A session token bag that includes tokens for authentication.
   */
  createOne(request: SessionRequest): Promise<SessionTokenBag>;

  /**
   * Verifies a given token and ensures that it is used for a legitamite session.
   *
   * @param token The access token to check.
   * @throws An error if the access token provided is invalid.
   */
  verifyOne(accessToken: string): void;

  /**
   * Refreshes an existing session by checking the validity of a given refresh token.
   *
   * @param refreshToken The refresh token to check.
   * @returns A session token bag that includes new tokens to continue an authentication session.
   */
  refreshOne(refreshToken: string): Promise<SessionTokenBag>;
}
