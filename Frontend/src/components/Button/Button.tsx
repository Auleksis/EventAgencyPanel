import s from "./Button.module.css";

export interface ButtonProps extends React.ComponentProps<"button"> {
  text: string;
  fontSize?: string;
  icon?: React.ReactNode;
}

const Button: React.FunctionComponent<ButtonProps> = ({
  text,
  fontSize,
  icon,
  ...buttonProps
}) => {
  return (
    <button className={s.button_container} {...buttonProps}>
      {icon}
      <p className={s.subtext} style={{ fontSize: fontSize }}>
        {text}
      </p>
    </button>
  );
};

export default Button;
