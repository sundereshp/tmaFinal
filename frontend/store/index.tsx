// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';

export const store = configureStore({
  reducer: {
    themeConfig: themeConfigSlice,
    // Add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;