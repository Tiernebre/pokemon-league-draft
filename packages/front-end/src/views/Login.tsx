import { SessionService } from "../api/session";
import { SessionRequest } from "../api/session/SessionRequest";
import { LoginForm } from "../components/login/LoginForm";
import "./Login.css";

type LoginProps = {
  sessionService: SessionService;
};

export const Login = ({ sessionService }: LoginProps) => {
  const submitLogin = (sessionRequest: SessionRequest) => {
    try {
      sessionService.createOne(sessionRequest);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="Login columns is-vcentered is-mobile">
      <div className="column is-offset-one-third-desktop is-one-third-desktop">
        <h1 className="Login__heading title is-spaced">Welcome to Ninjask!</h1>
        <h2 className="subtitle">
          Please fill out your login information below to start drafting and
          tracking your Pokémon challenges!
        </h2>
        <LoginForm onSubmit={submitLogin} />
      </div>
    </div>
  );
};
