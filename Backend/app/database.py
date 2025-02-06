from sqlalchemy import ForeignKey, Numeric, func, create_engine, select, MetaData, Column
from sqlalchemy.types import String, Date, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime

from app.utils import hash_password


class Base(DeclarativeBase):
    pass


DATABASE_URL = "postgresql+psycopg2://postgres:postgres@localhost/event_agency_db"

engine = create_engine(DATABASE_URL)

Base.metadata.create_all(bind=engine)

sessionLocal = sessionmaker(autoflush=False, bind=engine)

with engine.connect() as connection:
    print("Connection successful!")


class Admin(Base):
    __tablename__ = "admin"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=False, unique=True)


class EventManager(Base):
    __tablename__ = "eventmanager"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String, nullable=False)


class Showman(Base):
    __tablename__ = "showman"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String, nullable=False)


class Client(Base):
    __tablename__ = "client"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    age: Mapped[int] = mapped_column(nullable=False)


class Participant(Base):
    __tablename__ = "participant"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    age: Mapped[int] = mapped_column(nullable=False)


class Place(Base):
    __tablename__ = "place"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    capacity: Mapped[int] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)


class Event(Base):
    __tablename__ = "event"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column(String, nullable=False)
    event_date = mapped_column(Date, nullable=False)
    client_description: Mapped[str] = mapped_column(String, nullable=False)
    description_for_event_manager: Mapped[str] = mapped_column(String, nullable=True)
    description_for_showman: Mapped[str] = mapped_column(String, nullable=True)
    description_for_participants: Mapped[str] = mapped_column(String, nullable=True)
    admin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("admin.id"))
    place_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("place.id"), nullable=False)
    showman_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("showman.id"), nullable=False)
    event_manager_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("eventmanager.id"), nullable=False)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("client.id"), nullable=False)


class InviteList(Base):
    __tablename__ = "invitelist"
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("event.id"), primary_key=True)
    participant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("participant.id"),
                                                      primary_key=True)


class Report(Base):
    __tablename__ = "eventeconomics"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("event.id"), nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    value = mapped_column(Numeric, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    expected: Mapped[bool] = mapped_column(nullable=False, default=False)


class Log(Base):
    __tablename__ = "log"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_time = mapped_column(DateTime, nullable=False, server_default=func.now())
    event_issuer: Mapped[str] = mapped_column(String, nullable=False)
    event_issuer_role: Mapped[str] = mapped_column(String, nullable=False)
    event_table: Mapped[str] = mapped_column(String, nullable=False)
    event_operation_type: Mapped[str] = mapped_column(String, nullable=False)
    event_old_tuple = mapped_column(JSON, nullable=False)
    event_new_tuple = mapped_column(JSON, nullable=False)


class Credentials(Base):
    __tablename__ = "credentials"
    email: Mapped[str] = mapped_column(String, primary_key=True)
    passwd: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)


class EventRequestsView(Base):
    __tablename__ = "event_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    client_fullname: Mapped[str] = mapped_column("ФИО заказчика", String, key="client_fullname")
    client_email: Mapped[str] = mapped_column("Email заказчика", String, key="client_email")
    client_phone_number: Mapped[str] = mapped_column("Контактный телефон заказчика", String, key="client_phone_number")
    event_date = mapped_column("Планируемая дата мероприятия", Date, key="event_date")
    showman_fullname: Mapped[str] = mapped_column("Желаемый ведущий мероприятия", String, key="showman_fullname")
    client_description: Mapped[str] = mapped_column("Описание мероприятия", String, key="client_description")


class EventScheduleView(Base):
    __tablename__ = "event_schedule"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    address: Mapped[str] = mapped_column("Место проведения", String, key="address")
    event_date = mapped_column("Дата проведения", Date, key="event_date")

    event_manager_fullname: Mapped[str] = mapped_column("Ответственный организатор", String,
                                                        key="event_manager_fullname")
    showman_fullname: Mapped[str] = mapped_column("Ответственный ведущий", String,
                                                        key="showman_fullname")

    client_fullname: Mapped[str] = mapped_column("ФИО заказчика", String, key="client_fullname")
    client_email: Mapped[str] = mapped_column("Email заказчика", String, key="client_email")
    client_phone_number: Mapped[str] = mapped_column("Контактный телефон заказчика",
                                                     String, key="client_phone_number")


