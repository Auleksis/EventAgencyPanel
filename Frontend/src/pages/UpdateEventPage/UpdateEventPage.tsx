import { useSelector } from "react-redux";
import s from "./UpdateEventPage.module.css";
import { RootState } from "../../store";
import { data, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Input from "../../components/Input/Input";
import MultilineInput from "../../components/MultilineInput/MultilineInput";
import Select from "../../components/Select/Select";
import { PlaceShort, User } from "../../services/apiModels";
import {
  addEvent,
  getEvent,
  getPlace,
  getPlaces,
  getUsers,
  updateEventAdmin,
  updateEventBecomeAdmin,
  updateEventClient,
} from "../../services/api";
import Button from "../../components/Button/Button";
import {
  NegativeButton,
  PositiveButton,
} from "../../components/Button/ActionButtons";
import { AxiosError } from "axios";

interface PlaceReview {
  id?: string;
  name: string;
  address: string;
  description: string;
}

const UpdateEventPage = () => {
  const { id } = useParams<{ id: string }>();

  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [eventName, setEventName] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");

  const [clientDescription, setClientDescription] = useState<string>("");
  const [descriptionForShowman, setDescriptionForShowman] = useState<
    string | undefined
  >("");
  const [descriptionForEventManager, setDescriptionForEventManager] = useState<
    string | undefined
  >("");
  const [descriptionForParticipants, setDescriptionForParticipants] = useState<
    string | undefined
  >("");

  const [adminFullname, setAdminFullname] = useState<string | undefined>("");
  const [adminEmail, setAdminEmail] = useState<string | undefined>("");
  const [adminPhone, setAdminPhone] = useState<string | undefined>("");

  const [showmanFullname, setShowmanFullname] = useState<string | undefined>(
    ""
  );
  const [showmanEmail, setShowmanEmail] = useState<string | undefined>("");
  const [showmanPhone, setShowmanPhone] = useState<string | undefined>("");

  const [eventManagerFullname, setEventManagerFullname] = useState<
    string | undefined
  >("");
  const [eventManagerEmail, setEventManagerEmail] = useState<
    string | undefined
  >("");
  const [eventManagerPhone, setEventManagerPhone] = useState<
    string | undefined
  >("");

  const [clientFullname, setClientFullname] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");

  const [eventNameError, setEventNameError] = useState<string>("");
  const [eventDateError, setEventDateError] = useState<string>("");

  const [places, setPlaces] = useState<Array<PlaceReview>>([]);
  const [namesList, setNames] = useState<Array<string>>([]);
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState<number>(0);

  const [admins, setadmins] = useState<Array<User | undefined>>([]);
  const [adminsNames, setAdminsNames] = useState<Array<string>>([]);
  const [selectedAdminsIndex, setSelectedAdminsIndex] = useState<number>(0);

  const [showmans, setShowmans] = useState<Array<User | undefined>>([]);
  const [showmanNames, setShowmanNames] = useState<Array<string>>([]);
  const [selectedShowmanIndex, setSelectedShowmanIndex] = useState<number>(0);

  const [eventManagers, setEventManagers] = useState<Array<User | undefined>>(
    []
  );
  const [eventManagerNames, setEventManagerNames] = useState<Array<string>>([]);
  const [selectedEventManagerIndex, setSelectedEventManagerIndex] =
    useState<number>(0);

  const [error, setError] = useState<string>("");

  const [show, setShow] = useState<boolean>(false);

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const fetch = async () => {
    if (!id) {
      return;
    }

    const event = await getEvent(id);

    setEventName(event.event_name);
    setEventDate(event.event_date);

    setClientDescription(event.client_description);
    setDescriptionForEventManager(event.description_for_event_manager);
    setDescriptionForShowman(event.description_for_showman);
    setDescriptionForParticipants(event.description_for_participants);

    setClientFullname(event.client_fullname);
    setClientEmail(event.client_email);
    setClientPhone(event.client_phone_number);

    setAdminFullname(event.admin_fullname);
    setAdminEmail(event.admin_email);
    setAdminPhone(event.admin_number);

    setEventManagerFullname(event.event_manager_fullname);
    setEventManagerEmail(event.event_manager_email);
    setEventManagerPhone(event.event_manager_number);

    setShowmanFullname(event.showman_fullname);
    setShowmanEmail(event.showman_email);
    setShowmanPhone(event.showman_number);

    const fetched = await getPlaces({ skip: 0, limit: 10000 });

    let names = ["Не выбрано"];
    let addresses = [""];
    let ids = [""];

    fetched.places.forEach((v) => {
      names.push(v.name);
      addresses.push(v.address);
      ids.push(v.id);
    });

    let finalList: Array<PlaceReview> = [];

    finalList.push({
      id: undefined,
      address: addresses[0],
      description: "",
      name: names[0],
    });

    for (let i = 1; i < ids.length; i++) {
      const place = await getPlace(ids[i]);

      finalList.push({
        id: place.id,
        address: addresses[i],
        description: place.description,
        name: names[i],
      });

      if (place.name == event.place_name) {
        setSelectedPlaceIndex(i);
      }
    }

    setPlaces(finalList);
    setNames(names);

    if (
      user.role == "admin" ||
      user.role == "db admin" ||
      user.role == "client"
    ) {
      const fetchedAdmins = await getUsers({
        skip: 0,
        limit: 1000,
        role: "admin",
      });

      let finalAdminsNamesList = ["Не выбран"];
      let finalAdminsList: Array<User | undefined> = [undefined];

      for (let i = 0; i < fetchedAdmins.count; i++) {
        finalAdminsNamesList.push(fetchedAdmins.users[i].full_name);
        finalAdminsList.push(fetchedAdmins.users[i]);

        if (fetchedAdmins.users[i].email == event.admin_email) {
          setSelectedAdminsIndex(i + 1);
        }
      }

      setadmins(finalAdminsList);
      setAdminsNames(finalAdminsNamesList);

      const fetchedShowmans = await getUsers({
        skip: 0,
        limit: 1000,
        role: "showman",
      });

      let finalShowmansNamesList = ["Не выбран"];
      let finalShowmansList: Array<User | undefined> = [undefined];

      for (let i = 0; i < fetchedShowmans.count; i++) {
        finalShowmansNamesList.push(fetchedShowmans.users[i].full_name);
        finalShowmansList.push(fetchedShowmans.users[i]);

        if (fetchedShowmans.users[i].email == event.showman_email) {
          setSelectedShowmanIndex(i + 1);
        }
      }

      setShowmans(finalShowmansList);
      setShowmanNames(finalShowmansNamesList);

      const fetchedEM = await getUsers({
        skip: 0,
        limit: 1000,
        role: "event manager",
      });

      let finalEMNamesList = ["Не выбран"];
      let finalEMList: Array<User | undefined> = [undefined];

      for (let i = 0; i < fetchedEM.count; i++) {
        finalEMNamesList.push(fetchedEM.users[i].full_name);
        finalEMList.push(fetchedEM.users[i]);

        if (fetchedEM.users[i].email == event.event_manager_email) {
          setSelectedEventManagerIndex(i + 1);
        }
      }

      setEventManagers(finalEMList);
      setEventManagerNames(finalEMNamesList);
    }
    setShow(true);
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    setAdminEmail(admins[selectedAdminsIndex]?.email ?? "");
    setAdminPhone(admins[selectedAdminsIndex]?.phone_number ?? "");
  }, [selectedAdminsIndex]);

  useEffect(() => {
    setShowmanEmail(showmans[selectedShowmanIndex]?.email ?? "");
    setShowmanPhone(showmans[selectedShowmanIndex]?.phone_number ?? "");
  }, [selectedShowmanIndex]);

  useEffect(() => {
    setEventManagerEmail(eventManagers[selectedEventManagerIndex]?.email ?? "");
    setEventManagerPhone(
      eventManagers[selectedEventManagerIndex]?.phone_number ?? ""
    );
  }, [selectedEventManagerIndex]);

  const handleSelectedPlaceIndex = (index: number) => {
    setSelectedPlaceIndex(index);
    setError("");
  };

  const handleBecomeAdmin = async () => {
    if (id) {
      await updateEventBecomeAdmin(id);
      window.location.reload();
    }
  };

  const submit = async () => {
    if (!id) {
      return;
    }

    if (eventName.length == 0) {
      setEventNameError("Введите название");
      return;
    }

    if (eventDate.length == 0) {
      setEventDateError("Выберите дату");
      return;
    }

    try {
      if (user.role == "admin" || user.role == "db admin") {
        await updateEventAdmin({
          id: id,
          event_name: eventName,
          event_date: eventDate,
          client_description: clientDescription,
          description_for_event_manager: descriptionForEventManager,
          description_for_showman: descriptionForShowman,
          description_for_participants: descriptionForParticipants,
          admin_id: admins[selectedAdminsIndex]?.id,
          place_id: places[selectedPlaceIndex].id,
          showman_id: showmans[selectedShowmanIndex]?.id,
          event_manager_id: eventManagers[selectedEventManagerIndex]?.id,
        });
      } else if (user.role == "client") {
        await updateEventClient({
          id: id,
          client_description: clientDescription,
        });
      }
      navigate("/events");
    } catch (e) {
      const ae = e as AxiosError;
      if (ae.status == 417) {
        setError("Выберите дату в будущем.");
      } else {
        setError(
          "К сожалению, в данный день площадка занята. Пожалуйста, выберите другую."
        );
      }
    }
  };

  return (
    <>
      {show && (
        <div className={s.main_page_container}>
          <div className={s.page_title_container}>
            <p className={s.subtitle}>
              ПРОСМОТР И РЕДАКТИРОВАНИЕ ДАННЫХ О МЕРОПРИЯТИИ
            </p>
          </div>
          <div className={s.add_event_page_sections_container}>
            <div className={s.add_event_page_element_type_2}>
              <div className={s.add_event_page_column_section_div}>
                <Input
                  value={eventName}
                  id="event_name"
                  label="Название мероприятия"
                  onChange={(e) => {
                    setEventNameError("");
                    setEventName(e.target.value);
                  }}
                  centerTitle
                  readOnly={user.role != "admin" && user.role != "db admin"}
                />
                <p className={s.error_default_text}>{eventNameError}</p>
              </div>

              <div className={s.add_event_page_column_section_div}>
                <Input
                  value={eventDate}
                  id="event_date"
                  label="Дата"
                  type="date"
                  onChange={(e) => {
                    setEventDateError("");
                    setEventDate(e.target.value);
                  }}
                  min={minDate}
                  centerTitle
                  readOnly={user.role != "admin" && user.role != "db admin"}
                />

                <p className={s.error_default_text}>{eventDateError}</p>
              </div>
              {user.role != "participant" && (
                <MultilineInput
                  value={clientDescription}
                  id="client_description"
                  label="Описание заказчика"
                  onChange={(e) => {
                    setClientDescription(e.target.value);
                  }}
                  rows={8}
                  cols={60}
                  centerTitle
                  readOnly={user.role != "client"}
                />
              )}

              <div className={s.add_event_page_column_section_div}>
                <p className={s.error_default_text}>{error}</p>
                <p className={s.subtext}>Площадка</p>
                <div className={s.add_event_page_row_section_div}>
                  <div className={s.add_event_page_element_type_2}>
                    <Select
                      id="place_name"
                      label=""
                      indexSelected={selectedPlaceIndex}
                      onSelectClicked={handleSelectedPlaceIndex}
                      options={namesList}
                      readOnly={user.role != "admin" && user.role != "db admin"}
                    />
                  </div>
                  <div className={s.add_event_page_element_type_2}>
                    <MultilineInput
                      id="place_description"
                      label=""
                      value={
                        places[selectedPlaceIndex].address +
                        "\n" +
                        places[selectedPlaceIndex].description
                      }
                      readOnly
                      rows={6}
                      cols={40}
                    />
                  </div>
                </div>
              </div>
              {(user.role == "admin" ||
                user.role == "db admin" ||
                user.role == "event manager" ||
                user.role == "showman" ||
                user.role == "participant") && (
                <>
                  <div className={s.add_event_page_column_section_div}>
                    <Input
                      label="Заказчик"
                      id="clientFullname"
                      value={clientFullname}
                      readOnly
                    />
                  </div>
                  <div className={s.add_event_page_column_section_div}>
                    <Input
                      label="Email заказчика"
                      id="clientEmail"
                      value={clientEmail}
                      readOnly
                    />
                  </div>
                  <div className={s.add_event_page_column_section_div}>
                    <Input
                      label="Номер телефона заказчика"
                      id="clientPhone"
                      value={clientPhone}
                      readOnly
                    />
                  </div>
                </>
              )}
              {(user.role == "client" ||
                user.role == "db admin" ||
                user.role == "event manager" ||
                user.role == "showman" ||
                user.role == "participant") && (
                <>
                  <div className={s.add_event_page_column_section_div}>
                    {user.role != "participant" && (
                      <Select
                        label="Администратор"
                        id="adminFullname"
                        indexSelected={selectedAdminsIndex}
                        onSelectClicked={(index: number) => {
                          setSelectedAdminsIndex(index);
                        }}
                        options={adminsNames}
                        readOnly={user.role != "db admin"}
                      />
                    )}
                  </div>
                  <div className={s.add_event_page_column_section_div}>
                    <Input
                      label="Email администратора"
                      id="adminEmail"
                      value={adminEmail ?? ""}
                      readOnly
                    />
                  </div>
                  <div className={s.add_event_page_column_section_div}>
                    <Input
                      label="Номер телефона администратора"
                      id="adminPhone"
                      value={adminPhone ?? ""}
                      readOnly
                    />
                  </div>
                </>
              )}
              {user.role == "admin" &&
                (!adminFullname || adminFullname?.length == 0) && (
                  <PositiveButton
                    text="Стать администратором этого мероприятия"
                    style={{ margin: "1rem 0" }}
                    onClick={handleBecomeAdmin}
                  />
                )}
              {(user.role == "admin" ||
                user.role == "db admin" ||
                user.role == "client" ||
                user.role == "event manager") && (
                <>
                  {user.role != "event manager" && (
                    <>
                      <div className={s.add_event_page_column_section_div}>
                        <Select
                          label="Менеджер"
                          id="eventManagerFullname"
                          options={eventManagerNames}
                          onSelectClicked={(index: number) => {
                            setSelectedEventManagerIndex(index);
                          }}
                          indexSelected={selectedEventManagerIndex}
                          readOnly={
                            user.role != "admin" && user.role != "db admin"
                          }
                        />
                      </div>
                      <div className={s.add_event_page_column_section_div}>
                        <Input
                          label="Email менеджера"
                          id="eventManagerEmail"
                          value={eventManagerEmail ?? ""}
                          readOnly
                        />
                      </div>
                      <div className={s.add_event_page_column_section_div}>
                        <Input
                          label="Номер телефона менеджера"
                          id="eventManagerPhone"
                          value={eventManagerPhone ?? ""}
                          readOnly
                        />
                      </div>
                    </>
                  )}
                  {user.role != "client" && (
                    <MultilineInput
                      id="desc_for_em"
                      label="Описание для менеджера"
                      value={descriptionForEventManager ?? ""}
                      onChange={(e) => {
                        setDescriptionForEventManager(e.target.value);
                      }}
                      readOnly={user.role == "event manager"}
                      rows={6}
                      cols={40}
                    />
                  )}
                </>
              )}
              {(user.role == "admin" ||
                user.role == "db admin" ||
                user.role == "client" ||
                user.role == "showman") && (
                <>
                  {user.role != "showman" && (
                    <>
                      <div className={s.add_event_page_column_section_div}>
                        <Select
                          label="Ведущий"
                          id="showmanFullname"
                          options={showmanNames}
                          onSelectClicked={(index: number) => {
                            setSelectedShowmanIndex(index);
                          }}
                          indexSelected={selectedShowmanIndex}
                          readOnly={
                            user.role != "admin" && user.role != "db admin"
                          }
                        />
                      </div>
                      <div className={s.add_event_page_column_section_div}>
                        <Input
                          label="Email ведущего"
                          id="showmanEmail"
                          value={showmanEmail ?? ""}
                          readOnly
                        />
                      </div>
                      <div className={s.add_event_page_column_section_div}>
                        <Input
                          label="Номер телефона ведущего"
                          id="showmanPhone"
                          value={showmanPhone ?? ""}
                          readOnly
                        />
                      </div>
                    </>
                  )}
                  {user.role != "client" && (
                    <MultilineInput
                      id="desc_for_sm"
                      label="Описание для ведущего"
                      value={descriptionForShowman ?? ""}
                      onChange={(e) => {
                        setDescriptionForShowman(e.target.value);
                      }}
                      readOnly={user.role == "showman"}
                      rows={6}
                      cols={40}
                    />
                  )}
                </>
              )}
              {(user.role == "admin" ||
                user.role == "db admin" ||
                user.role == "client") && (
                <MultilineInput
                  id="desc_for_pt"
                  label="Описание для участников"
                  value={descriptionForShowman ?? ""}
                  onChange={(e) => {
                    setDescriptionForParticipants(e.target.value);
                  }}
                  rows={6}
                  cols={40}
                />
              )}

              {user.role != "participant" &&
                user.role != "event manager" &&
                user.role != "showan" && (
                  <PositiveButton
                    text="Применить изменения"
                    onClick={submit}
                    style={{ width: "100%", margin: "1rem 0" }}
                  />
                )}
              <NegativeButton
                text="Вернуться назад"
                onClick={() => {
                  navigate("/events");
                }}
                style={{ width: "100%", margin: "1rem 0" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateEventPage;
