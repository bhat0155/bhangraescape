export type EventSummary = {
    id: string;
    title: string;
    location: string;
    date: string
}

export type EventDetail = {
  id: string;
  title: string;
  location: string;
  date: string;          
  coverUrl?: string | null;
  finalPlaylistProvider?: "SPOTIFY" | "YOUTUBE" | "EXTERNAL" | "SOUNDCLOUD" | null;
  finalPlaylistTitle?: string | null;
  finalPlaylistUrl?: string | null;
};

export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
