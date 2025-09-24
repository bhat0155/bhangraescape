export const contactService ={
    async submitMessage(input: {name: string, email: string, message: string}){
        return {status :"queued" as const}
    }
}