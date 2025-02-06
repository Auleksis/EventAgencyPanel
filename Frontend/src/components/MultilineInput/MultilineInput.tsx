import { forwardRef } from "react";
import s from "./MultilineInput.module.css";

export interface MultilineInputInputProps
  extends React.ComponentProps<"textarea"> {
  label: string;
  id: string;
  centerTitle?: boolean;
}

const MultilineInput = forwardRef<
  HTMLTextAreaElement,
  MultilineInputInputProps
>(({ id, label, centerTitle, children, ...props }, forwardRef) => (
  <div
    className={s.input_container}
    style={{ alignItems: centerTitle ? "center" : "flex-start" }}
  >
    {label.length > 0 && (
      <label className={s.subtext} htmlFor={id}>
        {label}
      </label>
    )}
    <textarea ref={forwardRef} id={id} className={s.input} {...props} />
    {children}
  </div>
));

export default MultilineInput;
