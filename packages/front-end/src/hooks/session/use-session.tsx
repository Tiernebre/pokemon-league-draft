import React, { PropsWithChildren, useState } from "react";
import { Session } from "../../api";

type Context = {
  session?: Session;
  setSession: (session: Session) => void;
};

const SessionContext = React.createContext<Context | undefined>(undefined);

export const SessionProvider = ({
  children,
}: PropsWithChildren<unknown>): JSX.Element => {
  const [session, setSession] = useState<Session>();

  return (
    <SessionContext.Provider
      value={{ session, setSession }}
    ></SessionContext.Provider>
  );
};

export const useSession = (): Context => {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
