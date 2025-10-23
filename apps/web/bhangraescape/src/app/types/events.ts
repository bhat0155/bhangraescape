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
    description?: string
}

export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
