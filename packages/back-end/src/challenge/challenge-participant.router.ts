/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Router from "@koa/router";
import { ParameterizedContext } from "koa";
import { ContextState } from "../types/state";
import { ChallengeParticipantUpdateRequest } from "./challenge-participant-update-request";
import { ChallengeParticipantService } from "./challenge-participant.service";

export class ChallengeRouter extends Router {
  private readonly URI = "/challenge-participants";

  constructor(
    private readonly challengeParticipantService: ChallengeParticipantService
  ) {
    super()
  }

  private setupRoutes(): void {
    this.patch(
      `${this.URI}/:id`,
      async (ctx: ParameterizedContext<ContextState>) => {
        const request = {
          ...<ChallengeParticipantUpdateRequest>ctx.request.body,
          id: Number(ctx.params.id),
          userId: ctx.state.session.userId
        }
        ctx.body = await this.challengeParticipantService.updateOne(request)
      }
    )
  }
}