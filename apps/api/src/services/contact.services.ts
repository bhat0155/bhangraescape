import { submitContactBody } from "../schemas/contacts.schemas";

export const contactServices = {
     submitContact (data: {name: string, email: string, message: string}){
        return {
            status: "success",
            data
        }
    }
};