export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "member";
}
