//import { FC, PropsWithChildren, useState } from "react";
import type { FC, PropsWithChildren } from "react";
import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { BASE_URL } from "../../constants/baseUrl";

const USERNAME_KEY = "username";
const TOKEN_KEY = "token";

// The admin flag is also carried in the JWT so the UI can hide the dashboard.
// It is only a hint - the API re-checks the database on every admin request.
const readIsAdminFromToken = (token: string | null) => {
  if (!token) return false;

  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return !!JSON.parse(atob(normalized)).isAdmin;
  } catch {
    return false;
  }
};



const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem(USERNAME_KEY)
  );


  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  const [myOrders, setMyOrders] = useState<Record<string, unknown>[]>([]);


  const isAuthenticated = !!token;
  const isAdmin = readIsAdminFromToken(token);

  const login = (username: string, token: string) => {
    setUsername(username);
    setToken(token);
    localStorage.setItem(USERNAME_KEY, username);
    localStorage.setItem(TOKEN_KEY, token);
  };

  const logout = () => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUsername(null);
    setToken(null);
  };



  const getMyOrders = async () => {
  
      const response = await fetch(`${BASE_URL}/user/my-orders`, {
        method: "GET",
        headers: {
          //"Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      console.log("My Orders:", data);
      setMyOrders(data); 

  };  

  return (
    <AuthContext.Provider
      value={{ username, token, isAuthenticated, isAdmin, myOrders, login, logout, getMyOrders}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
