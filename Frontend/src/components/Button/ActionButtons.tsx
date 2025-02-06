import { useEffect } from "react";
import s from "./Button.module.css";

export interface ButtonProps extends React.ComponentProps<"button"> {
  text: string;
}

export const PositiveButton: React.FunctionComponent<ButtonProps> = ({
  text,
  ...buttonProps
}) => {
  return (
    <button
      className={`${s.action_button} ${s.positive_button}`}
      {...buttonProps}
    >
      <p className={s.subtext}>{text}</p>
    </button>
  );
};

export const NegativeButton: React.FunctionComponent<ButtonProps> = ({
  text,
  ...buttonProps
}) => {
  return (
    <button
      className={`${s.action_button} ${s.negative_button}`}
      {...buttonProps}
    >
      <p className={s.subtext}>{text}</p>
    </button>
  );
};
