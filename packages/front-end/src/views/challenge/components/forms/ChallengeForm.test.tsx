import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { ChallengeForm } from "./ChallengeForm";
import user from "@testing-library/user-event";
import { MockSessionContextProvider } from "../../../../../test";
import { versions } from "../../../../../test/mocks/versions";

const getSubmitButton = () =>
  screen.getByRole("button", { name: "Create Challenge" });
const getNameInput = () => screen.getByLabelText("Name");
const getDescriptionInput = () => screen.getByLabelText("Description");
const getVersionsSelect = () => screen.getByLabelText("Pokémon Version");

const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(screen.getByLabelText("Loading..."));

it("displays error feedback if no name is provided", async () => {
  const onSubmit = jest.fn();
  render(
    <MockSessionContextProvider>
      <ChallengeForm onSubmit={onSubmit} />
    </MockSessionContextProvider>
  );
  await waitForLoadingToFinish();
  user.click(getSubmitButton());
  const errorMessage = await screen.findByText(
    "The challenge name is required"
  );
  expect(errorMessage).toBeInTheDocument();
});

it("displays error feedback if the name is too long", async () => {
  const onSubmit = jest.fn();
  render(
    <MockSessionContextProvider>
      <ChallengeForm onSubmit={onSubmit} />
    </MockSessionContextProvider>
  );
  await waitForLoadingToFinish();
  user.type(getNameInput(), "a".repeat(33));
  user.click(getSubmitButton());
  const errorMessage = await screen.findByText(
    "Should be at most 32 characters long"
  );
  expect(errorMessage).toBeInTheDocument();
});

it("displays error feedback if the description is too long", async () => {
  const onSubmit = jest.fn();
  render(
    <MockSessionContextProvider>
      <ChallengeForm onSubmit={onSubmit} />
    </MockSessionContextProvider>
  );
  await waitForLoadingToFinish();
  user.type(getDescriptionInput(), "a".repeat(129));
  user.click(getSubmitButton());
  const errorMessage = await screen.findByText(
    "Should be at most 128 characters long"
  );
  expect(errorMessage).toBeInTheDocument();
});

it("submits the form when filled out and valid", async () => {
  const onSubmit = jest.fn();
  render(
    <MockSessionContextProvider>
      <ChallengeForm onSubmit={onSubmit} />
    </MockSessionContextProvider>
  );
  await waitForLoadingToFinish();
  user.type(getNameInput(), "Valid Challenge");
  user.type(getDescriptionInput(), "Valid Description");
  const versionToChoose = versions[8];
  user.selectOptions(getVersionsSelect(), [versionToChoose.id.toString()]);
  user.click(getSubmitButton());
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
});
