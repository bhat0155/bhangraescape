export function formatDate(iso: string){
    const date = new Date(iso);
    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date)
}