import { Button, Column, Columns, SemanticFormField } from "@tiernebre/kecleon";
import { DevTool } from "@hookform/devtools";
import { useForm } from "react-hook-form";

type ChallengeResultFormData = {
  hour: number;
  minutes: number;
};

type ChallengeResultFormProps = {
  onSubmit: (data: ChallengeResultFormData) => void;
};

export const ChallengeResultForm = ({
  onSubmit,
}: ChallengeResultFormProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChallengeResultFormData>();
  console.log(errors);

  const submit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={submit}>
      <Columns mobile>
        <Column>
          <SemanticFormField
            id="hour"
            label="Hour"
            input={{ type: "text" }}
            ref={register("hour", {
              valueAsNumber: true,
              required: {
                value: true,
                message: "Hour is required.",
              },
              min: {
                value: 0,
                message: "Hour must be between 0-99.",
              },
              max: {
                value: 99,
                message: "Hour must be between 0-99.",
              },
            })}
            error={errors.hour}
          />
        </Column>
        <Column>
          <SemanticFormField
            id="minutes"
            label="Minutes"
            input={{ type: "text" }}
            register={register("minutes", {
              valueAsNumber: true,
              required: {
                value: true,
                message: "Minutes are required.",
              },
              min: {
                value: 0,
                message: "Minutes must be between 0-59.",
              },
              max: {
                value: 59,
                message: "Minutes must be between 0-59.",
              },
            })}
            error={errors.minutes}
          />
        </Column>
      </Columns>
      <Button color="success">Submit Result</Button>
      <DevTool control={control} placement="bottom-right" />{" "}
      {/* set up the dev tool */}
    </form>
  );
};
