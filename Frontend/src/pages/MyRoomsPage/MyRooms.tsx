import { useEffect, useState } from "react";
import s from "./MyRooms.module.css";
import { Room } from "../../services/apiModels";
import { getMyRooms } from "../../services/api";
import RoomLine from "../../components/RoomLine/RoomLine";
import CreateRoomPopup from "../../components/CreateRoomPopup/CreateRoomPopup";
import Button from "../../components/Button/Button";
import Cross from "/src/assets/icons/cross.svg?react";

const MyRoomsPage = () => {
  const [rooms, setRooms] = useState<Array<Room>>([]);
  const [formVisible, setFormVisible] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [roomPageCount, setRoomPageCount] = useState<number>(10);

  async function fetchRooms(page: number): Promise<Array<Room>> {
    let fetchedRooms: Array<Room> = [];

    fetchedRooms = await getMyRooms(page, roomPageCount);
    return fetchedRooms;
  }

  useEffect(() => {
    const fetch = async () => {
      const fetched = await fetchRooms(0);
      setRooms(fetched);
    };

    fetch();
  }, []);

  const onRemoveRoom = (id: string) => {
    setRooms(rooms.filter((room) => room.id != id));
  };

  const onRoomCreate = async (room: Room) => {
    //setRooms([...rooms, room]);
    let page = Math.floor(rooms.length / roomPageCount);
    const fetched = await fetchRooms(page);
    setRooms(fetched);
    setFormVisible(false);
  };

  const onCancel = () => {
    setFormVisible(false);
  };

  const onCreateRoomButton = () => {
    setFormVisible(true);
  };

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
    <>
      <CreateRoomPopup
        onCreate={onRoomCreate}
        onCancel={onCancel}
        visible={formVisible}
      />
      <div className={s.my_rooms_page_container}>
        <div className={s.page_title_container}>
          <h1 className={s.title}>MY ROOMS</h1>
          <hr className={s.hr_horizontal} />
        </div>
        <div className={s.my_rooms_page_middle_container}>
          <Button
            text="Create a new room"
            icon={<Cross className={s.plus_svg_div} />}
            onClick={onCreateRoomButton}
          />
          <div className={s.my_rooms_page_switch_page_container}>
            <Button text="Next" onClick={onPrevPage} />
            <p className={s.default_text}>Page {page + 1}</p>
            <Button text="Previous" onClick={onNextPage} />
          </div>
          <hr className={s.hr_horizontal} />
        </div>
        <div className={s.my_rooms_page_map_container}>
          {rooms.map((room, index) => {
            return (
              <RoomLine
                id={room.id}
                index={index + 1 + page * roomPageCount}
                name={room.name}
                key={index}
                onRemoveRoom={onRemoveRoom}
                owned
                owner={room.owner}
              />
            );
          })}
        </div>
        {rooms.length > 5 && (
          <div className={s.my_rooms_page_middle_container}>
            <hr className={s.hr_horizontal} />
            <div className={s.my_rooms_page_switch_page_container}>
              <Button text="Next" onClick={onPrevPage} />
              <p className={s.default_text}>Page {page + 1}</p>
              <Button text="Previous" onClick={onNextPage} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyRoomsPage;
