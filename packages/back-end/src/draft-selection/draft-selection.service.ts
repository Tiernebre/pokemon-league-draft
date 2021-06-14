import { DraftSelection, DraftSelectionRow } from "./draft-selection";
import { z } from "zod";
import { Pokemon, PokemonService } from "../pokemon";
import { DraftSelectionRepository } from "./draft-selection.repository";
import {
  FinalizeDraftSelectionRequest,
  finalizeDraftSelectionRequestSchema,
} from "./finalize-draft-selection-request";
import { BadRequestError, ConflictError, NotFoundError } from "../error";
import { DraftSelectionEntity } from ".";
import { DraftPokemonService } from "../draft-pokemon/draft-pokemon.service";
import { DraftPokemonEntity } from "../draft/draft-pokemon.entity";
import { DraftPokemon } from "../draft-pokemon";
import { DraftService } from "../draft/draft.service";
import { ChallengeParticipantService } from "../challenge-participant";

export class DraftSelectionService {
  constructor(
    private readonly draftSelectionRepository: DraftSelectionRepository,
    private readonly pokemonService: PokemonService,
    private readonly draftPokemonService: DraftPokemonService,
    private readonly draftService: DraftService,
    private readonly challengeParticipantService: ChallengeParticipantService
  ) {}

  public async generateForDraftId(draftId: number): Promise<DraftSelection[]> {
    const draft = await this.draftService.getOneAsEntityWithPool(draftId);
    const challengers = await this.challengeParticipantService.getAllForChallengeId(draft.challengeId)
  }

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
      throw new NotFoundError(`Could not find draft selection to finalize.`);
    }
    const pokemonToSelect = await this.draftPokemonService.getOneById(
      request.draftPokemonId
    );
    await this.validatePickCanBeFinalized(
      request,
      draftSelection,
      pokemonToSelect
    );

    draftSelection.pokemonId = request.draftPokemonId;
    await this.draftSelectionRepository.save(draftSelection);
    return this.mapEntityToDto(draftSelection, pokemonToSelect);
  }

  private async validatePickCanBeFinalized(
    request: FinalizeDraftSelectionRequest,
    draftSelection: DraftSelectionEntity,
    pokemonToSelect: DraftPokemon
  ): Promise<void> {
    if (pokemonToSelect.draftId !== draftSelection.draftId) {
      throw new ConflictError(
        "The provided pokemon must be available in the draft associated with this draft selection."
      );
    }

    const numberOfPriorPendingSelections =
      await this.draftSelectionRepository.getNumberOfPendingSelectionsBeforeSelection(
        draftSelection
      );
    if (numberOfPriorPendingSelections > 0) {
      throw new BadRequestError(
        "The draft selection is not ready to be finalized yet. There are still pending picks before this one."
      );
    }

    if (
      await this.draftSelectionRepository.oneExistsWithPokemonId(
        request.draftPokemonId
      )
    ) {
      throw new ConflictError(
        "The provided pokemon has already been drafted, only available Pokemon can be drafted."
      );
    }
  }

  private async mapRowToDto(row: DraftSelectionRow): Promise<DraftSelection> {
    return {
      ...row,
      selection: await this.getPokemonForDraftSelection(row),
    };
  }

  private async mapEntityToDto(
    entity: DraftSelectionEntity,
    pokemon: DraftPokemon
  ): Promise<DraftSelection> {
    const participant = await entity.challengeParticipant;
    const user = await participant.user;
    return {
      id: entity.id,
      round: entity.roundNumber,
      pick: entity.pickNumber,
      selection: await this.pokemonService.getOneById(pokemon.pokemonId),
      userNickname: user.nickname,
      userId: user.id,
    };
  }

  private async getPokemonForDraftSelection(
    draftSelection: DraftSelectionRow | DraftPokemonEntity
  ): Promise<Pokemon | null> {
    if (draftSelection.pokemonId) {
      return this.pokemonService.getOneById(draftSelection.pokemonId);
    } else {
      return null;
    }
  }
}
