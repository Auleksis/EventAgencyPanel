import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../services/apiModels";

const userInitialState: User = {
  full_name: "",
  email: "",
  phone_number: "",
  role: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState: userInitialState,
  reducers: {
    initUser(state, { payload }: PayloadAction<User>) {
      return payload;
    },
    dropUser(state) {
      return userInitialState;
    },
  },
});

export const { initUser, dropUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
