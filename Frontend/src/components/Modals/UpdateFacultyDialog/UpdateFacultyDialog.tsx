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
import s from "./UpdateFacultyDialog.module.css";
import { Faculty } from "../../../services/apiModels";
import { getFaculty, updateFaculty } from "../../../services/api";
import axios from "axios";

export interface UpdateFacultyDialogProps {
  onUpdated: (f: Faculty) => void;
}

export type UpdateFacultyDialogRef = {
  show: (faculty: Faculty) => void;
  close: () => void;
};

const UpdateFacultyDialog = forwardRef<
  UpdateFacultyDialogRef,
  UpdateFacultyDialogProps
>(({ onUpdated }, forwardRef) => {
  const [degrees] = useState<Array<string>>(["Бакалавриат", "Магистратура"]);

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [obtainedFaculty, setObtainedFaculty] = useState<Faculty | null>(null);

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
      setFaculty(() => {
        return null;
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
    show: async (f: Faculty) => {
      setFaculty(() => {
        return f;
      });

      setObtainedFaculty(() => {
        return f;
      });

      if (f) {
        setName(() => {
          return f.name;
        });
        setGroupPrefix(() => {
          return f.group_prefix;
        });
        setSelected(() => {
          return f.bachelor_degree ? 0 : 1;
        });
      } else {
        setNameError("Ошибка при получении данных. Попробуйте повторить");
      }

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

    if (!faculty) {
      setNameError("Неизвестная ошибка. Попробуйте снова");
      return;
    }

    const changedFaculty: Faculty = {
      id: faculty?.id,
      name: name,
      group_prefix: groupPrefix,
      bachelor_degree: selected == 0,
    };

    let sameError: boolean = false;

    if (
      obtainedFaculty?.bachelor_degree == changedFaculty.bachelor_degree &&
      obtainedFaculty?.group_prefix == changedFaculty.group_prefix &&
      obtainedFaculty.name == changedFaculty.name
    ) {
      sameError = true;
      setNameError((prev) => {
        const e = "Вы ничего не изменили";
        return e;
      });
    }

    if (nameError.length > 0 || groupPrefixError.length > 0 || sameError) {
      return;
    }

    try {
      if (faculty) {
        const updatedFaculty = await updateFaculty(changedFaculty);

        onUpdated(updatedFaculty);

        close();
      }
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
    setFaculty(() => {
      return null;
    });
    modalRef.current?.close();
  };

  return (
    <>
      <dialog
        id="updateFacultyMenu"
        ref={modalRef}
        className={s.modal_window_container}
      >
        <header className={s.modal_window_header}>
          <p className={s.default_text}>Изменить факультет</p>
        </header>
        <div>
          <Input
            id="faculty_name"
            label="Название факультета"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <p className={s.error_default_text}>{nameError}</p>
          <Input
            id="faculty_group_prefix"
            label="Префикс групп факультета"
            onChange={(e) => setGroupPrefix(e.target.value.toUpperCase())}
            value={groupPrefix}
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
          <PositiveButton text="Изменить" type="submit" />
          <NegativeButton text="Закрыть" type="button" onClick={close} />
        </form>
      </dialog>
    </>
  );
});

export default UpdateFacultyDialog;
