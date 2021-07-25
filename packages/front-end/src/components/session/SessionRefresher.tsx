import { Fragment, PropsWithChildren, useEffect, useState } from "react";
import { useDidMount } from "@tiernebre/kecleon";
import { useSession } from "../../hooks";

const ONE_MINUTE_IN_SECONDS = 60;

const secondsSinceEpoch = () => Math.round(Date.now() / 1000);

type SessionRefresherProps = PropsWithChildren<unknown>;

export const SessionRefresher = ({
  children,
}: SessionRefresherProps): JSX.Element | null => {
  const { session, refreshSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useDidMount(async () => {
    await refreshSession();
    setIsLoading(false);
  });

  useEffect(() => {
    let refreshTimeout: number;
    if (session?.accessToken && session?.accessTokenExpiration) {
      const refreshTimeoutInMs =
        (session.accessTokenExpiration -
          ONE_MINUTE_IN_SECONDS -
          secondsSinceEpoch()) *
        1000;
      refreshTimeout = window.setTimeout(() => {
        void refreshSession();
      }, refreshTimeoutInMs);
    }

    return () => {
      clearTimeout(refreshTimeout);
    };
  }, [session, refreshSession]);

  return isLoading ? null : <Fragment>{children}</Fragment>;
};
