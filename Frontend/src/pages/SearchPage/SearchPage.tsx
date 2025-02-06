import { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import { findRooms, getMyRooms } from "../../services/api";
import { Room } from "../../services/apiModels";
import s from "./SearchPage.module.css";
import RoomLine from "../../components/RoomLine/RoomLine";
import Input from "../../components/Input/Input";

const SearchPage = () => {
  const [rooms, setRooms] = useState<Array<Room>>([]);

  const [query, setQuery] = useState<string>("");

  const [page, setPage] = useState<number>(0);
  const [roomPageCount, setRoomPageCount] = useState<number>(10);

  async function fetchRooms(page: number): Promise<Array<Room>> {
    const fetchedRooms = await findRooms(query, page, roomPageCount);
    return fetchedRooms;
  }

  const fetch = async () => {
    setPage(0);
    const rooms = await fetchRooms(0);
    setRooms(rooms);
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    fetch();
  }, [query]);

  const onNextPage = async () => {
    let p = page + 1;
    const fetched = await fetchRooms(p);

    if (fetched.length == 0) {
      return;
    }

    setPage(page + 1);
    setRooms(fetched);
  };

  const onPrevPage = async () => {
    if (page > 0) {
      let p = page - 1;
      const fetched = await fetchRooms(p);

      setPage(page - 1);
      setRooms(fetched);
    }
  };

  return (
    <div className={s.search_page_container}>
      <div className={s.page_title_container}>
        <h1 className={s.title}>SEARCH ROOMS</h1>
        <hr className={s.hr_horizontal} />
        <div className={s.search_page_input_container}>
          <p className={s.subtitle}>Type text to search rooms</p>
          <Input
            id="search"
            label=""
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={s.search_page_middle_container}>
        <div className={s.search_page_switch_page_container}>
          <Button text="Предыдущая" onClick={onPrevPage} />
          <p className={s.default_text}>СТраница {page + 1}</p>
          <Button text="Следующая" onClick={onNextPage} />
        </div>
        <hr className={s.hr_horizontal} />
      </div>
      <div className={s.search_page_map_container}>
        {rooms.map((room, index) => {
          return (
            <RoomLine
              id={room.id}
              index={index + 1 + page * roomPageCount}
              name={room.name}
              key={index}
              owner={room.owner}
            />
          );
        })}
      </div>
      {rooms.length > 5 && (
        <div className={s.search_page_middle_container}>
          <hr className={s.hr_horizontal} />
          <div className={s.search_page_switch_page_container}>
            <Button text="Next" onClick={onPrevPage} />
            <p className={s.default_text}>Page {page + 1}</p>
            <Button text="Previous" onClick={onNextPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
