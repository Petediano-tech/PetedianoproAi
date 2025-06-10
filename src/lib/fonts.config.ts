
export interface FontConfig {
  key: string;
  name: string;
  bodyFamily: string;
  headlineFamily: string;
  googleImportUrl?: string; // For a single font import
  googleImportUrlBody?: string; // If body and headline are different and need separate imports
  googleImportUrlHeadline?: string;
}

export const FONT_STORAGE_KEY = 'petediano-pro-font-theme';
export const DEFAULT_FONT_THEME_KEY = 'default';

export const AVAILABLE_FONTS: FontConfig[] = [
  {
    key: DEFAULT_FONT_THEME_KEY,
    name: 'Default (Belleza/Alegreya)',
    bodyFamily: "'Alegreya', serif",
    headlineFamily: "'Belleza', sans-serif",
    // These are already in layout.tsx, but good to list
    googleImportUrlBody: "https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap",
    googleImportUrlHeadline: "https://fonts.googleapis.com/css2?family=Belleza&display=swap",
  },
  {
    key: 'inter',
    name: 'Inter',
    bodyFamily: "'Inter', sans-serif",
    headlineFamily: "'Inter', sans-serif",
    googleImportUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
  },
  {
    key: 'roboto',
    name: 'Roboto',
    bodyFamily: "'Roboto', sans-serif",
    headlineFamily: "'Roboto', sans-serif",
    googleImportUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  },
  {
    key: 'poppins',
    name: 'Poppins',
    bodyFamily: "'Poppins', sans-serif",
    headlineFamily: "'Poppins', sans-serif",
    googleImportUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap",
  },
  {
    key: 'merriweather',
    name: 'Merriweather',
    bodyFamily: "'Merriweather', serif",
    headlineFamily: "'Merriweather', serif", // Can also choose a different headline
    googleImportUrl: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
  },
  {
    key: 'playfair',
    name: 'Playfair Display',
    bodyFamily: "'Playfair Display', serif", // Often better for headlines
    headlineFamily: "'Playfair Display', serif",
    googleImportUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap",
  },
  {
    key: 'lobster',
    name: 'Lobster',
    bodyFamily: "'Lobster', cursive",
    headlineFamily: "'Lobster', cursive",
    googleImportUrl: "https://fonts.googleapis.com/css2?family=Lobster&display=swap",
  },
  {
    key: 'caveat',
    name: 'Caveat',
    bodyFamily: "'Caveat', cursive",
    headlineFamily: "'Caveat', cursive",
    googleImportUrl: "https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap",
  },
];
