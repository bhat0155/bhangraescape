import { ok } from "assert";

export const memberService = {
    async list(input: {search: string}){
        return [];
    },

    async get(memberId: string){
        return {id: memberId, name: "Test Member", avatarUrl: "http://example.com/avatar.png", description: "This is a test member."};
    },

    async create(data: {name: string, avatarUrl: string, description: string}){
        return {id: "new-member-id", ...data, role: "MEMBER"}
    },

    async patch(memberId: string, partial: {name?:string, avatarUrl?: string, description?: string}){
        return {id: memberId, ...partial};
    },

    async remove(memberId: string){
        return {ok: true};
    }
}