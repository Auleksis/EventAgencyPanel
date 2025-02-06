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
import s from "./PlacesPage.module.css";
import { Place, PlaceShort, User } from "../../services/apiModels";
import AddUserDialog, {
  AddUserDialogRef,
} from "../../components/Modals/AddUserDialog/AddUserDialog";
import {
  deletePlace,
  deleteUser,
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

const PlacesPage = () => {
  const user = useSelector((state: RootState) => state.user);

  const [places, setPlaces] = useState<Array<PlaceShort>>([]);
  const [placesCount, setPlacesCount] = useState<number>(0);

  const addPlaceDialogRef = useRef<AddPlaceDialogRef>(null);
  const updatePlaceDialogRef = useRef<UpdatePlaceDialogRef>(null);
  const deletePlaceDialogRef = useRef<AcceptActionDialogRef>(null);

  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [limits] = useState<Array<number>>([5, 10, 20, 40]);
  const [selectedLimitIndex, setSelectedLimitIndex] = useState<number>(0);

  const fetchPlaces = async (p: number = 0) => {
    setPage(p);

    const parseValue = (value: string) => {
      if (value.length == 0) {
        return undefined;
      }
      return value;
    };

    try {
      const capacityNumber = Number.parseInt(capacity);

      const result = await getPlaces({
        skip: p * limit,
        limit: limit,
        name: parseValue(name),
        address: parseValue(address),
        capacity: Number.isNaN(capacityNumber) ? undefined : capacityNumber,
      });

      setPlaces(result.places);
      setPlacesCount(result.count);
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
  }, [name, address, capacity]);

  interface PlaceRowProps {
    place: PlaceShort;
  }
  const PlaceRow: React.FunctionComponent<PlaceRowProps> = (
    props: PlaceRowProps
  ) => {
    return (
      <tr className={s.page_table_row_container}>
        <td
          className={s.main_page_table_row_text_cell}
          style={{ width: "25rem" }}
        >
          <p className={s.subtext}>{props.place.name}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.place.address}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.place.capacity}</p>
        </td>

        <td className={s.main_page_table_row_non_text_cell_container}>
          <div className={s.main_page_table_row_non_text_cell}>
            {(user.role == "db admin" || user.role == "admin") && (
              <PositiveButton
                text="Изменить"
                onClick={() =>
                  updatePlaceDialogRef.current?.show(props.place, false)
                }
              />
            )}

            <PositiveButton
              text="Подробнее"
              onClick={() =>
                updatePlaceDialogRef.current?.show(props.place, true)
              }
            />

            {(user.role == "db admin" || user.role == "admin") && (
              <NegativeButton
                text="Удалить"
                onClick={() =>
                  deletePlaceDialogRef.current?.show((id: string) => {
                    handleDeletePlace(id);
                  }, props.place.id)
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

    if (placesCount <= limit * p) {
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
    setName("");
    setAddress("");
    setCapacity("");
  };

  return (
    <div className={s.main_page_container}>
      <div className={s.page_title_container}>
        <p className={s.title} style={{ fontWeight: "bold" }}>
          ПАНЕЛЬ УПРАВЛЕНИЯ ПЛОЩАДКАМИ
        </p>
      </div>
      <div className={s.main_page_section_container}>
        <div className={s.users_page_management_container}>
          {(user.role == "db admin" || user.role == "admin") && (
            <div className={s.users_page_card_container}>
              <Card
                title="Добавить площадку"
                description="Заполните данные о новой площадке и добавьте её в систему."
                positive
              >
                <Button
                  text="Добавить"
                  onClick={() => {
                    addPlaceDialogRef.current?.show();
                  }}
                />
              </Card>
            </div>
          )}
        </div>

        <AddPlaceDialog ref={addPlaceDialogRef} onAdded={handleAddingPlace} />
        <UpdatePlaceDialog
          ref={updatePlaceDialogRef}
          onUpdated={handleUpdatingPlace}
        />
        <AcceptActionDialog ref={deletePlaceDialogRef} text="" />
      </div>
      <div className={s.main_page_section_container}>
        <div className={s.page_title_container}>
          <p className={s.subtitle}>СПИСОК ПЛОЩАДОК</p>
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
                <p className={s.subtext}>Адрес</p>
              </th>
              <th>
                <p className={s.subtext}>Вместимость</p>
              </th>
              <th>
                <p className={s.subtext}>Действия</p>
              </th>
            </tr>
            <tr>
              <th>
                <Input
                  id="name_search"
                  label=""
                  placeholder="Фильтровать по названию"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </th>
              <th>
                <Input
                  id="address_search"
                  label=""
                  placeholder="Фильтровать по адресу"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                  }}
                />
              </th>
              <th>
                <Input
                  id="capacity_search"
                  label=""
                  placeholder="Фильтровать по вместимости"
                  value={capacity}
                  onChange={(e) => {
                    setCapacity(e.target.value);
                  }}
                />
              </th>
              <th>
                <NegativeButton text="Сбросить фильтры" onClick={clearFilter} />
              </th>
            </tr>
          </thead>
          <tbody>
            {places.map((value) => (
              <PlaceRow place={value} key={value.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlacesPage;
