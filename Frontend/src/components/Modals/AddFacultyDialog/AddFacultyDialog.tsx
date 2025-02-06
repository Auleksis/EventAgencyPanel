import {
  FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PositiveButton, NegativeButton } from "../../Button/ActionButtons";
import Input from "../../Input/Input";
import Select from "../../Select/Select";
import s from "./AddFacultyDialog.module.css";
import { Faculty } from "../../../services/apiModels";
import { addFaculty } from "../../../services/api";
import axios from "axios";

export interface AddFacultyDialogProps {
  onAdded: (faculty: Faculty) => void;
}

export type AddFacultyDialogRef = {
  show: () => void;
  close: () => void;
};

const AddFacultyDialog = forwardRef<AddFacultyDialogRef, AddFacultyDialogProps>(
  ({ onAdded }, forwardRef) => {
    const [degrees] = useState<Array<string>>(["Бакалавриат", "Магистратура"]);

    const [selected, setSelected] = useState<number>(0);
    const [name, setName] = useState<string>("");
    const [groupPrefix, setGroupPrefix] = useState<string>("");

    const [nameError, setNameError] = useState<string>("");
    const [groupPrefixError, setGroupPrefixError] = useState<string>("");

    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
      return () => {
        setName(() => {
          return "";
        });
        setNameError(() => {
          return "";
        });
        setGroupPrefix(() => {
          return "";
        });
        setGroupPrefixError(() => {
          return "";
        });
        setSelected(() => {
          return 0;
        });
      };
    }, []);

    useEffect(() => {
      setGroupPrefixError("");
      setNameError("");
    }, [groupPrefix]);

    useEffect(() => {
      setNameError("");
      setGroupPrefixError("");
    }, [name]);

    useImperativeHandle(forwardRef, () => ({
      close: () => {
        modalRef.current?.close();
      },
      show: () => {
        modalRef.current?.showModal();
      },
    }));

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (name.length == 0) {
        setNameError("Укажите название факультета");
      }

      if (groupPrefix.length == 0) {
        setGroupPrefixError("Укажите префикс групп факультета");
      }

      if (nameError.length > 0 || groupPrefixError.length > 0) {
        return;
      }

      try {
        const faculty = await addFaculty({
          name: name,
          bachelor_degree: selected == 0,
          group_prefix: groupPrefix,
        });

        onAdded(faculty);

        close();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.status == 409) {
            setNameError(
              "Факультет с таким названием уже существует для выбранной степени"
            );
          }
        }
      }
    };

    const close = () => {
      setName(() => {
        return "";
      });
      setNameError(() => {
        return "";
      });
      setGroupPrefix(() => {
        return "";
      });
      setGroupPrefixError(() => {
        return "";
      });
      setSelected(() => {
        return 0;
      });
      modalRef.current?.close();
    };

    return (
      <>
        <dialog
          id="addFacultyMenu"
          ref={modalRef}
          className={s.modal_window_container}
        >
          <header className={s.modal_window_header}>
            <p className={s.default_text}>Добавить факультет</p>
          </header>
          <div>
            <Input
              id="faculty_name"
              label="Название факультета"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="ФБИТ"
            />
            <p className={s.error_default_text}>{nameError}</p>
            <Input
              id="faculty_group_prefix"
              label="Префикс групп факультета"
              onChange={(e) => setGroupPrefix(e.target.value.toUpperCase())}
              value={groupPrefix}
              placeholder="N"
            />
            <p className={s.error_default_text}>{groupPrefixError}</p>
            <Select
              id="degreeSelect"
              label="Степень"
              options={degrees}
              indexSelected={selected}
              onSelectClicked={(index) => {
                setSelected(index);
              }}
            />
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

export default AddFacultyDialog;
