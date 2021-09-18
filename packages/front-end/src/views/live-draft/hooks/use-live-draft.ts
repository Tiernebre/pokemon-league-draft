import useWebSocket from "react-use-websocket";
import { LiveDraftSelectionMessage } from "../types/live-draft-selection-message";

export const useLiveDraft = (draftId: number): void => {
  const { lastJsonMessage, readyState, sendMessage } = useWebSocket(
    `${process.env.REACT_APP_BACK_END_API_WS_URL as string}/drafts/${Number(
      draftId
    )}/live-selections`
  );

  const finalizeSelection = (request: LiveDraftSelectionMessage): void => {
    sendMessage(JSON.stringify(request));
  };
};
