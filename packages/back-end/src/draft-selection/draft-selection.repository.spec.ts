import { Repository, getRepository, getCustomRepository } from "typeorm";
import { DraftSelectionRepository } from "./draft-selection.repository";
import { ChallengeParticipantEntity } from "../challenge-participant";
import { ChallengeEntity } from "../challenge/challenge.entity";
import {
  seedChallenge,
  seedChallengeParticipant,
} from "../challenge/challenge.seed";
import { DraftEntity } from "../draft/draft.entity";
import { seedDraft } from "../draft/draft.seed";
import { establishDbConnection } from "../test/create-db-connection";
import { UserEntity } from "../user/user.entity";
import { seedUsers } from "../user/user.seed";
import { DraftSelectionEntity } from "./draft-selection.entity";
import {
  clearAllDraftSelections,
  seedDraftSelection,
} from "./draft-selection.seed";

describe("DraftSelectionService (integration)", () => {
  let draftSelectionRepository: DraftSelectionRepository;

  let challengeParticipantRepository: Repository<ChallengeParticipantEntity>;
  let challengeRepository: Repository<ChallengeEntity>;
  let userRepository: Repository<UserEntity>;
  let draftRepository: Repository<DraftEntity>;

  let challenge: ChallengeEntity;
  let users: UserEntity[];
  const challengeParticipants: ChallengeParticipantEntity[] = [];
  let draft: DraftEntity;
  let createdSelections: DraftSelectionEntity[] = [];

  beforeAll(async () => {
    await establishDbConnection();
    challengeRepository = getRepository(ChallengeEntity);
    draftRepository = getRepository(DraftEntity);
    userRepository = getRepository(UserEntity);
    challengeParticipantRepository = getRepository(ChallengeParticipantEntity);

    challenge = await seedChallenge(challengeRepository);
    users = await seedUsers(userRepository);
    draft = await seedDraft(draftRepository, challenge);

    for (const user of users) {
      const challengeParticipant = await seedChallengeParticipant(
        challengeParticipantRepository,
        challenge,
        user
      );
      challengeParticipants.push(challengeParticipant);
    }
  });

  beforeEach(async () => {
    draftSelectionRepository = getCustomRepository(DraftSelectionRepository);
    createdSelections = [];

    for (const challengeParticipant of challengeParticipants) {
      const createdSelection = await seedDraftSelection(
        draftSelectionRepository,
        challengeParticipant
      );
      createdSelections.push(createdSelection);
    }
  });

  afterEach(async () => {
    await clearAllDraftSelections();
  });

  describe("getAllForDraftId", () => {
    it("returns properly mapped draft selections from a given draft", async () => {
      expect(createdSelections.length).toBeGreaterThan(0);
      const gottenSelections = await draftSelectionRepository.getAllForDraftId(
        draft.id
      );
      expect(gottenSelections).toHaveLength(createdSelections.length);
      for (let i = 0; i < createdSelections.length; i++) {
        const createdSelection = createdSelections[i];
        const correspondingSelection = gottenSelections[i];
        expect(correspondingSelection.id).toEqual(createdSelection.id);
        expect(createdSelection.roundNumber).toBeTruthy();
        expect(createdSelection.pickNumber).toBeTruthy();
        expect(correspondingSelection.round).toEqual(
          createdSelection.roundNumber
        );
        expect(correspondingSelection.pick).toEqual(
          createdSelection.pickNumber
        );
        const participant = await createdSelection.challengeParticipant;
        const user = await participant.user;
        expect(user.id).toBeTruthy();
        expect(user.nickname).toBeTruthy();
        expect(correspondingSelection.userNickname).toEqual(user.nickname);
        expect(correspondingSelection.userId).toEqual(user.id);
      }
    });

    it("returns an empty array if the draft does not have any selections", async () => {
      const newDraft = await seedDraft(draftRepository);
      const gottenSelections = await draftSelectionRepository.getAllForDraftId(
        newDraft.id
      );
      expect(gottenSelections).toBeTruthy();
      expect(gottenSelections).toHaveLength(0);
    });
  });

  describe("getOneByIdAndUserId", () => {
    it("returns an entity if one exists with a given id and user ID", async () => {
      const [draftSelection] = createdSelections;
      const participant = await draftSelection.challengeParticipant;
      const user = await participant.user;
      const gottenDraftSelection =
        await draftSelectionRepository.getOneWithIdAndUserId(
          draftSelection.id,
          user.id
        );
      expect(gottenDraftSelection).toBeTruthy();
      expect(gottenDraftSelection?.id).toEqual(draftSelection.id);
      expect(gottenDraftSelection?.pickNumber).toEqual(
        draftSelection.pickNumber
      );
      expect(gottenDraftSelection?.roundNumber).toEqual(
        draftSelection.roundNumber
      );
    });

    it("returns undefined if given a bogus id", async () => {
      const [user] = users;
      const gottenDraftSelection =
        await draftSelectionRepository.getOneWithIdAndUserId(100000, user.id);
      expect(gottenDraftSelection).toBeUndefined();
    });

    it("returns undefined if given a bogus user id", async () => {
      const [draftSelection] = createdSelections;
      const gottenDraftSelection =
        await draftSelectionRepository.getOneWithIdAndUserId(
          draftSelection.id,
          1000000
        );
      expect(gottenDraftSelection).toBeUndefined();
    });
  });
});
