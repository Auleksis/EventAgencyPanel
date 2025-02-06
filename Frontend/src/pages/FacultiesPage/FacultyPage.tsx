import s from "./FacultiesPage.module.css";
// import { useEffect, useRef, useState } from "react";
// import {
//   addFaculty,
//   deleteFaculty,
//   getCurrentYear,
//   getFaculties,
//   getFacultiesCount,
//   getStudents,
// } from "../../services/api";
// import { Card } from "../../components/Card/Card";
// import Button from "../../components/Button/Button";
// import { AddFacultyRequest, Faculty, Student } from "../../services/apiModels";
// import {
//   NegativeButton,
//   PositiveButton,
// } from "../../components/Button/ActionButtons";
// import Input from "../../components/Input/Input";
// import Select from "../../components/Select/Select";
// import AddFacultyDialog, {
//   AddFacultyDialogRef,
// } from "../../components/Modals/AddFacultyDialog/AddFacultyDialog";
// import UpdateFacultyDialog, {
//   UpdateFacultyDialogRef,
// } from "../../components/Modals/UpdateFacultyDialog/UpdateFacultyDialog";
// import AcceptActionDialog, {
//   AcceptActionDialogRef,
// } from "../../components/Modals/AcceptActionDialog/AcceptActionDialog";
// import SearchLine, {
//   SearchField,
// } from "../../components/SearchLine/SearchLine";
// import { isAxiosError } from "axios";

