export interface ChallengeParticipantUpdateRequest {
  readonly id: number;
  readonly userId: number;
  readonly completionTimeHour: number;
  readonly completionTimeMinutes: number;
}