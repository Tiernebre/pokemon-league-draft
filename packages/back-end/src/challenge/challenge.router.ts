import Router from "@koa/router";
import { ChallengeService } from "./challenge.service";

export class ChallengeRouter extends Router {
  constructor(private readonly challengeService: ChallengeService) {
    super();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.get("/challenges", async (ctx) => {
      ctx.body = await this.challengeService.getAllForCurrentUser(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ctx.state.user
      );
    });
  }
}