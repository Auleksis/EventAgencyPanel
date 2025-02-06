import { FormEvent, useEffect, useState } from "react";
import Button from "../Button/Button";
import Input from "../Input/Input";
import s from "./CreateRoomPopup.module.css";
import { createRoom } from "../../services/api";
import { Room } from "../../services/apiModels";

import Cross from "/src/assets/icons/cross.svg?react";

export interface CreateRoomPopupProps {
  onCreate: (room: Room) => void;
  onCancel: () => void;
  visible: boolean;
}

const CreateRoomPopup: React.FunctionComponent<CreateRoomPopupProps> = ({
  onCancel,
  onCreate,
  visible,
}) => {
  const [roomName, setRoomName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (roomName.length < 6) {
      setError("Room Name must have at least 6 characters");
      return;
    }

    try {
      const room = await createRoom(roomName);
      onCreate(room);
    } catch (e) {
      setError("A room with this name already exists");
    }
  };

  const onFormCancel = () => {
    onCancel();
  };

  return (
    visible && (
      <div className={s.create_room_popup_container}>
        <form className={s.page_form_container} onSubmit={onSubmit}>
          <Cross className={s.cross_svg_cancel} onClick={onFormCancel} />
          <h4 className={s.subtitle}>AChat</h4>
          <h4 className={s.subtitle}>Create new room</h4>
          <div className={s.page_form_input_with_error_container}>
            <Input
              id="room_name"
              label="Room name"
              type="text"
              onChange={(e) => setRoomName(e.target.value)}
            />
            <p className={s.error_default_text}>{error}</p>
          </div>
          <Button text="Create" type="submit" style={{ width: "100%" }} />
        </form>
      </div>
    )
  );
};

export default CreateRoomPopup;
