import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { PositiveButton, NegativeButton } from "../../Button/ActionButtons";
import s from "./AcceptActionDialog.module.css";

export interface AcceptActionDialogProps {
  text: string;
}

export type AcceptActionDialogRef = {
  show: (onAcceptHandler: (id: string) => void, id: string) => void;
  close: () => void;
};

const AcceptActionDialog = forwardRef<
  AcceptActionDialogRef,
  AcceptActionDialogProps
>(({ text }, forwardRef) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const [onAccept, setOnAccept] = useState<(id: string) => void>();
  const [id, setId] = useState<string>("");

  useImperativeHandle(forwardRef, () => ({
    close: () => {
      modalRef.current?.close();
    },
    show: (onAcceptHandler: (id: string) => void, id: string) => {
      setOnAccept(() => {
        return onAcceptHandler;
      });

      setId(() => {
        return id;
      });

      modalRef.current?.showModal();
    },
  }));

  const close = () => {
    setOnAccept(() => {
      return undefined;
    });

    setId(() => {
      return "";
    });

    modalRef.current?.close();
  };

  return (
    <dialog ref={modalRef} className={s.modal_window_container}>
      <header className={s.modal_window_header}>
        <p className={s.default_text}>Вы уверены?</p>
      </header>
      <p className={s.subtext}>{text}</p>
      <form method="dialog" className={s.modal_window_buttons_container}>
        <NegativeButton
          text="Да"
          type="submit"
          onClick={() => {
            if (onAccept) {
              onAccept(id);
            }
          }}
        />
        <PositiveButton text="Нет" type="button" onClick={() => close()} />
      </form>
    </dialog>
  );
});

export default AcceptActionDialog;
