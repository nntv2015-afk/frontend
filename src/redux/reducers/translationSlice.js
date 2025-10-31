import config from "@/utils/Langconfig";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper function to fetch translations
const fetchTranslations = async (langCode) => {
  const timestamp = Date.now(); // Add timestamp to prevent caching
  const response = await fetch(`/translations/${langCode}.json?t=${timestamp}`);
  if (!response.ok) {
    throw new Error(`Failed to load translations for ${langCode}`);
  }
  return response.json();
};

export const loadTranslations = createAsyncThunk(
  'translation/loadTranslations',
  async (langCode, { rejectWithValue }) => {
    try {
      return await fetchTranslations(langCode);
    } catch (error) {
      console.error(`Failed to load translations for ${langCode}:`, error);
      
      // If error, try to load default language
      try {
        return await fetchTranslations(config.defaultLanguage.langCode);
      } catch (fallbackError) {
        console.error('Failed to load default language translations:', fallbackError);
        return rejectWithValue(error.message);
      }
    }
  }
);

const initialState = {
  currentLanguage: config.defaultLanguage,
  translations: {},
  status: 'idle',
  error: null,
  lastLoaded: null
};

const translationSlice = createSlice({
  name: "translation",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    setTranslations: (state, action) => {
      state.translations = action.payload;
      state.lastLoaded = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTranslations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadTranslations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.translations = action.payload;
        state.lastLoaded = new Date().toISOString();
        state.error = null;
      })
      .addCase(loadTranslations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setLanguage, setTranslations } = translationSlice.actions;
export default translationSlice.reducer;