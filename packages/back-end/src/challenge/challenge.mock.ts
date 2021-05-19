import {
  generateRandomNumber,
  generateRandomString,
  getRandomInt,
} from "../random";
import { Challenge } from "./challenge";
import { ChallengeParticipant } from "./challenge-participant";
import { ChallengeParticipantEntity } from "./challenge-participant.entity";
import { ChallengeResult } from "./challenge-result";
import { ChallengeEntity } from "./challenge.entity";

export const generateMockChallenge = (): ChallengeEntity => {
  const challenge = new ChallengeEntity();
  challenge.id = generateRandomNumber();
  challenge.name = generateRandomString();
  challenge.description = generateRandomString();
  challenge.createdAt = new Date();
  challenge.updatedAt = new Date();
  challenge.versionId = generateRandomNumber();
  return challenge;
};

export const generateMockChallengeDto = (): Challenge => ({
  id: generateRandomNumber(),
  name: generateRandomString(),
  description: generateRandomString(),
  versionId: generateRandomNumber(),
  creatorId: generateRandomNumber(),
});

export const generateMockChallengeParticipantEntity =
  (): ChallengeParticipantEntity => {
    const challengeResultEntity = new ChallengeParticipantEntity();
    challengeResultEntity.id = generateRandomNumber();
    challengeResultEntity.userId = generateRandomNumber();
    challengeResultEntity.challengeId = generateRandomNumber();
    challengeResultEntity.completionTimeHour = generateRandomNumber();
    challengeResultEntity.completionTimeMinutes = generateRandomNumber();
    return challengeResultEntity;
  };

export const generateMockChallengeParticipant = (): ChallengeParticipant => ({
  id: generateRandomNumber(),
  userId: generateRandomNumber(),
  challengeId: generateRandomNumber(),
  completionTimeHour: generateRandomNumber(),
  completionTimeMinutes: generateRandomNumber(),
});

export const generateMockChallengeResult = (): ChallengeResult => ({
  participantId: generateRandomNumber(),
  completionTimeHour: getRandomInt(1, 25),
  completionTimeMinutes: getRandomInt(0, 59),
  nickname: generateRandomString(),
});

export const generateMockChallengeResults = (size = 20): ChallengeResult[] => {
  const results = [];
  for (let i = 0; i < size; i++) {
    results.push(generateMockChallengeResult());
  }
  return results;
};
