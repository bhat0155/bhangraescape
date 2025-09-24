export const joinService = {
    async submitJoinRequest(user: {id: string, name?: string | null, email?: string | null}, message?: string){
        return {status: "queued" as const}
    },

    async listJoinRequests(filter?: {status?: "PENDING" | "APPROVED" | "REJECTED"}){
        return {items: [] as any[]}
    },

    async reviewJoinRequest(id: string, action: "APPROVE" | "REJECT"){
        return {ok: true}
    }
}