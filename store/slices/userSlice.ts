import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  status: string;
  isOnline: boolean;
}

interface UserState {
  profile: UserProfile | null;
  contacts: UserProfile[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  contacts: [],
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setContacts: (state, action: PayloadAction<UserProfile[]>) => {
      state.contacts = action.payload;
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProfile,
  setContacts,
  setUserLoading,
  setUserError,
} = userSlice.actions;

export default userSlice.reducer;