export type MediaItem = {
    id: string
    eventId: string
    type: "IMAGE"|"VIDEO"
    url: string
    thumbUrl?: string | null
    title?: string | null
    createdAt: string
    canEdit?: boolean
    onDelete?: ()=>void
}