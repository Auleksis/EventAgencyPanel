/// <reference types="vite-plugin-svgr/client" />

import s from "./Header.module.css";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Link from "../Link/Link";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Button from "../Button/Button";

const Header = () => {
  //0 = main page
  //1 = users management
  //2 = places management
  //3 = events management
  //5 = logs management
  //6 = about
  const [selectedSection, setSelectedSection] = useState<number>(0);

  const user = useSelector((state: RootState) => state.user);

  const location = useLocation();

  useEffect(() => {
    let pathname = location.pathname;

    if (pathname.charAt(pathname.length - 1) == "/") {
      pathname = pathname.slice(0, pathname.length - 1);
    }

    if (pathname == "/") {
      setSelectedSection(0);
    } else if (pathname.endsWith("users")) {
      setSelectedSection(1);
    } else if (pathname.endsWith("places")) {
      setSelectedSection(2);
    } else if (pathname.endsWith("events")) {
      setSelectedSection(3);
    } else if (pathname.endsWith("logs")) {
      setSelectedSection(5);
    } else if (pathname.endsWith("about")) {
      setSelectedSection(6);
    }
  }, [location.pathname]);

  const onExit = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <>
      <header className={s.header}>
        <div className={s.header_elements_div}>
          <p className={s.subtitle}>Прометей</p>
        </div>
        <nav className={s.header_nav_div}>
          {(user.role == "db admin" || user.role == "admin") && (
            <Link
              to={"/users"}
              text="Пользователи"
              active={selectedSection == 1}
              onClick={() => setSelectedSection(1)}
            />
          )}
          {(user.role == "db admin" ||
            user.role == "admin" ||
            user.role == "event manager" ||
            user.role == "showman") && (
            <Link
              to={"/places"}
              text="Площадки"
              active={selectedSection == 2}
              onClick={() => setSelectedSection(2)}
            />
          )}
          <Link
            to={"/events"}
            text="События"
            active={selectedSection == 3}
            onClick={() => setSelectedSection(3)}
          />
          {user.role == "db admin" && (
            <Link
              to={"/logs"}
              text="Логи"
              active={selectedSection == 5}
              onClick={() => setSelectedSection(5)}
            />
          )}
          {(user.role == "participant" || user.role == "client") && (
            <Link
              to={"/about"}
              text="О нас"
              active={selectedSection == 6}
              onClick={() => setSelectedSection(6)}
            />
          )}
        </nav>

        <div className={s.header_action_button_div}>
          <Button text="Выйти" onClick={onExit} />
        </div>
      </header>
    </>
  );
};

export default Header;
