import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout/Layout";
import { me } from "./services/api";
import { useDispatch, useSelector } from "react-redux";
import { dropUser, initUser } from "./features/user/User";
import { useNavigate } from "react-router-dom";
import { RootState } from "./store";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await me();
        dispatch(initUser(user));
      } catch (e) {
        dispatch(dropUser());
        navigate("/login");
      }
    };

    if (localStorage.getItem("accessToken")) {
      fetchUser();
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <>
      {user.email.length > 0 && <Layout />}
      {user.email.length == 0 && (
        <div>
          <p>Загрузка...</p>
        </div>
      )}
    </>
  );
}

export default App;
