import { useNavigate, useParams } from "react-router-dom";
import s from "./InviteListPage.module.css";
import {
  PositiveButton,
  NegativeButton,
} from "../../components/Button/ActionButtons";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { User } from "../../services/apiModels";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AcceptActionDialog, {
  AcceptActionDialogRef,
} from "../../components/Modals/AcceptActionDialog/AcceptActionDialog";
import {
  addInvite,
  deleteUser,
  getUsers,
  removeInvite,
} from "../../services/api";
import Button from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { AxiosError } from "axios";

const InviteListPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user);

  const [users, setUsers] = useState<Array<User>>([]);
  const [usersCount, setUsersCount] = useState<number>(0);

  const deleteUserDialogRef = useRef<AcceptActionDialogRef>(null);

  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [inviteEmail, setInviteEmail] = useState<string>("");

  const [error, setError] = useState<string>("");

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [limits] = useState<Array<number>>([5, 10, 20, 40]);
  const [selectedLimitIndex, setSelectedLimitIndex] = useState<number>(1);

  const fetchUsers = async (p: number = 0) => {
    setPage(p);

    const parseValue = (value: string) => {
      if (value.length == 0) {
        return undefined;
      }
      return value;
    };

    try {
      const result = await getUsers({
        skip: p * limit,
        limit: limit,
        full_name: parseValue(fullname),
        email: parseValue(email),
        phone_number: parseValue(phoneNumber),
        event_id: id,
        role: "participant",
      });

      setUsers(result.users);
      setUsersCount(result.count);
    } catch (e) {}
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [limit]);

  useEffect(() => {
    fetchUsers();
  }, [fullname, email, phoneNumber]);

  const handleDeleteUser = async (userID: string) => {
    if (id) {
      await removeInvite({ event_id: id, participant_id: userID });
      await fetchUsers();
    }
  };

  const onNextPage = async () => {
    let p = page + 1;

    if (usersCount <= limit * p) {
      return;
    }

    await fetchUsers(p);
  };

  const onPrevPage = async () => {
    if (page > 0) {
      let p = page - 1;
      await fetchUsers(p);
    }
  };

  const clearFilter = () => {
    setFullname("");
    setEmail("");
    setPhoneNumber("");
  };

  const handleInvite = async () => {
    setError("");
    if (id) {
      try {
        await addInvite({ event_id: id, participant_email: inviteEmail });
        await fetchUsers(0);
      } catch (e) {
        const er = e as AxiosError;
        if (er.status == 412) {
          setError("Участник не найден");
        }
        if (er.status == 413) {
          setError("Участник уже приглашён");
        }
      }
    }
  };

  interface UserRowProps {
    user: User;
  }
  const UserRow: React.FunctionComponent<UserRowProps> = (
    props: UserRowProps
  ) => {
    return (
      <tr className={s.page_table_row_container}>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.user.full_name}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.user.email}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.user.phone_number}</p>
        </td>

        <td className={s.main_page_table_row_non_text_cell_container}>
          <div className={s.main_page_table_row_non_text_cell}>
            <NegativeButton
              text="Удалить"
              onClick={() =>
                deleteUserDialogRef.current?.show((id: string) => {
                  handleDeleteUser(id);
                }, props.user.id ?? "")
              }
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={s.main_page_container}>
      <div className={s.page_title_container}>
        <p className={s.subtitle}>ПРИГЛАСИТЕЛЬНЫЙ СПИСОК</p>
      </div>

      <div className={s.invite_page_invite_box}>
        <NegativeButton
          text="Вернуться назад"
          onClick={() => {
            navigate("/events");
          }}
          style={{ width: "50%", margin: "1rem 0" }}
        />
      </div>

      <div className={s.invite_page_invite_box}>
        <div className={s.invite_page_invite_box_container}>
          <Input
            id="participant_email"
            label="Введите email участника"
            value={inviteEmail}
            type="email"
            onChange={(e) => {
              setInviteEmail(e.target.value);
            }}
          />
          <PositiveButton text="Пригласить" onClick={handleInvite} />
        </div>
        <p className={s.error_default_text}>{error}</p>
      </div>

      <AcceptActionDialog ref={deleteUserDialogRef} text="" />
      <div className={s.search_page_middle_container}>
        <div className={s.search_page_switch_page_container}>
          <Button text="Предыдущая" onClick={onPrevPage} />
          <p className={s.default_text}>Страница {page + 1}</p>
          <Button text="Следующая" onClick={onNextPage} />
          <div className={s.search_limit_container}>
            <Select
              id="limit"
              label=""
              onSelectClicked={(index) => {
                setSelectedLimitIndex(index);
                setLimit(limits[index]);
              }}
              indexSelected={selectedLimitIndex}
              options={limits}
            />
          </div>
        </div>
        <hr className={s.hr_horizontal} />
      </div>
      <table className={s.users_page_table}>
        <thead>
          <tr>
            <th>
              <p className={s.subtext}>ФИО</p>
            </th>
            <th>
              <p className={s.subtext}>Email</p>
            </th>
            <th>
              <p className={s.subtext}>Номер телефона</p>
            </th>
            <th>
              <p className={s.subtext}>Действия</p>
            </th>
          </tr>
          <tr>
            <th>
              <Input
                id="fullname_search"
                label=""
                placeholder="Фильтровать по ФИО"
                value={fullname}
                onChange={(e) => {
                  setFullname(e.target.value);
                }}
              />
            </th>
            <th>
              <Input
                id="email_search"
                label=""
                placeholder="Фильтровать по Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </th>
            <th>
              <Input
                id="phone_search"
                label=""
                placeholder="Фильтровать по номеру (полному)"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                }}
              />
            </th>
            <th>
              <NegativeButton text="Сбросить фильтры" onClick={clearFilter} />
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((value) => (
            <UserRow user={value} key={value.email} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InviteListPage;
