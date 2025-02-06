import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  AddPlaceRequest,
  AdminRegister,
  ClientRegister,
  EmployeeUpdate,
  Event,
  EventClientUpdate,
  EventCreate,
  EventManagerRegister,
  EventsSearchParams,
  EventsSearchResponse,
  EventUpdate,
  GuestUpdate,
  ParticipantRegister,
  Place,
  PlacesSearchParams,
  PlacesSearchResponse,
  ShowmanRegister,
  Token,
  User,
  UsersSearchParams,
  UsersSearchResponse,
  UserUpdate,
  AddInvite,
  RemoveInvite,
  ReportAdd,
  Report,
} from "./apiModels";
import { useDispatch } from "react-redux";
import { dropUser } from "../features/user/User";

export const apiPublic: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiPrivate: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiPrivate.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
    }

    return Promise.reject(error);
  }
);

export async function me(): Promise<User> {
  const response = await apiPrivate.get<User>("/users/me");
  return response.data;
}

export async function login(
  username: string,
  password: string
): Promise<string> {
  const response = await apiPublic.post<Token>(
    "/users/login",
    new URLSearchParams({
      username,
      password,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const token = response.data;

  return token.access_token;
}

export async function registerAdmin(admin: AdminRegister): Promise<string> {
  const response = await apiPrivate.post<string>(
    "/users/register_admin",
    admin
  );
  return response.data;
}

export async function registerEventManager(
  manager: EventManagerRegister
): Promise<string> {
  const response = await apiPrivate.post<string>(
    "/users/register_event_manager",
    manager
  );
  return response.data;
}
export async function registerShowman(
  showman: ShowmanRegister
): Promise<string> {
  const response = await apiPrivate.post<string>(
    "/users/register_showman",
    showman
  );
  return response.data;
}

export async function registerParticipant(
  participant: ParticipantRegister
): Promise<string> {
  const response = await apiPublic.post<Token>(
    "/users/register_participant",
    participant
  );
  const token = response.data;

  return token.access_token;
}

export async function registerClient(client: ClientRegister): Promise<string> {
  const response = await apiPublic.post<Token>(
    "/users/register_client",
    client
  );
  const token = response.data;

  return token.access_token;
}

export async function getUsers(
  params: UsersSearchParams
): Promise<UsersSearchResponse> {
  const response = await apiPrivate.get<UsersSearchResponse>(
    "/users/get_users",
    { params: params }
  );
  return response.data;
}

export async function getUser(email: string): Promise<User> {
  const response = await apiPrivate.get<User>("/users/get_user", {
    params: {
      email: email,
    },
  });

  return response.data;
}

export async function deleteUser(email: string): Promise<string> {
  const response = await apiPrivate.delete<string>("/users/remove_user", {
    params: {
      email: email,
    },
  });

  return response.data;
}

export async function updateAdmin(user: UserUpdate): Promise<string> {
  const response = await apiPrivate.put<string>(
    "/users/update_admin_user",
    user
  );
  return response.data;
}

export async function updateGuest(user: GuestUpdate): Promise<string> {
  const response = await apiPrivate.put<string>(
    "/users/update_guest_user",
    user
  );
  return response.data;
}

export async function updateEmployee(user: EmployeeUpdate): Promise<string> {
  const response = await apiPrivate.put<string>(
    "/users/update_employee_user",
    user
  );
  return response.data;
}

export async function addPlace(place: AddPlaceRequest): Promise<Place> {
  const response = await apiPrivate.post<Place>("/place/add_place", place);
  return response.data;
}

export async function getPlace(place_id: string): Promise<Place> {
  const response = await apiPrivate.get<Place>("/place/get_place", {
    params: { place_id },
  });

  return response.data;
}

export async function getPlaces(
  params: PlacesSearchParams
): Promise<PlacesSearchResponse> {
  const response = await apiPrivate.get<PlacesSearchResponse>(
    "/place/get_places",
    { params: params }
  );
  return response.data;
}

export async function deletePlace(place_id: string): Promise<string> {
  const response = await apiPrivate.delete<string>("/place/remove_place", {
    params: { place_id },
  });
  return response.data;
}

export async function updatePlace(place: Place): Promise<Place> {
  const response = await apiPrivate.put<Place>("/place/update_place", place);
  return response.data;
}

export async function getEvent(event_id: string): Promise<Event> {
  const response = await apiPrivate.get<Event>("/event/get_event", {
    params: { event_id },
  });
  return response.data;
}

export async function getEvents(
  params: EventsSearchParams
): Promise<EventsSearchResponse> {
  const response = await apiPrivate.get<EventsSearchResponse>(
    "/event/get_events",
    { params: params }
  );
  return response.data;
}

export async function addEvent(event: EventCreate) {
  await apiPrivate.post<string>("/event/add_event", event);
}

export async function updateEventAdmin(event: EventUpdate) {
  await apiPrivate.put<string>("/event/update_event_admin", event);
}

export async function updateEventClient(event: EventClientUpdate) {
  await apiPrivate.put<string>("/event/update_event_client", event);
}

export async function updateEventBecomeAdmin(event_id: string) {
  await apiPrivate.put<string>("/event/update_event_become_admin", {
    event_id,
  });
}

export async function addInvite(invite: AddInvite) {
  await apiPrivate.post("/invite_list/invite", invite);
}

export async function removeInvite(invite: RemoveInvite) {
  await apiPrivate.post("/invite_list/remove_note", invite);
}

export async function getReports(event_id: string): Promise<Array<Report>> {
  const response = await apiPrivate.get<Array<Report>>("/reports/get_reports", {
    params: { event_id },
  });
  return response.data;
}

export async function removeReport(event_id: string, report_id: string) {
  await apiPrivate.delete("/reports/remove_report", {
    params: { event_id, report_id },
  });
}

export async function addReport(report: ReportAdd) {
  await apiPrivate.post("/reports/add_report", report);
}
