export const eventService = {
    async createEvent(data: {title: string, description: string, date: string}){
        return {ok: true}
    },
    async getOne(_eventId: string){
        return {ok: true}
    }
}