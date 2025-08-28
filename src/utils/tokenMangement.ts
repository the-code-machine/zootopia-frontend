import Cookies from "js-cookie";
export const getAuthToken = () => {
  const authToken: string | null | undefined = Cookies.get("auth_token");
  return authToken;
};
