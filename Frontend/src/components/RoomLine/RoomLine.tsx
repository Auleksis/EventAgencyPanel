import { useNavigate } from "react-router-dom";
import { getUsername, joinRoom, removeRoom } from "../../services/api";
import s from "./RoomLine.module.css";
import Cross from "/src/assets/icons/cross.svg?react";
import Join from "/src/assets/icons/join.svg?react";

export interface RoomLineProps {
  name: string;
  id: string;
  index: number;
  owned?: boolean;
  owner: string;
  onRemoveRoom?: (id: string) => void;
}

const RoomLine: React.FunctionComponent<RoomLineProps> = ({
  name,
  id,
  index,
  owned,
  owner,
  onRemoveRoom,
}) => {
  const navigate = useNavigate();

  const onDelete = async () => {
    removeRoom(id);
    if (onRemoveRoom) {
      onRemoveRoom(id);
    }
  };

  const onJoinClicked = async () => {
    try {
      const room_access_token = await joinRoom(id);
      localStorage.setItem("room_access_token", room_access_token.access_token);

      const username = await getUsername();

      navigate(`/chat/${name}/${username.username}`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className={owned ? s.room_line_container_owned : s.room_line_container}
    >
      <p className={s.default_text}>{index}.</p>
      <p className={s.default_text}>{name}</p>
      <p className={s.default_text}>Created by {owner}</p>

      {<Join className={s.cross_svg_div} onClick={onJoinClicked} />}
      {owned && <Cross className={s.cross_svg_div} onClick={onDelete} />}
    </div>
  );
};

export default RoomLine;
