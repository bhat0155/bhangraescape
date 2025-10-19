const MS_PER_DAY = 86_400_000;

export type RelativeResult = {
    days: number,
    label: string,
    sign: -1|0|1 // past|today|future
}

export function getRelativeTime(iso: string, nowMs: number = Date.now()): RelativeResult {
    const eventMs = new Date(iso).getTime();
    const diff = eventMs - nowMs;
    const days = Math.round(diff/MS_PER_DAY);

    if (days === 0){
        return{
            days,
            label: "today",
            sign: 0
        }
    }
    const abs = Math.abs(days);
    const unit = abs === 1 ? "day": "days"

    if (days>0){
        return {
             days,
            label: `${abs} ${unit} to go`,
            sign: 1
        }
    }

    return {
         days,
        label: `${abs} ${unit} ago`,
        sign: -1
    }
}