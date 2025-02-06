import {
  FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Place } from "../../../services/apiModels";
import s from "./AddPlaceDialog.module.css";
import { NegativeButton, PositiveButton } from "../../Button/ActionButtons";
import Input from "../../Input/Input";
import MultilineInput from "../../MultilineInput/MultilineInput";
import { addPlace } from "../../../services/api";

export interface AddPlaceDialogProps {
  onAdded: (place: Place) => void;
}

export type AddPlaceDialogRef = {
  show: () => void;
  close: () => void;
};

const AddPlaceDialog = forwardRef<AddPlaceDialogRef, AddPlaceDialogProps>(
  ({ onAdded }, forwardRef) => {
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
      show: () => {
        modalRef.current?.showModal();
        resetDialog();
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
            name: name,
            address: address,
            description: description,
            capacity: capacityNumber,
          };

          const addedPlace = await addPlace(place);

          onAdded(addedPlace);
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
            <p className={s.default_text}>Добавить площадку</p>
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
            <PositiveButton text="Добавить" type="submit" />
            <NegativeButton text="Закрыть" type="button" onClick={close} />
          </form>
        </dialog>
      </>
    );
  }
);

export default AddPlaceDialog;
