import { Container, HeadingGroup, Level, useAlerts } from "@tiernebre/kecleon";
import { ChallengeForm } from "./components/forms/ChallengeForm";
import { useCreateChallenge } from "../../hooks";
import { CreateChallengeRequest } from "../../api";
import { useHistory } from "react-router";

export const CreateChallengeView = (): JSX.Element => {
  const { createChallenge } = useCreateChallenge();
  const { showAlert } = useAlerts();
  const history = useHistory();

  const createChallengeAndRoute = async (request: CreateChallengeRequest) => {
    const createdChallenge = await createChallenge(request);
    showAlert({
      message: `${createdChallenge.name} was created!`,
      color: "success",
    });
    history.push(`/challenges/${createdChallenge.id}`);
  };

  return (
    <Container as="section">
      <Level
        left={
          <div>
            <HeadingGroup title="Create Challenge" />
          </div>
        }
      />
      <ChallengeForm onSubmit={createChallengeAndRoute} />
    </Container>
  );
};
