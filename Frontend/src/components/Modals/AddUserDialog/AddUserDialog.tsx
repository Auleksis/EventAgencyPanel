import {
  FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { User } from "../../../services/apiModels";
import s from "./AddUserDialog.module.css";
import { NegativeButton, PositiveButton } from "../../Button/ActionButtons";
import Input from "../../Input/Input";
import MultilineInput from "../../MultilineInput/MultilineInput";
import {
  registerAdmin,
  registerClient,
  registerEventManager,
  registerParticipant,
  registerShowman,
} from "../../../services/api";

export interface AddUserDialogProps {
  onAdded: (user: User) => void;
}

export type AddUserDialogRef = {
  show: (role: string) => void;
  close: () => void;
};

const AddUserDialog = forwardRef<AddUserDialogRef, AddUserDialogProps>(
  ({ onAdded }, forwardRef) => {
    const [fullname, setFullname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [age, setAge] = useState<string>("");
    const [summary, setSummary] = useState<string>("");

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    const passwordRegex = /^[A-Za-z0-9_]\w{8,}$/;
    const phoneRegex =
      /^(?:\+7|8)\s*\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;

    const [fullnameError, setFullnameError] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [phoneNumberError, setPhoneNumberError] = useState<string>("");
    const [ageError, setAgeError] = useState<string>("");

    const [role, setRole] = useState<string>("");

    const modalRef = useRef<HTMLDialogElement>(null);

    const resetDialog = () => {
      setFullname("");
      setEmail("");
      setPassword("");
      setAge("");
      setPhoneNumber("");
      setSummary("");

      setFullnameError("");
      setEmailError("");
      setPasswordError("");
      setAgeError("");
      setPasswordError("");
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
      show: (role: string) => {
        modalRef.current?.showModal();
        setRole(role);
      },
    }));

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setFullnameError("");
      setEmailError("");
      setPasswordError("");
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

      if (!emailRegex.test(email)) {
        setEmailError("Неверный email");
      }

      if (!passwordRegex.test(password)) {
        setPasswordError(
          "Пароль должен быть не менее 8 символов и содержать только латинские буквы, цифры и нижние подчёркивания"
        );
      }

      if (
        passwordError.length == 0 &&
        emailError.length == 0 &&
        fullnameError.length == 0 &&
        phoneNumberError.length == 0 &&
        ageError.length == 0
      ) {
        try {
          const user = {
            full_name: fullname,
            email: email,
            password: password,
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
              await registerAdmin({
                full_name: fullname,
                email: email,
                password: password,
                phone_number: phoneNumber,
              });
              break;
            case "event manager":
              await registerEventManager({
                full_name: fullname,
                email: email,
                password: password,
                phone_number: phoneNumber,
                summary: summary,
              });
              break;
            case "showman":
              await registerShowman({
                full_name: fullname,
                email: email,
                password: password,
                phone_number: phoneNumber,
                summary: summary,
              });
              break;
            case "client":
              await registerClient({
                email,
                password,
                phone_number: phoneNumber,
                full_name: fullname,
                age: ageNumber,
              });
              break;
            case "participant":
              await registerParticipant({
                email,
                password,
                phone_number: phoneNumber,
                full_name: fullname,
                age: ageNumber,
              });
              break;
          }
          onAdded(user);
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
          id="addFacultyMenu"
          ref={modalRef}
          className={s.modal_window_container}
        >
          <div className={s.modal_window_header}>
            <p className={s.default_text}>Добавить {translateRole(role)}</p>
          </div>
          <div className={s.page_form_input_container}>
            <div className={s.page_form_input_with_error_container}>
              <Input
                id="fullname"
                label="ФИО"
                type="text"
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
                id="email"
                label="Email"
                type="text"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                required
              />
              <p className={s.error_default_text}>{emailError}</p>
            </div>
            <div className={s.page_form_input_with_error_container}>
              <Input
                id="phone"
                label="Номер телефона"
                type="text"
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneNumberError("");
                }}
                required
              />
              <p className={s.error_default_text}>{phoneNumberError}</p>
            </div>
            <div className={s.page_form_input_with_error_container}>
              <Input
                id="password"
                label="Пароль"
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                required
              />
              <p className={s.error_default_text}>{passwordError}</p>
            </div>
            {(role == "event manager" || role == "showman") && (
              <div className={s.page_form_input_with_error_container}>
                <MultilineInput
                  id="summary"
                  label="Резюме"
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
                  id="age"
                  label="Возраст"
                  type="text"
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
            <PositiveButton text="Добавить" type="submit" />
            <NegativeButton text="Закрыть" type="button" onClick={close} />
          </form>
        </dialog>
      </>
    );
  }
);

export default AddUserDialog;
