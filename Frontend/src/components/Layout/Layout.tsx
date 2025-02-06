import { Outlet, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import s from "./Layout.module.css";

const Layout = () => {
  return (
    <>
      <div className={s.layout}>
        <Header />
        <main className={s.main_container}>
          <div className={s.content_container}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
