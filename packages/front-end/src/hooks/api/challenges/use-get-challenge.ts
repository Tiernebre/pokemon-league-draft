import { useState, useMemo, useCallback } from "react";
import { Challenge, Draft, HttpChallengeService } from "../../../api";
import { useHttp } from "../../http";
import { useSessionPayload } from "../../session";
import { useDraftApi } from "../draft";

export type ChallengeApiHookParameters = {
  challengeId: number;
};

export type ChallengeApiHookReturnValue = {
  challenge: Challenge | undefined;
  draft?: Draft;
  userOwnsChallenge: boolean;
  fetchChallenge: () => Promise<void>;
  deleteChallenge: () => Promise<void>;
};

/**
 * useGetChallenge is a hook that fetches a challenge
 * and its result into state and provides an API of operations
 * on that specific challenge and its results.
 *
 * This hook is used for a singular Challenge ID and requires
 * a given challenge ID. If you're looking to retrieve multiple
 * challenges use {@link use-get-challenges-api.ts} instead.
 */
export const useGetChallenge = ({
  challengeId,
}: ChallengeApiHookParameters): ChallengeApiHookReturnValue => {
  const sessionPayload = useSessionPayload();
  const { httpClient } = useHttp();
  const [challenge, setChallenge] = useState<Challenge>();
  const [draft, setDraft] = useState<Draft>();
  const { getDraftForChallenge } = useDraftApi();

  const challengeService = useMemo(
    () => new HttpChallengeService(httpClient),
    [httpClient]
  );

  const userOwnsChallenge = challenge?.creatorId === sessionPayload.userId;

  const fetchChallenge = useCallback(async () => {
    setChallenge(await challengeService.getOneById(challengeId));
    setDraft(await getDraftForChallenge(challengeId));
  }, [challengeService, challengeId, getDraftForChallenge]);

  const deleteChallenge = useCallback(async () => {
    await challengeService.deleteOneById(challengeId);
    setChallenge(undefined);
  }, [challengeService, challengeId]);

  return {
    challenge,
    draft,
    fetchChallenge,
    userOwnsChallenge,
    deleteChallenge,
  };
};
