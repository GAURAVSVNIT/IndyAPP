import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'message' | 'call' | 'system';
  title: string;
  body: string;
  chatId?: string;
  senderId?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  pushToken: string | null;
  pushEnabled: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  pushToken: null,
  pushEnabled: false,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setPushToken: (state, action: PayloadAction<string | null>) => {
      state.pushToken = action.payload;
    },
    setPushEnabled: (state, action: PayloadAction<boolean>) => {
      state.pushEnabled = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  setPushToken,
  setPushEnabled,
} = notificationSlice.actions;

export default notificationSlice.reducer;