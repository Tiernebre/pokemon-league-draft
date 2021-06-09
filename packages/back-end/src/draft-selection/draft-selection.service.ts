import { DraftSelection, DraftSelectionRow } from "./draft-selection";
import { z } from "zod";
import { Pokemon, PokemonService } from "../pokemon";
import { DraftSelectionRepository } from "./draft-selection.repository";
import {
  FinalizeDraftSelectionRequest,
  finalizeDraftSelectionRequestSchema,
} from "./finalize-draft-selection-request";
import { BadRequestError, NotFoundError } from "../error";
import { DraftSelectionEntity } from ".";

export class DraftSelectionService {
  constructor(
    private readonly draftSelectionRepository: DraftSelectionRepository,
    private readonly pokemonService: PokemonService
  ) {}

  public async getAllForDraft(draftId: number): Promise<DraftSelection[]> {
    z.number().parse(draftId);

    const foundSelections =
      await this.draftSelectionRepository.getAllForDraftId(draftId);
    return Promise.all(
      foundSelections.map(async (foundSelection) =>
        this.mapRowToDto(foundSelection)
      )
    );
  }

  public async finalizeOneForUser(
    id: number,
    userId: number,
    request: FinalizeDraftSelectionRequest
  ): Promise<DraftSelection> {
    z.number().positive().parse(id);
    z.number().positive().parse(userId);
    finalizeDraftSelectionRequestSchema.parse(request);

    const draftSelection =
      await this.draftSelectionRepository.getPendingOneWithIdAndUserId(
        id,
        userId
      );
    if (!draftSelection) {
      throw new NotFoundError(
        `Could not find draft selection with id = ${id} for user = ${userId}`
      );
    }

    const priorPendingSelections =
      await this.draftSelectionRepository.getPendingSelectionsBeforeSelection(
        draftSelection
      );
    if (priorPendingSelections.length) {
      throw new BadRequestError(
        "The Draft Selection is not ready to be finalized yet. There are still pending picks before this one."
      );
    }

    draftSelection.pokemonId = request.draftPokemonId;
    await this.draftSelectionRepository.save(draftSelection);
    return this.mapEntityToDto(draftSelection);
  }

  private async mapRowToDto(row: DraftSelectionRow): Promise<DraftSelection> {
    return {
      ...row,
      selection: await this.getPokemonForDraftSelection(row),
    };
  }

  private async mapEntityToDto(
    entity: DraftSelectionEntity
  ): Promise<DraftSelection> {
    const participant = await entity.challengeParticipant;
    const user = await participant.user;
    return {
      id: entity.id,
      round: entity.roundNumber,
      pick: entity.pickNumber,
      selection: await this.getPokemonForDraftSelection(entity),
      userNickname: user.nickname,
      userId: user.id,
    };
  }

  private async getPokemonForDraftSelection(
    draftSelection: DraftSelectionRow | DraftSelectionEntity
  ): Promise<Pokemon | null> {
    if (draftSelection.pokemonId) {
      return this.pokemonService.getOneById(draftSelection.pokemonId);
    } else {
      return null;
    }
  }
}
