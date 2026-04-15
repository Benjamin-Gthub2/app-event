import { fetchAPI } from "../../services/api";
import { User } from "./users.types";

export function getUsers(): Promise<User[]> {
    return fetchAPI<User[]>("/users");
}