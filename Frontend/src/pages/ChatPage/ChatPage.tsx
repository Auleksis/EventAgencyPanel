import { useNavigate, useParams } from "react-router-dom";
import s from "./ChatPage.module.css";
import { useRef, useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";

export interface ChatPageProps {
  //   room_id: string;
  //   username: string;
}

const ChatPage: React.FunctionComponent<ChatPageProps> = () => {
  const navigate = useNavigate();
  const { room_name, username } = useParams<{
    room_name: string;
    username: string;
  }>();

  const messageContainerBottom = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    document.cookie = `token=${localStorage.getItem(
      "room_access_token"
    )}; path=/; secure; SameSite=Strict`;

    try {
      ws.current = new WebSocket(import.meta.env.VITE_REACT_APP_WS_ENDPOINT);

      ws.current.onmessage = (event) => {
        setMessages((prevMessages) => [...prevMessages, event.data]);
      };
    } catch (e) {
      navigate("/search_rooms");
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        localStorage.removeItem("room_access_token");
        navigate("/search_rooms");
      }
    };
  }, []);

  useEffect(() => {
    if (messageContainerBottom.current) {
      messageContainerBottom.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  interface MessageProps {
    message: string;
  }

  const Message: React.FunctionComponent<MessageProps> = ({ message }) => {
    const msg = JSON.parse(message) as {
      type: string;
      from: string;
      content: string;
    };

    if (msg.type == "enter") {
      return (
        <div className={s.chat_page_enter_container}>
          <p className={s.default_text}>{msg.from} joined the room!</p>
        </div>
      );
    }
    if (msg.type == "msg") {
      return (
        <div
          className={
            msg.from == username
              ? s.chat_page_msg_own_container
              : s.chat_page_msg_not_own_container
          }
        >
          <div
            className={s.chat_page_msg_div}
            style={{
              alignItems: msg.from == username ? "flex-end" : "flex-start",
            }}
          >
            <p className={s.subtext}>{msg.from}</p>
            <p className={s.default_text}>{msg.content}</p>
          </div>
        </div>
      );
    }
    if (msg.type == "leave") {
      return (
        <div className={s.chat_page_enter_container}>
          <p className={s.default_text}>{msg.from} left the room!</p>
        </div>
      );
    }
    return (
      <div>
        <p>{message}</p>
      </div>
    );
  };

  const sendMessage = () => {
    if (input.trim().length > 0 && ws.current) {
      ws.current.send(
        JSON.stringify({
          text: input,
        })
      );
      setInput("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={s.chat_page_container}>
      <div className={s.page_title_container}>
        <h1 className={s.subtitle}>ROOM CHAT {room_name}</h1>
      </div>
      <div className={s.chat_page_middle_container}>
        <Button
          text="Back to rooms"
          onClick={() => {
            navigate("/search_rooms");
          }}
        />
        <hr className={s.hr_horizontal} />
      </div>
      <div className={s.chat_page_map_container}>
        {messages.map((value, index) => {
          return <Message message={value} key={index} />;
        })}
        <div ref={messageContainerBottom} />
      </div>
      <div className={s.chat_page_input_div}>
        <Input
          id="input"
          label=""
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          value={input}
        />
        <Button text="Send" onClick={sendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
