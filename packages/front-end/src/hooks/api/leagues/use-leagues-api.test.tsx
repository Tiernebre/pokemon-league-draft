import { renderHook } from "@testing-library/react-hooks";
import { PropsWithChildren } from "react";
import { MockSessionContextProvider } from "../../../../test";
import { leagues } from "../../../../test/mocks/league";
import { useLeaguesApi } from "./use-leagues-api";

const wrapper = ({ children }: PropsWithChildren<unknown>): JSX.Element => (
  <MockSessionContextProvider>{children}</MockSessionContextProvider>
);

it("gets leagues", async () => {
  const { result } = renderHook(() => useLeaguesApi(), { wrapper });
  await expect(result.current.getLeagues()).resolves.toEqual(
    Object.values(leagues)
  );
});