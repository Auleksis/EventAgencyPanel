import s from "./MainPage.module.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const MainPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/events");
  }, []);
  return (
    <div>
      <p className={s.default_text}>A nice website is going to be here</p>
    </div>
  );
};

export default MainPage;
