import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import s from "./LoginPage.module.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { login } from "../../services/api";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      setError("");
      setEmail("");
      setPassword("");
    };
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const loginCoroutine = async () => {
      try {
        if (email.length > 0 && password.length > 0) {
          const token = await login(email, password);
          localStorage.setItem("accessToken", token);
          navigate("/");
        } else {
          setError("Укажите логин и пароль");
        }
      } catch (e) {
        setError("Неверный логин или пароль");
      }
    };
    loginCoroutine();
  };

  return (
    <div className={s.login_page_container}>
      <form className={s.page_form_container} onSubmit={onSubmit}>
        <p className={s.subtitle}>Прометей</p>
        <p className={s.default_text}>Войти</p>
        <div className={s.page_form_input_container}>
          <p className={s.error_default_text}>{error}</p>
          <div className={s.page_form_input_with_error_container}>
            <Input
              id="email"
              label="Логин (email)"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={s.page_form_input_with_error_container}>
            <Input
              id="password"
              label="Пароль"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <Button text="Войти" type="submit" style={{ width: "100%" }} />
        <a href="/register">
          <p className={s.subtext}>Зарегистрироваться</p>
        </a>
      </form>
    </div>
  );
};

export default LoginPage;
