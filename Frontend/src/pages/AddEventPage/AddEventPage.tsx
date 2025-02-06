import { useSelector } from "react-redux";
import s from "./AddEventPage.module.css";
import { RootState } from "../../store";
import { data, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Input from "../../components/Input/Input";
import MultilineInput from "../../components/MultilineInput/MultilineInput";
import Select from "../../components/Select/Select";
import { PlaceShort } from "../../services/apiModels";
import { addEvent, getPlace, getPlaces } from "../../services/api";
import Button from "../../components/Button/Button";
import {
  NegativeButton,
  PositiveButton,
} from "../../components/Button/ActionButtons";

interface PlaceReview {
  id?: string;
  name: string;
  address: string;
  description: string;
}

const AddEventPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [eventName, setEventName] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [clientDescription, setClientDescription] = useState<string>("");

  const [eventNameError, setEventNameError] = useState<string>("");
  const [eventDateError, setEventDateError] = useState<string>("");

  const [places, setPlaces] = useState<Array<PlaceReview>>([]);
  const [namesList, setNames] = useState<Array<string>>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [error, setError] = useState<string>("");

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const fetchPlaces = async () => {
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
    }

    setPlaces(finalList);
    setNames(names);
  };

  useEffect(() => {
    fetchPlaces();
  }, [selectedIndex]);

  const handleSelectedPlaceIndex = (index: number) => {
    setSelectedIndex(index);
    setError("");
  };

  const submit = async () => {
    if (eventName.length == 0) {
      setEventNameError("Введите название");
      return;
    }

    if (eventDate.length == 0) {
      setEventDateError("Выберите дату");
      return;
    }

    if (error.length != 0) {
      return;
    }

    try {
      await addEvent({
        client_description: clientDescription,
        event_date: eventDate,
        event_name: eventName,
        place_id: places[selectedIndex].id,
      });
      navigate("/events");
    } catch (e) {
      setError(
        "К сожалению, в данный день площадка занята. Пожалуйста, выберите другую."
      );
    }
  };

  return (
    <>
      {places.length > 0 && (
        <div className={s.main_page_container}>
          <div className={s.page_title_container}>
            <p className={s.subtitle}>ЗАЯВКА НА МЕРОПРИЯТИЕ</p>
          </div>
          <div className={s.add_event_page_sections_container}>
            <div className={s.add_event_page_element_type_2}>
              <div className={s.add_event_page_column_section_div}>
                <Input
                  value={eventName}
                  id="event_name"
                  label="Назовите мероприятие"
                  onChange={(e) => {
                    setEventNameError("");
                    setEventName(e.target.value);
                  }}
                  centerTitle
                />
                <p className={s.error_default_text}>{eventNameError}</p>
              </div>

              <div className={s.add_event_page_column_section_div}>
                <Input
                  value={eventDate}
                  id="event_date"
                  label="Выберите дату"
                  type="date"
                  onChange={(e) => {
                    setEventDateError("");
                    setEventDate(e.target.value);
                  }}
                  min={minDate}
                  centerTitle
                />

                <p className={s.error_default_text}>{eventDateError}</p>
              </div>

              <MultilineInput
                value={clientDescription}
                id="client_description"
                label="Опишите ваше мероприятие"
                onChange={(e) => {
                  setClientDescription(e.target.value);
                }}
                rows={8}
                cols={60}
                centerTitle
              />

              <div className={s.add_event_page_column_section_div}>
                <p className={s.error_default_text}>{error}</p>
                <p className={s.subtext}>Выберите площадку</p>
                <div className={s.add_event_page_row_section_div}>
                  <div className={s.add_event_page_element_type_2}>
                    <Select
                      id="place_name"
                      label=""
                      indexSelected={selectedIndex}
                      onSelectClicked={handleSelectedPlaceIndex}
                      options={namesList}
                    />
                  </div>
                  <div className={s.add_event_page_element_type_2}>
                    <MultilineInput
                      id="place_description"
                      label=""
                      value={
                        places[selectedIndex].address +
                        "\n" +
                        places[selectedIndex].description
                      }
                      readOnly
                      rows={6}
                      cols={40}
                    />
                  </div>
                </div>
              </div>
              <PositiveButton
                text="Подать заявку"
                onClick={submit}
                style={{ width: "100%", margin: "1rem 0" }}
              />
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

export default AddEventPage;
