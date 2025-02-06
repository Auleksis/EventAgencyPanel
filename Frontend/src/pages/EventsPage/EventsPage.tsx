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
import s from "./EventsPage.module.css";
import { EventShort, Place, PlaceShort, User } from "../../services/apiModels";
import {
  deletePlace,
  deleteUser,
  getEvents,
  getPlaces,
  getUsers,
} from "../../services/api";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Input from "../../components/Input/Input";
import UpdateUserDialog, {
  UpdateUserDialogRef,
} from "../../components/Modals/UpdateUserDialog/UpdateUserDialog";
import AddPlaceDialog, {
  AddPlaceDialogRef,
} from "../../components/Modals/AddPlaceDialog/AddPlaceDialog";
import UpdatePlaceDialog, {
  UpdatePlaceDialogRef,
} from "../../components/Modals/UpdatePlaceDialog/UpdatePlaceDialog";
import { useNavigate } from "react-router-dom";

const EventsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [events, setEvents] = useState<Array<EventShort>>([]);
  const [eventsCount, setEventsCount] = useState<number>(0);

  const deletePlaceDialogRef = useRef<AcceptActionDialogRef>(null);

  const [showRequests, setShowRequests] = useState<boolean>(false);
  const [showAttention, setShowAttention] = useState<boolean>(false);
  const [showOwn, setShowOwn] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [limits] = useState<Array<number>>([5, 10, 20, 40]);
  const [selectedLimitIndex, setSelectedLimitIndex] = useState<number>(0);

  const fetchPlaces = async (p: number = 0) => {
    setPage(p);

    try {
      const result = await getEvents({
        skip: p * limit,
        limit: limit,
        showRequests: showRequests,
        showAttention: showAttention,
        showOwn: showOwn,
      });

      setEvents(result.events);
      setEventsCount(result.count);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [limit]);

  useEffect(() => {
    fetchPlaces();
  }, [showAttention, showRequests, showOwn]);

  interface EventRowProps {
    event: EventShort;
  }
  const EventRow: React.FunctionComponent<EventRowProps> = (
    props: EventRowProps
  ) => {
    return (
      <tr className={s.page_table_row_container}>
        <td
          className={s.main_page_table_row_text_cell}
          style={{ width: "25rem" }}
        >
          <p className={s.subtext}>{props.event.event_name}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.event.event_date}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.event.place_name}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.event.place_address}</p>
        </td>

        <td className={s.main_page_table_row_non_text_cell_container}>
          <div className={s.main_page_table_row_non_text_cell}>
            <PositiveButton
              text="Подробнее"
              onClick={() => {
                navigate(`/event_manage/${props.event.id}`);
              }}
            />

            {(user.role == "db admin" ||
              user.role == "admin" ||
              user.role == "client" ||
              user.role == "event manager" ||
              user.role == "showman") && (
              <PositiveButton
                text="Список гостей"
                onClick={() => {
                  navigate(`/event_invite_list/${props.event.id}`);
                }}
              />
            )}

            {(user.role == "db admin" ||
              user.role == "admin" ||
              user.role == "event manager") && (
              <PositiveButton
                text="Отчёты"
                onClick={() => {
                  navigate(`/event_reports/${props.event.id}`);
                }}
              />
            )}

            {(user.role == "db admin" || user.role == "admin") && (
              <NegativeButton
                text="Удалить"
                onClick={() =>
                  deletePlaceDialogRef.current?.show((id: string) => {
                    handleDeletePlace(id);
                  }, props.event.id)
                }
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  const handleAddingPlace = (place: Place) => {
    fetchPlaces();
  };

  const handleUpdatingPlace = (place: Place) => {
    fetchPlaces(page);
  };

  const handleDeletePlace = async (id: string) => {
    await deletePlace(id);
    await fetchPlaces();
  };

  const onNextPage = async () => {
    let p = page + 1;

    if (eventsCount <= limit * p) {
      return;
    }

    await fetchPlaces(p);
  };

  const onPrevPage = async () => {
    if (page > 0) {
      let p = page - 1;
      await fetchPlaces(p);
    }
  };

  const clearFilter = () => {
    setShowRequests(false);
    setShowAttention(false);
    setShowOwn(false);
  };

  return (
    <div className={s.main_page_container}>
      <div className={s.page_title_container}>
        <p className={s.title} style={{ fontWeight: "bold" }}>
          {user.role == "db admin" ||
          user.role == "admin" ||
          user.role == "event manager" ||
          user.role == "showman"
            ? "ПАНЕЛЬ УПРАВЛЕНИЯ СОБЫТИЯМИ"
            : "СОБЫТИЯ"}
        </p>
      </div>
      <div className={s.main_page_section_container}>
        <div className={s.users_page_management_container}>
          {user.role == "client" && (
            <div className={s.users_page_card_container}>
              <Card
                title="Оставить заявку на мероприятие"
                description="Заполните данные о мероприятии и ожидайте ответа от администратора."
                positive
              >
                <Button
                  text="Оставить заявку"
                  onClick={() => {
                    navigate("/event_request");
                  }}
                />
              </Card>
            </div>
          )}
        </div>

        {/* <UpdatePlaceDialog
          ref={updatePlaceDialogRef}
          onUpdated={handleUpdatingPlace}
        /> */}
        <AcceptActionDialog ref={deletePlaceDialogRef} text="" />
      </div>
      <div className={s.main_page_section_container}>
        <div className={s.page_title_container}>
          <p className={s.subtitle}>СПИСОК СОБЫТИЙ</p>
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
                <p className={s.subtext}>Навзание</p>
              </th>
              <th>
                <p className={s.subtext}>Дата</p>
              </th>
              <th>
                <p className={s.subtext}>Площадка</p>
              </th>
              <th>
                <p className={s.subtext}>Адрес</p>
              </th>
              <th>
                <p className={s.subtext}>Действия</p>
              </th>
            </tr>
            {(user.role == "admin" || user.role == "db admin") && (
              <tr>
                <th>
                  <div className={s.events_page_checkbox_filter_div}>
                    <p className={s.subtext}>Показать заявки</p>
                    <input
                      type="checkbox"
                      checked={showRequests}
                      onChange={(e) => {
                        setShowRequests(e.target.checked);
                      }}
                    />
                  </div>
                </th>
                <th>
                  <div className={s.events_page_checkbox_filter_div}>
                    <p className={s.subtext}>Показать требующие внимания</p>
                    <input
                      type="checkbox"
                      checked={showAttention}
                      onChange={(e) => {
                        setShowAttention(e.target.checked);
                      }}
                    />
                  </div>
                </th>
                <th>
                  {user.role != "db admin" && (
                    <div className={s.events_page_checkbox_filter_div}>
                      <p className={s.subtext}>Показать свои</p>
                      <input
                        type="checkbox"
                        checked={showOwn}
                        onChange={(e) => {
                          setShowOwn(e.target.checked);
                        }}
                      />
                    </div>
                  )}
                </th>
                <th></th>
                <th>
                  <NegativeButton
                    text="Сбросить фильтры"
                    onClick={clearFilter}
                  />
                </th>
              </tr>
            )}
          </thead>
          <tbody>
            {events.map((value) => (
              <EventRow event={value} key={value.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsPage;