export const FacultiesPage = () => {
  //   const [faculties, setFaculties] = useState<Array<Faculty>>([]);

  //   const addFacultyDialogRef = useRef<AddFacultyDialogRef>(null);
  //   const updateFacultyDialogRef = useRef<UpdateFacultyDialogRef>(null);
  //   const deleteFacultyDialogRef = useRef<AcceptActionDialogRef>(null);

  //   const inputFileRef = useRef<HTMLInputElement>(null);

  //   const [searchFields] = useState<Array<SearchField>>([
  //     { fieldName: "Название", fieldOptions: undefined },
  //     { fieldName: "Префикс групп", fieldOptions: undefined },
  //     { fieldName: "Степень", fieldOptions: ["Бакалавриат", "Магистратура"] },
  //   ]);

  //   const [field_index, set_field_index] = useState<number>(0);
  //   const [value, set_value] = useState<string>("");

  //   const [page, setPage] = useState<number>(0);
  //   const [limit, setLimit] = useState<number>(5);

  //   const [limits] = useState<Array<number>>([5, 10, 20, 40]);
  //   const [selectedLimitIndex, setSelectedLimitIndex] = useState<number>(0);

  //   const [message, setMessage] = useState<string>("");
  //   const [isMessageError, setIsMessageError] = useState<boolean>(false);

  //   const fetchFaculties = async (p: number = 0) => {
  //     setPage(p);

  //     let result: Array<Faculty> = [];
  //     if (value.length == 0) {
  //       result = await getFaculties(p, limit);
  //     } else {
  //       switch (field_index) {
  //         case 0:
  //           result = await getFaculties(p, limit, value);
  //           break;
  //         case 1:
  //           result = await getFaculties(p, limit, undefined, value);
  //           break;
  //         case 2:
  //           result = await getFaculties(
  //             p,
  //             limit,
  //             undefined,
  //             undefined,
  //             value == "Бакалавриат"
  //           );
  //           break;
  //       }
  //     }

  //     setFaculties(() => {
  //       return result;
  //     });
  //   };

  //   const onLoad = async () => {
  //     await fetchFaculties();
  //   };

  //   useEffect(() => {
  //     onLoad();
  //   }, []);

  //   useEffect(() => {
  //     fetchFaculties();
  //   }, [limit]);

  //   useEffect(() => {
  //     fetchFaculties();
  //   }, [field_index]);

  //   interface FacultyRowProps {
  //     faculty: Faculty;
  //   }

  //   const FacultyRow: React.FunctionComponent<FacultyRowProps> = (
  //     props: FacultyRowProps
  //   ) => {
  //     return (
  //       <tr>
  //         <td
  //           className={s.main_page_table_row_text_cell}
  //           style={{ width: "25rem" }}
  //         >
  //           <p className={s.subtext}>{props.faculty.name}</p>
  //         </td>
  //         <td className={s.main_page_table_row_text_cell}>
  //           <p className={s.subtext}>{props.faculty.group_prefix}</p>
  //         </td>
  //         <td className={s.main_page_table_row_text_cell}>
  //           <p className={s.subtext}>
  //             {props.faculty.bachelor_degree ? "Бакалавриат" : "Магистратура"}
  //           </p>
  //         </td>
  //         <td
  //           className={s.main_page_table_row_non_text_cell_container}
  //           style={{ width: "20rem" }}
  //         >
  //           <div className={s.main_page_table_row_non_text_cell}>
  //             <PositiveButton
  //               text="Изменить"
  //               onClick={() =>
  //                 updateFacultyDialogRef.current?.show(props.faculty)
  //               }
  //             />
  //             <NegativeButton
  //               text="Удалить"
  //               onClick={() =>
  //                 deleteFacultyDialogRef.current?.show((id: string) => {
  //                   handleDeleteFaculty(id);
  //                 }, props.faculty.id)
  //               }
  //             />
  //           </div>
  //         </td>
  //       </tr>
  //     );
  //   };

  //   interface MessageProps {
  //     text: string;
  //     isError: boolean;
  //   }

  //   const Message: React.FunctionComponent<MessageProps> = ({
  //     text,
  //     isError,
  //   }) => {
  //     const [message, setMessage] = useState<string>(text);
  //     useEffect(() => {
  //       setTimeout(() => {
  //         setMessage("");
  //       }, 3000);
  //     }, []);

  //     return (
  //       <>
  //         {message && (
  //           <div
  //             className={
  //               isError ? s.error_message_container : s.message_container
  //             }
  //           >
  //             <p className={s.default_text}>
  //               {isError ? "Ошибка!" : "Сообщение"}
  //             </p>
  //             <p className={s.subtext}>{message}</p>
  //           </div>
  //         )}
  //       </>
  //     );
  //   };

  //   const handleDownloadJSON = async () => {
  //     const limit = await getFacultiesCount();
  //     const faculties = await getFaculties(0, limit.count);

  //     const json = JSON.stringify(faculties, null, 2);
  //     const blob = new Blob([json], { type: "application/json" });

  //     const url = URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = "faculties.json";

  //     link.click();

  //     URL.revokeObjectURL(url);
  //   };

  //   const handleUploadJSON = async (
  //     event: React.ChangeEvent<HTMLInputElement>
  //   ) => {
  //     const file = event.target.files?.[0];

  //     console.log(file);
  //     if (!file) {
  //       setMessage("Не выбран файл");
  //       setIsMessageError(true);
  //       return;
  //     }

  //     if (file.type !== "application/json") {
  //       setMessage("Файл должен быть в формате JSON");
  //       setIsMessageError(true);
  //       return;
  //     }

  //     const reader = new FileReader();

  //     let data: Array<Faculty> = [];

  //     reader.onload = (e) => {
  //       try {
  //         const result = e.target?.result as string;
  //         const parsedData = JSON.parse(result) as Array<Faculty>;
  //         data = parsedData;

  //         console.log(data);

  //         setMessage("");
  //         setIsMessageError(false);
  //       } catch (err) {
  //         setMessage("Файл повреждён");
  //         setIsMessageError(true);
  //       }
  //     };

  //     reader.onerror = () => {
  //       setMessage("Ошибка при чтении файла");
  //       setIsMessageError(true);
  //     };

  //     reader.readAsText(file);

  //     for (let i = 0; i < data.length; i++) {
  //       const faculty = data[i];
  //       const facultyRequest: AddFacultyRequest = {
  //         name: faculty.name,
  //         bachelor_degree: faculty.bachelor_degree,
  //         group_prefix: faculty.group_prefix,
  //       };

  //       console.log(data[i]);

  //       try {
  //         await addFaculty(facultyRequest);
  //       } catch (err) {
  //         if (isAxiosError(err)) {
  //           if (err.status == 409) {
  //             console.log("ERROR 409");
  //             setMessage(`Факультет ${facultyRequest.name} уже существует`);
  //             setIsMessageError(true);
  //           }
  //         }
  //       }
  //     }
  //   };

  //   const handleAddingFaculty = (faculty: Faculty) => {
  //     fetchFaculties();
  //   };

  //   const handleUpdatingFaculty = (faculty: Faculty) => {
  //     fetchFaculties(page);
  //   };

  //   const handleDeleteFaculty = async (id: string) => {
  //     await deleteFaculty(id);
  //     await fetchFaculties();
  //   };

  //   const search = async (field_index: number, value: string) => {
  //     let result: Array<Faculty> = [];

  //     setPage(0);

  //     set_field_index(() => {
  //       return field_index;
  //     });

  //     set_value(() => {
  //       return value;
  //     });

  //     if (value.length == 0) {
  //       result = await getFaculties(page, limit);
  //     } else {
  //       switch (field_index) {
  //         case 0:
  //           result = await getFaculties(page, limit, value);
  //           break;
  //         case 1:
  //           result = await getFaculties(page, limit, undefined, value);
  //           break;
  //         case 2:
  //           result = await getFaculties(
  //             page,
  //             limit,
  //             undefined,
  //             undefined,
  //             value == "Бакалавриат"
  //           );
  //           break;
  //       }
  //     }

  //     setFaculties(() => {
  //       return result;
  //     });
  //   };

  //   const handleSearchFieldQuery = (field_index: number, value: string) => {
  //     search(field_index, value);
  //   };

  //   const onNextPage = async () => {
  //     let p = page + 1;
  //     let result: Array<Faculty> = [];
  //     if (value.length == 0) {
  //       result = await getFaculties(p, limit);
  //     } else {
  //       switch (field_index) {
  //         case 0:
  //           result = await getFaculties(p, limit, value);
  //           break;
  //         case 1:
  //           result = await getFaculties(p, limit, undefined, value);
  //           break;
  //         case 2:
  //           result = await getFaculties(
  //             p,
  //             limit,
  //             undefined,
  //             undefined,
  //             value == "Бакалавриат"
  //           );
  //           break;
  //       }
  //     }

  //     if (result.length == 0) {
  //       return;
  //     }

  //     setPage(page + 1);
  //     setFaculties(result);
  //   };

  //   const onPrevPage = async () => {
  //     if (page > 0) {
  //       let p = page - 1;

  //       let result: Array<Faculty> = [];
  //       if (value.length == 0) {
  //         result = await getFaculties(p, limit);
  //       } else {
  //         switch (field_index) {
  //           case 0:
  //             result = await getFaculties(p, limit, value);
  //             break;
  //           case 1:
  //             result = await getFaculties(p, limit, undefined, value);
  //             break;
  //           case 2:
  //             result = await getFaculties(
  //               p,
  //               limit,
  //               undefined,
  //               undefined,
  //               value == "Бакалавриат"
  //             );
  //             break;
  //         }
  //       }

  //       setPage(page - 1);
  //       setFaculties(result);
  //     }
  //   };

  //   return (
  //     <div className={s.main_page_container}>
  //       <Message text={message} isError={isMessageError} />
  //       <div className={s.page_title_container}>
  //         <p className={s.title} style={{ fontWeight: "bold" }}>
  //           ПАНЕЛЬ УПРАВЛЕНИЯ ФАКУЛЬТЕТАМИ
  //         </p>
  //       </div>

  //       <div className={s.main_page_section_container}>
  //         <div className={s.page_title_container}>
  //           <p className={s.subtitle}>ФАКУЛЬТЕТЫ</p>
  //         </div>

  //         <div className={s.main_page_student_management_container}>
  //           <Card
  //             title="Загрузить факультеты из файла"
  //             description="Выберите JSON-файл с описанием факультетов и добавьте факультеты в одно мгновение."
  //             positive
  //           >
  //             {/* <Button
  //               text="Загрузить"
  //               onClick={() => {
  //                 inputFileRef.current?.click();
  //               }}
  //             />
  //             <input
  //               ref={inputFileRef}
  //               type="file"
  //               hidden
  //               onChange={handleUploadJSON}
  //             /> */}
  //             <p className={s.subtext}>
  //               К сожалению, функция всё ещё в разработке
  //             </p>
  //           </Card>

  //           <Card
  //             title="Добавить факультет"
  //             description="Заполните данные о новом факультете и добавьте его в систему."
  //             positive
  //           >
  //             <Button
  //               text="Зарегистрировать"
  //               onClick={() => {
  //                 addFacultyDialogRef.current?.show();
  //               }}
  //             />
  //           </Card>

  //           <Card
  //             title="Выгрузить факультеты в файл"
  //             description="Сохраните данные о текущих факультетах в JSON-файл."
  //             positive
  //           >
  //             <Button text="Выгрузить" onClick={handleDownloadJSON} />
  //           </Card>
  //         </div>

  //         <AddFacultyDialog
  //           ref={addFacultyDialogRef}
  //           onAdded={handleAddingFaculty}
  //         />

  //         <UpdateFacultyDialog
  //           ref={updateFacultyDialogRef}
  //           onUpdated={handleUpdatingFaculty}
  //         />

  //         <AcceptActionDialog
  //           ref={deleteFacultyDialogRef}
  //           text="Удаление факультета приведёт к удалению всех студентов этого факультета."
  //         />
  //       </div>

  //       <div className={s.main_page_section_container}>
  //         <div className={s.page_title_container}>
  //           <p className={s.subtitle}>СПИСОК ФАКУЛЬТЕТОВ</p>
  //         </div>

  //         <SearchLine
  //           searchFields={searchFields}
  //           searchFunction={handleSearchFieldQuery}
  //         />

  //         <div className={s.search_page_middle_container}>
  //           <div className={s.search_page_switch_page_container}>
  //             <Button text="Предыдущая" onClick={onPrevPage} />
  //             <p className={s.default_text}>Страница {page + 1}</p>
  //             <Button text="Следующая" onClick={onNextPage} />
  //             <div className={s.search_limit_container}>
  //               <Select
  //                 id="limit"
  //                 label=""
  //                 onSelectClicked={(index) => {
  //                   setSelectedLimitIndex(index);
  //                   setLimit(limits[index]);
  //                 }}
  //                 indexSelected={selectedLimitIndex}
  //                 options={limits}
  //               />
  //             </div>
  //           </div>
  //           <hr className={s.hr_horizontal} />
  //         </div>

  //         <table className={s.main_page_table}>
  //           <thead>
  //             <tr>
  //               <th>
  //                 <p className={s.subtext}>Название</p>
  //               </th>
  //               <th>
  //                 <p className={s.subtext}>Префикс групп</p>
  //               </th>
  //               <th>
  //                 <p className={s.subtext}>Степень</p>
  //               </th>
  //               <th>
  //                 <p className={s.subtext}>Действия</p>
  //               </th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {faculties.map((value) => (
  //               <FacultyRow faculty={value} key={value.id} />
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   );
  return (
    <div>
      <p className={s.default_text}>A nice website is going to be here</p>
    </div>
  );
};

export default FacultiesPage;
