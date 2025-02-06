export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id?: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  age?: number;
  summary?: string;
}

export interface UsersSearchParams {
  skip?: number;
  limit?: number;
  full_name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  event_id?: string;
}

export interface UsersSearchResponse {
  count: number;
  users: Array<User>;
}

export interface AdminRegister {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface EventManagerRegister {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  summary: string;
}

export interface ShowmanRegister {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  summary: string;
}

export interface ClientRegister {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  age: number;
}

export interface ParticipantRegister {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  age: number;
}

export interface UserUpdate {
  email: string;
  full_name?: string;
  phone_number?: string;
}

export interface GuestUpdate extends UserUpdate {
  age?: number;
}

export interface EmployeeUpdate extends UserUpdate {
  summary?: string;
}

export interface AddPlaceRequest {
  name: string;
  address: string;
  capacity: number;
}

export interface PlaceShort extends AddPlaceRequest {
  id: string;
}

export interface Place extends PlaceShort {
  description: string;
}

export interface PlacesSearchParams {
  skip?: number;
  limit?: number;
  name?: string;
  address?: string;
  capacity?: number;
}

export interface PlacesSearchResponse {
  count: number;
  places: Array<PlaceShort>;
}

export interface Event {
  id: string;

  event_name: string;
  event_date: string;

  client_description: string;
  description_for_event_manager?: string;
  description_for_showman?: string;
  description_for_participants?: string;

  place_name?: string;

  admin_fullname?: string;
  admin_email?: string;
  admin_number?: string;

  showman_fullname?: string;
  showman_email?: string;
  showman_number?: string;

  event_manager_fullname?: string;
  event_manager_email?: string;
  event_manager_number?: string;

  client_fullname: string;
  client_email: string;
  client_phone_number: string;
}

export interface EventShort {
  id: string;
  event_name: string;
  event_date: string;
  place_name?: string;
  place_address?: string;
  mode?: number;
}

export interface EventsSearchParams {
  skip?: number;
  limit?: number;

  showRequests?: boolean;
  showAttention?: boolean;
  showOwn?: boolean;
}

export interface EventsSearchResponse {
  count: number;
  events: Array<EventShort>;
}

export interface EventCreate {
  event_name: string;
  event_date: string;
  client_description: string;
  place_id?: string;
}

export interface EventUpdate {
  id: string;

  event_name?: string;
  event_date?: string;

  client_description?: string;
  description_for_event_manager?: string;
  description_for_showman?: string;
  description_for_participants?: string;

  admin_id?: string;
  place_id?: string;
  showman_id?: string;
  event_manager_id?: string;
}

export interface EventClientUpdate {
  id: string;
  client_description: string;
}

export interface RemoveInvite {
  event_id: string;
  participant_id: string;
}

export interface AddInvite {
  event_id: string;
  participant_email: string;
}

export interface ReportAdd {
  event_id: string;
  type: string;
  value: number;
  description: string;
}

export interface Report {
  id: string;
  type: string;
  value: number;
  description: string;
}
