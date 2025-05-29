export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Team {
  name: string;
  logo: string;
  plan: string;
}

export async function getUserData(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    name: "Chaitanya",
    email: "chaitanya@tesla.com",
    avatar: "/avatars/chaitanya.jpg",
  };
}

export async function getTeamsData(): Promise<Team> {
  await new Promise((resolve) => setTimeout(resolve, 1050));

  return {
    name: "Tesla",
    logo: "tesla.com",
    plan: "Enterprise",
  };
}
