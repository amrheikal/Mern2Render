import { createContext, useContext } from "react";

interface AuthContextType {
  username: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  myOrders: any[]; // Add this line to include the myOrders property
  login: (username: string, token: string) => void;
  logout: () => void;
  getMyOrders: () => void;
  //getMyOrders: () => Promise<any>; // Add this line to include the getMyOrders function 
}

export const AuthContext = createContext<AuthContextType>({
  username: null,
  token: null,
  myOrders: [],
  login: () => {},
  isAuthenticated: false,
  isAdmin: false,
  logout: () => {},
  getMyOrders:  () => {},
  //getMyOrders: async () => { // Implementation for fetching user's orders//}
});

export const useAuth = () => useContext(AuthContext);