class EventEconomicsView(Base):
    __tablename__ = "event_economics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    type: Mapped[str] = mapped_column("Тип", String, key="type")
    description: Mapped[str] = mapped_column("Описание", String, key="description")
    value: Mapped[float] = mapped_column("Значение", String, key="value")
    expected: Mapped[bool] = mapped_column("Ожидаемое значение?", String, key="expected")


class EventInfoEMView(Base):
    __tablename__ = "event_info_em"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    address: Mapped[str] = mapped_column("Место проведения", String, key="address")
    event_date = mapped_column("Дата проведения", Date, key="event_date")

    showman_fullname: Mapped[str] = mapped_column("Ответственный ведущий", String,
                                                        key="showman_fullname")
    admin_fullname: Mapped[str] = mapped_column("Ответственный администратор", String,
                                                        key="admin_fullname")

    client_fullname: Mapped[str] = mapped_column("ФИО заказчика", String, key="client_fullname")
    client_email: Mapped[str] = mapped_column("Email заказчика", String, key="client_email")
    client_phone_number: Mapped[str] = mapped_column("Контактный телефон заказчика",
                                                     String, key="client_phone_number")

    description_for_event_manager: Mapped[str] = mapped_column("Описание мероприятия для организа", String, key="description_for_event_manager")
    client_description: Mapped[str] = mapped_column("Описание от заказчика", String, key="client_description")


class EventParticipantsEMView(Base):
    __tablename__ = "event_participants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    participant_fullname: Mapped[str] = mapped_column("ФИО участника", String, key="participant_fullname")
    participant_email: Mapped[str] = mapped_column("Email участника", String, key="participant_email", primary_key=True)
    participant_phone_number: Mapped[str] = mapped_column("Телефонный номер участника", String, key="participant_phone_number")


class EventInfoShowmanView(Base):
    __tablename__ = "event_info_sm"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    address: Mapped[str] = mapped_column("Место проведения", String, key="address")
    event_date = mapped_column("Дата проведения", Date, key="event_date")

    event_manager_fullname: Mapped[str] = mapped_column("Ответственный организатор", String,
                                                        key="event_manager_fullname")
    admin_fullname: Mapped[str] = mapped_column("Ответственный администратор", String,
                                                        key="admin_fullname")

    client_fullname: Mapped[str] = mapped_column("ФИО заказчика", String, key="client_fullname")
    client_email: Mapped[str] = mapped_column("Email заказчика", String, key="client_email")
    client_phone_number: Mapped[str] = mapped_column("Контактный телефон заказчика",
                                                     String, key="client_phone_number")

    description_for_showman: Mapped[str] = mapped_column("Описание мероприятия для ведущего", String,
                                                         key="description_for_showman")
    client_description: Mapped[str] = mapped_column("Описание от заказчика", String, key="client_description")


class EventParticipantsShowmanView(Base):
    __tablename__ = "event_participants_sm"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    participant_fullname: Mapped[str] = mapped_column("ФИО участника", String, key="participant_fullname")
    participant_email: Mapped[str] = mapped_column("Email участника", String, key="participant_email", primary_key=True)
    participant_phone_number: Mapped[str] = mapped_column("Телефонный номер участника", String, key="participant_phone_number")


