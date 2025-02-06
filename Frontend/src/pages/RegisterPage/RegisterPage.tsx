import { FormEvent, useState } from "react";
import s from "./RegisterPage.module.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import Select from "../../components/Select/Select";
import { registerClient, registerParticipant } from "../../services/api";

const RegisterPage = () => {
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<number>(0);

  const [modes] = useState<Array<string>>(["Участник", "Заказчик"]);

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const passwordRegex = /^[A-Za-z0-9_]\w{8,}$/;
  const phoneRegex =
    /^(?:\+7|8)\s*\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;

  const [fullnameError, setFullnameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [ageError, setAgeError] = useState<string>("");

  const navigate = useNavigate();

  const registerCoroutine = async (ageNumber: number) => {
    const token =
      selectedMode == 0
        ? await registerParticipant({
            email,
            password,
            phone_number: phoneNumber,
            full_name: fullname,
            age: ageNumber,
          })
        : await registerClient({
            email,
            password,
            phone_number: phoneNumber,
            full_name: fullname,
            age: ageNumber,
          });

    localStorage.setItem("accessToken", token);
    navigate("/");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    if (age.trim().length == 0) {
      setAgeError("Укажите возразст");
    }

    const ageNumber = Number.parseInt(age);

    if (Number.isNaN(ageNumber)) {
      setAgeError("Возраст должен быть числом");
    }

    if (ageNumber < 18) {
      setAgeError("Зарегистрироваться на платформе можно только с 18 лет");
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
      registerCoroutine(ageNumber);
    }

    return () => {
      setFullname("");
      setEmail("");
      setPassword("");
      setAge("");
      setPhoneNumber("");

      setFullnameError("");
      setEmailError("");
      setPasswordError("");
      setAgeError("");
      setPasswordError("");
    };
  };

  const onModeSelected = (index: number) => {
    setSelectedMode(index);
  };

  return (
    <div className={s.register_page_container}>
      <form className={s.page_form_container} onSubmit={onSubmit}>
        <p className={s.subtitle}>Прометей</p>
        <p className={s.default_text}>Регистрация</p>
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
          <div className={s.page_form_input_with_error_container}>
            <Select
              id="mode"
              label="Роль"
              options={modes}
              onSelectClicked={onModeSelected}
            />
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
        </div>
        <Button
          text="Зарегистрироваться"
          type="submit"
          style={{ width: "100%" }}
        />
        <a href="/login">
          <p className={s.subtext}>Уже зарегистрированы?</p>
        </a>
      </form>
    </div>
  );
};

export default RegisterPage;
