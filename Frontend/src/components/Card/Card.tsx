import s from "./Card.module.css";

export interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  positive?: boolean;
}

export const Card: React.FunctionComponent<CardProps> = (props: CardProps) => {
  return (
    <div
      className={`${s.card_container} ${
        props.positive == undefined
          ? ""
          : props.positive
          ? s.card_positive
          : s.card_negative
      }`}
    >
      <p className={s.subtitle}>{props.title}</p>
      <p className={s.subtext}>{props.description}</p>
      <div className={s.card_children_container}>{props.children}</div>
    </div>
  );
};
