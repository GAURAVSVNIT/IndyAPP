import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;