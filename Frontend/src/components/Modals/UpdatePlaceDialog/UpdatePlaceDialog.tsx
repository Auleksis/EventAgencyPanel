import {
  FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Place, PlaceShort } from "../../../services/apiModels";
import s from "./UpdatePlaceDialog.module.css";
import { NegativeButton, PositiveButton } from "../../Button/ActionButtons";
import Input from "../../Input/Input";
import MultilineInput from "../../MultilineInput/MultilineInput";
import { addPlace, getPlace, updatePlace } from "../../../services/api";

export interface UpdatePlaceDialogProps {
  onUpdated: (place: Place) => void;
}

export type UpdatePlaceDialogRef = {
  show: (place: PlaceShort, readOnly: boolean) => void;
  close: () => void;
};

const UpdatePlaceDialog = forwardRef<
  UpdatePlaceDialogRef,
  UpdatePlaceDialogProps
>(({ onUpdated }, forwardRef) => {
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [id, setID] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [nameError, setNameError] = useState<string>("");
  const [adrressError, setAddressError] = useState<string>("");
  const [capacityError, setCapacityError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");

  const modalRef = useRef<HTMLDialogElement>(null);

  const resetDialog = () => {
    setName("");
    setAddress("");
    setDescription("");
    setCapacity("");

    setNameError("");
    setAddressError("");
    setCapacityError("");
    setCapacityError("");
  };

  useEffect(() => {
    return () => {
      resetDialog();
    };
  }, []);

  useImperativeHandle(forwardRef, () => ({
    close: () => {
      resetDialog();
      modalRef.current?.close();
    },
    show: (place: PlaceShort, readOnly: boolean) => {
      modalRef.current?.showModal();

      setID(place.id);
      setAddress(place.address);
      setName(place.name);
      setCapacity(place.capacity.toString());
      setReadOnly(readOnly);

      const fetch = async () => {
        const p = await getPlace(place.id);
        setDescription(p.description);
      };

      fetch();
    },
  }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setNameError("");
    setAddressError("");
    setCapacityError("");
    setDescriptionError("");

    if (name.trim().length == 0) {
      setNameError("Введите название");
    }

    if (address.trim().length == 0) {
      setAddress("Укажите адрес");
    }

    let capacityNumber = 0;

    if (capacity.trim().length == 0) {
      setCapacityError("Укажите вместимость");
    }

    capacityNumber = Number.parseInt(capacity);

    if (Number.isNaN(capacityNumber)) {
      setCapacityError("Вместимость должна быть положительным числом");
    }

    if (capacityNumber <= 0) {
      setCapacityError("Вместимость должна быть положительным числом");
    }

    if (
      capacityError.length == 0 &&
      adrressError.length == 0 &&
      nameError.length == 0 &&
      descriptionError.length == 0
    ) {
      try {
        const place = {
          id: id,
          name: name,
          address: address,
          description: description,
          capacity: capacityNumber,
        };

        const addedPlace = await updatePlace(place);

        onUpdated(addedPlace);
        close();
      } catch (e) {}
    }
  };

  const close = () => {
    resetDialog();
    modalRef.current?.close();
  };

  return (
    <>
      <dialog
        id="addPlaceMenu"
        ref={modalRef}
        className={s.modal_window_container}
      >
        <div className={s.modal_window_header}>
          <p className={s.default_text}>Данные о площадке</p>
        </div>
        <div className={s.page_form_input_container}>
          <div className={s.page_form_input_with_error_container}>
            <Input
              id="name_add"
              label="Название"
              type="text"
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              value={name}
              required
            />
            <p className={s.error_default_text}>{nameError}</p>
          </div>
          <div className={s.page_form_input_with_error_container}>
            <Input
              id="address_add"
              label="Адрес"
              type="text"
              onChange={(e) => {
                setAddress(e.target.value);
                setAddressError("");
              }}
              value={address}
              required
            />
            <p className={s.error_default_text}>{adrressError}</p>
          </div>
          <div className={s.page_form_input_with_error_container}>
            <Input
              id="capacity_add"
              label="Вместимость"
              type="text"
              onChange={(e) => {
                setCapacity(e.target.value);
                setCapacityError("");
              }}
              value={capacity}
              required
            />
            <p className={s.error_default_text}>{capacityError}</p>
          </div>
          <div className={s.page_form_input_with_error_container}>
            <MultilineInput
              id="description_add"
              label="Описание"
              rows={5}
              cols={40}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError("");
              }}
              value={description}
              required
            />
            <p className={s.error_default_text}>{descriptionError}</p>
          </div>
        </div>
        <form
          method="dialog"
          className={s.modal_window_buttons_container}
          onSubmit={onSubmit}
        >
          {!readOnly && <PositiveButton text="Изменить" type="submit" />}
          <NegativeButton text="Закрыть" type="button" onClick={close} />
        </form>
      </dialog>
    </>
  );
});

export default UpdatePlaceDialog;
