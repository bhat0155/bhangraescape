export type Member = {
    id: string;
    name: string;
    avatarUrl: string | null;
    description: string | null;
    role: "MEMBER"|"ADMIN",
    createdAt: string;
    updatedAt: string;
}