class EventInfoClientView(Base):
    __tablename__ = "event_info_client"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    address: Mapped[str] = mapped_column("Место проведения", String, key="address")
    event_date = mapped_column("Дата проведения", Date, key="event_date")

    event_manager_fullname: Mapped[str] = mapped_column("Ответственный организатор", String,
                                                        key="event_manager_fullname")
    event_manager_email: Mapped[str] = mapped_column("Email организатора", String, key="event_manager_email")
    event_manager_phone_number: Mapped[str] = mapped_column("Контактный телефон организатора",
                                                     String, key="event_manager_phone_number")

    admin_fullname: Mapped[str] = mapped_column("Ответственный администратор", String,
                                                        key="admin_fullname")
    admin_email: Mapped[str] = mapped_column("Email администратора", String, key="admin_email")
    admin_phone_number: Mapped[str] = mapped_column("Контактный телефон администратора",
                                                            String, key="admin_phone_number")

    showman_fullname: Mapped[str] = mapped_column("Ответственный ведущий", String, key="showman_fullname")
    showman_email: Mapped[str] = mapped_column("Email ведущего", String, key="showman_email")
    showman_phone_number: Mapped[str] = mapped_column("Контактный телефон ведущего",
                                                     String, key="showman_phone_number")

    client_description: Mapped[str] = mapped_column("Описание от заказчика", String, key="client_description")


class EventParticipantsClientView(Base):
    __tablename__ = "event_participants_client"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    participant_fullname: Mapped[str] = mapped_column("ФИО участника", String, key="participant_fullname")
    participant_email: Mapped[str] = mapped_column("Email участника", String, key="participant_email", primary_key=True)
    participant_phone_number: Mapped[str] = mapped_column("Телефонный номер участника", String, key="participant_phone_number")


class EventInfoParticipantView(Base):
    __tablename__ = "event_info_participant"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    address: Mapped[str] = mapped_column("Место проведения", String, key="address")
    event_date = mapped_column("Дата проведения", Date, key="event_date")

    event_manager_fullname: Mapped[str] = mapped_column("Ответственный организатор", String,
                                                        key="event_manager_fullname")
    event_manager_email: Mapped[str] = mapped_column("Email организатора", String, key="event_manager_email")
    event_manager_phone_number: Mapped[str] = mapped_column("Номер телефона организатора",
                                                     String, key="event_manager_phone_number")

    description_for_participants: Mapped[str] = mapped_column("Описание для участников", String,
                                                              key="description_for_participants")


class EventDevelopersInfoView(Base):
    __tablename__ = "event_developers_info"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name: Mapped[str] = mapped_column("Название мероприятия", String, key="email")
    showman_fullname: Mapped[str] = mapped_column("ФИО ведущего", String, key="showman_fullname")
    showman_description: Mapped[str] = mapped_column("Резюме ведущего", String,
                                                   key="showman_description", primary_key=True)

    event_manager_fullname: Mapped[str] = mapped_column("ФИО организатора", String, key="event_manager_fullname")
    event_manager_description: Mapped[str] = mapped_column("Резюме организатора", String,
                                                           key="event_manager_description")


def create_session():
    return sessionLocal()


# with create_session() as session:
#     result = session.query(EventRequestsView).all()
#     for row in result:
#         print(row.client_email)

# HOW SIGN IN WORKS?
# 1) User enter they credentials
# 2) System checks if the credentials are right
# 3) If right, then it finds user data in a table depending on user's role
# 4) It returns user's data
# Main user field is ID. ID allows to define which objects can be accessed by user

# session = sessionLocal()

# emails = ["ivan.ivanovich@mail.ru", "maria.petrovna@mail.ru", "alexey.sergeevich@mail.ru",
#           "ekaterina.viktorovna@mail.ru", "dmitry.aleksandrovich@mail.ru",
#           "olga.vladimirovna@mail.ru", "andrey.nikolaevich@mail.ru",
#           "natalya.pavlovna@mail.ru"]
# passwd = hash_password('admin1')
#
# with sessionLocal() as temp:
#     for e in emails:
#         c = Credentials(email=e, passwd=passwd, role='admin')
#         temp.add(c)
#         temp.commit()

# credits = session.query(Credentials).all()
# for credit in credits:
#     print(credit.email, credit.passwd, credit.role)
