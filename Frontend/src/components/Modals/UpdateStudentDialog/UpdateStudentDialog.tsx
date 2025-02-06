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
import s from "./UpdateStudentDialog.module.css";
import {
  Faculty,
  Student,
  UpdateStudentRequest,
} from "../../../services/apiModels";
import {
  addFaculty,
  addStudent,
  getCurrentYear,
  getFaculties,
  getFacultiesCount,
  updateStudent,
} from "../../../services/api";
import axios from "axios";
import HintedSearchLine from "../../HintedSearchLine/HintedSearchLine";

export interface UpdateStudentDialogProps {
  onUpdated: (s: Student) => void;
}

export type UpdateStudentDialogRef = {
  show: (student: Student) => void;
  close: () => void;
};

const UpdateStudentDialog = forwardRef<
  UpdateStudentDialogRef,
  UpdateStudentDialogProps
>(({ onUpdated }, forwardRef) => {
  const [obtainedStudent, setObtainedStudent] = useState<Student>();

  const [degrees] = useState<Array<string>>(["Бакалавриат", "Магистратура"]);
  const [grades] = useState<Array<string>>(["Учится", "Окончил"]);
  const [bachelor_years] = useState<Array<number>>([1, 2, 3, 4]);
  const [master_years] = useState<Array<number>>([1, 2]);

  const [selected, setSelected] = useState<number>(0);
  const [selectedGraduated, setSelectedGraduated] = useState<number>(0);

  const [name, setName] = useState<string>("");
  const [year, setYear] = useState<number>(1);
  const [group, setGroup] = useState<string>("");
  const [faculty, setFaculty] = useState<string>();
  const [bachelor, setBachelor] = useState<boolean>(true);
  const [graduation_year, set_graduation_year] = useState<string>("");

  const [availablePrefixes, setAvailablePrefixes] = useState<Array<string>>([]);
  const [groupPrefix, setGroupPrefix] = useState<string>("");

  const [nameError, setNameError] = useState<string>("");
  const [groupError, setGroupError] = useState<string>("");
  const [facultyError, setFacultyError] = useState<string>("");
  const [graduation_year_error, set_graduation_year_error] =
    useState<string>("");

  const modalRef = useRef<HTMLDialogElement>(null);

  const setGraduationYear = async () => {
    const currentYear = await getCurrentYear();
    if (bachelor) {
      set_graduation_year(`${currentYear + 4 - (year - 1)}`);
    } else {
      set_graduation_year(`${currentYear + 2 - (year - 1)}`);
    }
  };

  useEffect(() => {
    setGraduationYear();
  }, [bachelor, year, selectedGraduated]);

  useEffect(() => {
    setGraduationYear();

    return () => {
      setName("");
      setNameError("");
      setGroup("");
      setGroupError("");
      setSelected(0);
      setSelected(0);
      setYear(1);
      setFaculty("");
      setFacultyError("");
      setBachelor(true);
      set_graduation_year_error("");
    };
  }, []);

  useEffect(() => {
    setNameError("");
  }, [name]);

  useEffect(() => {
    setGroupError("");
    setNameError("");

    if (!group.startsWith(groupPrefix)) {
      setGroup(groupPrefix);
    }
  }, [group]);

  useEffect(() => {
    setFacultyError("");
    setNameError("");
  }, [faculty]);

  useEffect(() => {
    set_graduation_year_error("");
  }, [graduation_year_error]);

  useImperativeHandle(forwardRef, () => ({
    close: () => {
      modalRef.current?.close();
    },
    show: (student: Student) => {
      setObtainedStudent(student);

      if (student) {
        setName(student.full_name);
        if (student.year) {
          setYear(student.year);
        }

        if (student.group) {
          setGroup(student.group);
        }

        setSelected(student.bachelor ? 0 : 1);

        setBachelor(student.bachelor);

        if (student.faculty) {
          setFaculty(student.faculty);
        }

        setSelectedGraduated(student.graduated ? 1 : 0);

        set_graduation_year(`${student.graduation_year}`);
      }
      modalRef.current?.showModal();
    },
  }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!obtainedStudent) {
      setNameError("Неизвестная ошибка. Попробуйте снова");
      return;
    }

    if (name.length == 0) {
      setNameError("Укажите ФИО студента");
    }

    if (graduation_year.length == 0) {
      set_graduation_year_error("Укажите год окончания университета");
    }

    const parsed = Number.parseInt(graduation_year);
    if (Number.isNaN(parsed)) {
      set_graduation_year_error("Укажите год окончания университета");
    }

    const currentYear = await getCurrentYear();
    if (parsed > currentYear) {
      set_graduation_year_error("Год окончания должен быть в прошлом");
    }

    if (group.length == 0 && selectedGraduated == 0) {
      setGroupError("Укажите группу");
    }

    if (
      nameError.length > 0 ||
      groupError.length > 0 ||
      graduation_year_error.length > 0
    ) {
      console.log(nameError);
      console.log(groupError);
      console.log(graduation_year_error);
      return;
    }

    const student: Student = {
      id: obtainedStudent?.id,
      full_name: name,
      year: selectedGraduated == 0 ? year : undefined,
      group: selectedGraduated == 0 ? group : undefined,
      faculty: selectedGraduated == 0 ? faculty : undefined,
      graduated: selectedGraduated == 1,
      bachelor: bachelor,
      graduation_year: parsed,
    };

    if (
      student.full_name == obtainedStudent?.full_name &&
      student.year == obtainedStudent.year &&
      student.group == obtainedStudent.group &&
      student.faculty == obtainedStudent.faculty &&
      student.graduated == obtainedStudent.graduated &&
      student.bachelor == obtainedStudent.bachelor &&
      student.graduation_year == obtainedStudent.graduation_year
    ) {
      setNameError("Вы ничего не изменили");
      return;
    }

    if (faculty || student.graduated) {
      try {
        const updatedStudent = await updateStudent(
          student as UpdateStudentRequest
        );

        onUpdated(updatedStudent);

        close();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.status == 431) {
            setGroupError(
              "Префикс группы должкн соответствовать определённому факультетом"
            );
          } else if (err.status == 432) {
            setFacultyError("Данный факультет не существует");
          }
        }
      }
    } else {
      setFacultyError("Выберите факультет");
    }
  };

  const close = () => {
    setName("");
    setNameError("");
    setGroup("");
    setGroupError("");
    setSelected(0);
    setSelected(0);
    setYear(1);
    setFaculty("");
    setFacultyError("");
    setBachelor(true);
    set_graduation_year_error("");
    modalRef.current?.close();
  };

  const handleFacultySearch = async (value: string): Promise<Array<string>> => {
    const fCount = await getFacultiesCount();
    const faculties = await getFaculties(0, fCount.count, value);

    let options: Array<string> = [];
    let prefixes: Array<string> = [];
    faculties.forEach((value) => {
      options.push(
        `${value.name} (${
          value.bachelor_degree ? "бакалавриат" : "магистратура"
        })`
      );
      prefixes.push(value.group_prefix);
    });
    setAvailablePrefixes(prefixes);

    return options;
  };

  const handleHintSelected = (value: string, index: number) => {
    const faculty_params = value.split(" ");
    setFaculty(faculty_params[0]);

    setGroupPrefix(availablePrefixes[index]);

    setGroup(availablePrefixes[index]);
  };

  const handleFinishYearChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;

    if (/^\d*$/.test(inputValue)) {
      set_graduation_year(inputValue);
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (!faculty || faculty.length == 0) {
      setGroupError("Выберите факультет перед указанием группы");
      return;
    }

    setGroup(inputValue);
  };

  return (
    <>
      <dialog
        id="addFacultyMenu"
        ref={modalRef}
        className={s.modal_window_container}
      >
        <header className={s.modal_window_header}>
          <p className={s.default_text}>Добавить студента</p>
        </header>
        <div>
          <Input
            id="username"
            label="ФИО"
            onChange={(e) => setName(e.target.value)}
            value={name ?? ""}
          />
          <p className={s.error_default_text}>{nameError}</p>

          <Select
            id="degreeSelect"
            label="Статус"
            options={grades}
            indexSelected={selectedGraduated}
            onSelectClicked={(index) => {
              setSelectedGraduated(index);
            }}
          />

          <Select
            id="gradeSelect"
            label="Степень"
            options={degrees}
            indexSelected={selected}
            onSelectClicked={(index) => {
              setSelected(index);
              setBachelor(index == 0);
              setFaculty("");
            }}
          />
          {selectedGraduated == 0 && (
            <>
              <Select
                id="year"
                label="Курс обучения"
                options={bachelor ? bachelor_years : master_years}
                indexSelected={year ? year - 1 : 0}
                onSelectClicked={(index) => {
                  setYear(
                    bachelor ? bachelor_years[index] : master_years[index]
                  );
                }}
              />

              <div>
                <label className={s.default_text}>Факультет</label>
                <HintedSearchLine
                  value={
                    faculty
                      ? `${faculty} (${
                          bachelor ? "бакалавриат" : "магистратура"
                        })`
                      : ""
                  }
                  onItemSelected={handleHintSelected}
                  fetchFunction={handleFacultySearch}
                />
                <p className={s.error_default_text}>{facultyError}</p>
              </div>

              <Input
                id="group"
                label="Группа"
                onChange={handleGroupChange}
                value={group ?? ""}
              />
              <p className={s.error_default_text}>{groupError}</p>
            </>
          )}

          <Input
            id="finishYear"
            label="Год окончания"
            readOnly={selectedGraduated == 0}
            value={graduation_year}
            onChange={handleFinishYearChange}
          />
          <p className={s.error_default_text}>{graduation_year_error}</p>
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

export default UpdateStudentDialog;
