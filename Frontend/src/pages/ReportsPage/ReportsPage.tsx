import { useNavigate, useParams } from "react-router-dom";
import s from "./ReportsPage.module.css";
import {
  PositiveButton,
  NegativeButton,
} from "../../components/Button/ActionButtons";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Report, User } from "../../services/apiModels";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AcceptActionDialog, {
  AcceptActionDialogRef,
} from "../../components/Modals/AcceptActionDialog/AcceptActionDialog";
import {
  addInvite,
  addReport,
  deleteUser,
  getReports,
  getUsers,
  removeInvite,
  removeReport,
} from "../../services/api";
import Button from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { AxiosError } from "axios";

const ReportsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user);

  const [reports, setReports] = useState<Array<Report>>([]);

  const deleteUserDialogRef = useRef<AcceptActionDialogRef>(null);

  const [types] = useState<Array<string>>(["Доходы", "Расходы"]);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<number>(0);
  const [value, setValue] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [error, setError] = useState<string>("");

  const fetchReports = async (p: number = 0) => {
    if (!id) {
      return;
    }
    try {
      const fetched = await getReports(id);
      setReports(fetched);
    } catch (e) {}
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteReport = async (reportID: string) => {
    if (id) {
      await removeReport(id, reportID);
      await fetchReports();
    }
  };

  const handleAddReport = async () => {
    setError("");

    const valueNum = Number.parseFloat(value);
    if (Number.isNaN(valueNum)) {
      setError("Величина должна быть числом");
      return;
    }

    if (valueNum <= 0) {
      setError("Величина должна быть числом, большим 0");
      return;
    }

    if (id) {
      try {
        await addReport({
          event_id: id,
          description: description,
          type: types[selectedTypeIndex],
          value: valueNum,
        });
        await fetchReports(0);
      } catch (e) {
        const er = e as AxiosError;
      }
    }
  };

  interface ReportRowProps {
    report: Report;
  }
  const ReportRow: React.FunctionComponent<ReportRowProps> = (
    props: ReportRowProps
  ) => {
    return (
      <tr className={s.page_table_row_container}>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.report.type}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.report.value}</p>
        </td>
        <td className={s.main_page_table_row_text_cell}>
          <p className={s.subtext}>{props.report.description}</p>
        </td>

        <td className={s.main_page_table_row_non_text_cell_container}>
          <div className={s.main_page_table_row_non_text_cell}>
            <NegativeButton
              text="Удалить"
              onClick={() =>
                deleteUserDialogRef.current?.show((id: string) => {
                  handleDeleteReport(id);
                }, props.report.id ?? "")
              }
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={s.main_page_container}>
      <div className={s.page_title_container}>
        <p className={s.subtitle}>ОТЧЁТЫ</p>
      </div>

      <div className={s.invite_page_invite_box}>
        <NegativeButton
          text="Вернуться назад"
          onClick={() => {
            navigate("/events");
          }}
          style={{ width: "50%", margin: "1rem 0" }}
        />
      </div>

      <div className={s.reports_page_box}>
        <div className={s.invite_page_invite_box_container}>
          <Select
            id="type"
            label="Выберите тип"
            onSelectClicked={(index: number) => {
              setSelectedTypeIndex(index);
            }}
            indexSelected={selectedTypeIndex}
            options={types}
          />
          <Input
            id="value"
            label="Величина"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
          <Input
            id="description"
            label="Описание"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
          <PositiveButton text="Добавить" onClick={handleAddReport} />
          <p className={s.error_default_text}>{error}</p>
        </div>
      </div>

      <AcceptActionDialog ref={deleteUserDialogRef} text="" />
      <table className={s.users_page_table}>
        <thead>
          <tr>
            <th>
              <p className={s.subtext}>Тип</p>
            </th>
            <th>
              <p className={s.subtext}>Величина</p>
            </th>
            <th>
              <p className={s.subtext}>Описание</p>
            </th>
            <th>
              <p className={s.subtext}>Действия</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((value) => (
            <ReportRow report={value} key={value.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsPage;
