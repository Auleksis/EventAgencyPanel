import { useState, useRef, useEffect } from "react";
import {
  PositiveButton,
  NegativeButton,
} from "../../components/Button/ActionButtons";
import Button from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import AcceptActionDialog, {
  AcceptActionDialogRef,
} from "../../components/Modals/AcceptActionDialog/AcceptActionDialog";
import Select from "../../components/Select/Select";
import s from "./UsersPage.module.css";
import { User } from "../../services/apiModels";
import AddUserDialog, {
  AddUserDialogRef,
} from "../../components/Modals/AddUserDialog/AddUserDialog";
import { deleteUser, getUsers } from "../../services/api";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Input from "../../components/Input/Input";
import UpdateUserDialog, {
  UpdateUserDialogRef,
} from "../../components/Modals/UpdateUserDialog/UpdateUserDialog";

const UsersPage = () => {
  const user = useSelector((state: RootState) => state.user);

  const [users, setUsers] = useState<Array<User>>([]);
  const [usersCount, setUsersCount] = useState<number>(0);

  const addUserDialogRef = useRef<AddUserDialogRef>(null);
  const updateUserDialogRef = useRef<UpdateUserDialogRef>(null);
  const deleteUserDialogRef = useRef<AcceptActionDialogRef>(null);

  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [visibleRoles] = useState<Array<string>>([
    "Не выбрано",
    "Администратор",
    "Менеджер",
    "Ведущий",
    "Заказчик",
    "Участник",
  ]);
  const [roles] = useState<Array<string | undefined>>([
    undefined,
    "admin",
    "event manager",
    "showman",
    "client",
    "participant",
  ]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [limits] = useState<Array<number>>([5, 10, 20, 40]);
  const [selectedLimitIndex, setSelectedLimitIndex] = useState<number>(0);

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
        role: roles[selectedRoleIndex],
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
  }, [fullname, email, phoneNumber, selectedRoleIndex]);

  interface UserRowProps {
    user: User;
  }
  const UserRow: React.FunctionComponent<UserRowProps> = (
    props: UserRowProps
  ) => {
    const translateRole = (role: string) => {
      switch (role) {
        case "admin":
          return "Администратор";
        case "event manager":
          return "Менеджер";
        case "showman":
          return "Ведущий";
        case "client":
          return "Заказчик";
        case "participant":
          return "Участник";
        default:
          return "Неизвестная роль";
      }
    };

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
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{translateRole(props.user.role)}</p>
        </td>

        <td
          className={s.main_page_table_row_non_text_cell_container}
          style={{
            width: "15rem",
            height: "5.5rem",
          }}
        >
          <div className={s.main_page_table_row_non_text_cell}>
            {(props.user.role != "admin" ||
              props.user.email == user.email ||
              user.role == "db admin") && (
              <PositiveButton
                text="Изменить"
                onClick={() => updateUserDialogRef.current?.show(props.user)}
              />
            )}
            {(props.user.role != "admin" || user.role == "db admin") && (
              <NegativeButton
                text="Удалить"
                onClick={() =>
                  deleteUserDialogRef.current?.show((email: string) => {
                    handleDeleteUser(email);
                  }, props.user.email)
                }
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  const handleAddingUser = (user: User) => {
    fetchUsers();
  };

  const handleUpdatingUser = (user: User) => {
    fetchUsers(page);
  };

  const handleDeleteUser = async (email: string) => {
    await deleteUser(email);
    await fetchUsers();
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

  const onRoleSelected = (index: number) => {
    setSelectedRoleIndex(index);
  };

  const clearFilter = () => {
    setFullname("");
    setEmail("");
    setPhoneNumber("");
    setSelectedRoleIndex(0);
  };

  return (
    <div className={s.main_page_container}>
      <div className={s.page_title_container}>
        <p className={s.title} style={{ fontWeight: "bold" }}>
          ПАНЕЛЬ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ
        </p>
      </div>
      <div className={s.main_page_section_container}>
        {user.role == "db admin" && (
          <div className={s.users_page_management_container}>
            <div className={s.users_page_card_container}>
              <Card
                title="Зарегистрировать администратора"
                description="Заполните данные о новом пользователе и добавьте его в систему."
                positive
              >
                <Button
                  text="Зарегистрировать"
                  onClick={() => {
                    addUserDialogRef.current?.show("admin");
                  }}
                />
              </Card>
            </div>

            <div className={s.users_page_card_container}>
              <Card
                title="Зарегистрировать менеджера"
                description="Заполните данные о новом пользователе и добавьте его в систему."
                positive
              >
                <Button
                  text="Зарегистрировать"
                  onClick={() => {
                    addUserDialogRef.current?.show("event manager");
                  }}
                />
              </Card>
            </div>

            <div className={s.users_page_card_container}>
              <Card
                title="Зарегистрировать ведущего"
                description="Заполните данные о новом пользователе и добавьте его в систему."
                positive
              >
                <Button
                  text="Зарегистрировать"
                  onClick={() => {
                    addUserDialogRef.current?.show("showman");
                  }}
                />
              </Card>
            </div>

            <div className={s.users_page_card_container}>
              <Card
                title="Зарегистрировать заказчика"
                description="Заполните данные о новом пользователе и добавьте его в систему."
                positive
              >
                <Button
                  text="Зарегистрировать"
                  onClick={() => {
                    addUserDialogRef.current?.show("client");
                  }}
                />
              </Card>
            </div>

            <div className={s.users_page_card_container}>
              <Card
                title="Зарегистрировать участника"
                description="Заполните данные о новом пользователе и добавьте его в систему."
                positive
              >
                <Button
                  text="Зарегистрировать"
                  onClick={() => {
                    addUserDialogRef.current?.show("participant");
                  }}
                />
              </Card>
            </div>
          </div>
        )}

        <AddUserDialog ref={addUserDialogRef} onAdded={handleAddingUser} />
        <UpdateUserDialog
          ref={updateUserDialogRef}
          onUpdated={handleUpdatingUser}
        />
        <AcceptActionDialog ref={deleteUserDialogRef} text="" />
      </div>
      <div className={s.main_page_section_container}>
        <div className={s.page_title_container}>
          <p className={s.subtitle}>СПИСОК ПОЛЬЗОВАТЕЛЕЙ</p>
        </div>
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
                <p className={s.subtext}>Роль</p>
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
                <Select
                  id="role_search"
                  label=""
                  onSelectClicked={onRoleSelected}
                  options={visibleRoles}
                  indexSelected={selectedRoleIndex}
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
    </div>
  );
};

export default UsersPage;
