import { forwardRef } from "react";
import s from "./Input.module.css";

export interface InputProps extends React.ComponentProps<"input"> {
  label: string;
  id: string;
  centerTitle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, centerTitle, children, ...props }, forwardRef) => (
    <div
      className={s.input_container}
      style={{ alignItems: centerTitle ? "center" : "flex-start" }}
    >
      {label.length > 0 && (
        <label className={s.subtext} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        ref={forwardRef}
        id={id}
        type="text"
        className={s.input}
        {...props}
      />
      {children}
    </div>
  )
);

export default Input;
