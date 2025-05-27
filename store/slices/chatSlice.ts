import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  activeChats: string[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  activeChats: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChats: (state, action: PayloadAction<string[]>) => {
      state.activeChats = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setActiveChats,
  setUnreadCount,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;