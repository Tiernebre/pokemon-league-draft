import { useAlerts, useDidMount } from "@tiernebre/kecleon";
import { useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  ChallengeApiHookReturnValue,
  useGetChallenge,
  ChallengeResultsApiHookReturnValue,
  useChallengeResultsApi,
  useDraftApi,
} from "../../../hooks";

type ChallengeViewParams = {
  id: string;
};

type ChallengeHookReturnValue = ChallengeResultsApiHookReturnValue &
  ChallengeApiHookReturnValue & {
    generateDraftPool: () => Promise<void>;
  };

export const useChallenge = (): ChallengeHookReturnValue => {
  const { id } = useParams<ChallengeViewParams>();
  const history = useHistory();
  const { showAlert } = useAlerts();
  const challengeId = Number(id);
  const challengeApi = useGetChallenge({
    challengeId,
  });
  const challengeResultsApi = useChallengeResultsApi({
    challengeId,
  });
  const { generatePoolForDraft } = useDraftApi();

  useDidMount(() => {
    void Promise.all([
      challengeApi.fetchChallenge(),
      challengeResultsApi.fetchChallengeResults(),
    ]);
  });

  const deleteChallenge = useCallback(async () => {
    await challengeApi.deleteChallenge();
    showAlert({ color: "success", message: "Successfully Deleted Challenge" });
    history.push("/home");
  }, [challengeApi, showAlert, history]);

  const generateDraftPool = useCallback(async () => {
    if (challengeApi.draft) {
      await generatePoolForDraft(challengeApi.draft.id);
      await challengeApi.fetchChallenge();
      showAlert({ color: "success", message: "Generated Pool for Draft" });
    }
  }, [challengeApi, generatePoolForDraft, showAlert]);

  return {
    ...challengeResultsApi,
    ...challengeApi,
    deleteChallenge,
    generateDraftPool,
  };
};
