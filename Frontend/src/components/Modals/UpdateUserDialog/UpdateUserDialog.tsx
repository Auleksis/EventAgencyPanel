import {
  FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { User } from "../../../services/apiModels";
import s from "./UpdateUserDialog.module.css";
import { NegativeButton, PositiveButton } from "../../Button/ActionButtons";
import Input from "../../Input/Input";
import MultilineInput from "../../MultilineInput/MultilineInput";
import {
  getUser,
  registerAdmin,
  registerClient,
  registerEventManager,
  registerParticipant,
  registerShowman,
  updateAdmin,
  updateEmployee,
  updateGuest,
} from "../../../services/api";

export interface UpdateUserDialogProps {
  onUpdated: (user: User) => void;
}

export type UpdateUserDialogRef = {
  show: (user: User) => void;
  close: () => void;
};

const UpdateUserDialog = forwardRef<UpdateUserDialogRef, UpdateUserDialogProps>(
  ({ onUpdated }, forwardRef) => {
    const [fullname, setFullname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [age, setAge] = useState<string>("");
    const [summary, setSummary] = useState<string>("");

    const phoneRegex =
      /^(?:\+7|8)\s*\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;

    const [error, setError] = useState<string>("");
    const [fullnameError, setFullnameError] = useState<string>("");
    const [phoneNumberError, setPhoneNumberError] = useState<string>("");
    const [ageError, setAgeError] = useState<string>("");

    const [role, setRole] = useState<string>("");

    const modalRef = useRef<HTMLDialogElement>(null);

    const resetDialog = () => {
      setFullname("");
      setAge("");
      setPhoneNumber("");
      setSummary("");
      setEmail("");

      setFullnameError("");
      setError("");
      setAgeError("");
    };

    useEffect(() => {
      return () => {
        resetDialog();
      };
    }, []);

    useImperativeHandle(forwardRef, () => ({
      close: () => {
        resetDialog();
        modalRef.current?.close();
      },
      show: (user: User) => {
        const fetchUser = async () => {
          modalRef.current?.showModal();
          setRole(user.role);
          setEmail(user.email);
          setFullname(user.full_name);
          setPhoneNumber(user.phone_number);

          const feched = await getUser(user.email);

          if (
            (user.role == "client" || user.role == "participant") &&
            feched.age
          ) {
            setAge(feched.age.toString());
          }

          if (
            (user.role == "event manager" || user.role == "showman") &&
            feched.summary
          ) {
            setSummary(feched.summary);
          }
        };

        fetchUser();
      },
    }));

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setFullnameError("");
      setError("");
      setAgeError("");

      if (fullname.trim().length == 0) {
        setFullnameError("Введите ФИО");
      }

      if (!phoneRegex.test(phoneNumber)) {
        setPhoneNumberError("Неверный номер телефона");
      }

      let ageNumber = 0;

      if (role == "participant" || role == "client") {
        if (age.trim().length == 0) {
          setAgeError("Укажите возразст");
        }

        ageNumber = Number.parseInt(age);

        if (Number.isNaN(ageNumber)) {
          setAgeError("Возраст должен быть числом");
        }

        if (ageNumber < 18) {
          setAgeError("Зарегистрироваться на платформе можно только с 18 лет");
        }
      }

      if (
        fullnameError.length == 0 &&
        phoneNumberError.length == 0 &&
        ageError.length == 0
      ) {
        try {
          const user = {
            full_name: fullname,
            email: email,
            phone_number: phoneNumber,
            age:
              role == "client" || role == "participant" ? ageNumber : undefined,
            summary:
              role == "event manager" || role == "showman"
                ? summary
                : undefined,
            role: role,
          };

          switch (role) {
            case "admin":
              await updateAdmin({
                full_name: fullname,
                email: email,
                phone_number: phoneNumber,
              });
              break;
            case "event manager":
            case "showman":
              await updateEmployee({
                full_name: fullname,
                email: email,
                phone_number: phoneNumber,
                summary: summary,
              });
              break;

            case "client":
            case "participant":
              await updateGuest({
                email,
                phone_number: phoneNumber,
                full_name: fullname,
                age: ageNumber,
              });
              break;
          }

          onUpdated(user);
          close();
        } catch (e) {}
      }
    };

    const translateRole = (role: string) => {
      switch (role) {
        case "admin":
          return "администратора";
        case "event manager":
          return "менеджера";
        case "showman":
          return "ведущего";
        case "client":
          return "заказчика";
        case "participant":
          return "участника";
        default:
          return "пользователя";
      }
    };

    const close = () => {
      resetDialog();
      modalRef.current?.close();
    };

    return (
      <>
        <dialog
          id="updateUserMenu"
          ref={modalRef}
          className={s.modal_window_container}
        >
          <div className={s.modal_window_header}>
            <p className={s.default_text}>
              Обновить пользователя {translateRole(role)}
            </p>
          </div>
          <div className={s.page_form_input_container}>
            <div className={s.page_form_input_with_error_container}>
              <Input
                id="fullname_update"
                label="ФИО"
                type="text"
                value={fullname}
                onChange={(e) => {
                  setFullname(e.target.value);
                  setFullnameError("");
                }}
                required
              />
              <p className={s.error_default_text}>{fullnameError}</p>
            </div>
            <div className={s.page_form_input_with_error_container}>
              <Input
                id="email_update"
                label="Email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                readOnly
              />
            </div>
            <div className={s.page_form_input_with_error_container}>
              <Input
                id="phone_update"
                label="Номер телефона"
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneNumberError("");
                }}
                required
              />
              <p className={s.error_default_text}>{phoneNumberError}</p>
            </div>
            {(role == "event manager" || role == "showman") && (
              <div className={s.page_form_input_with_error_container}>
                <MultilineInput
                  id="summary_update"
                  label="Резюме"
                  value={summary}
                  rows={5}
                  cols={40}
                  onChange={(e) => {
                    setSummary(e.target.value);
                  }}
                />
              </div>
            )}
            {(role == "client" || role == "participant") && (
              <div className={s.page_form_input_with_error_container}>
                <Input
                  id="age_update"
                  label="Возраст"
                  type="text"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    setAgeError("");
                  }}
                  required
                />
                <p className={s.error_default_text}>{ageError}</p>
              </div>
            )}
          </div>
          <form
            method="dialog"
            className={s.modal_window_buttons_container}
            onSubmit={onSubmit}
          >
            <PositiveButton text="Изменить" type="submit" />
            <NegativeButton text="Закрыть" type="button" onClick={close} />
          </form>
        </dialog>
      </>
    );
  }
);

export default UpdateUserDialog;
