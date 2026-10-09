// import { FC, PropsWithChildren, useEffect, useState } from "react";
import {  useEffect, useState } from "react";
import type { FC, PropsWithChildren } from "react";
import { CartContext } from "./CartContext";
import type { CartItem } from "../../types/CartItem";
import { BASE_URL } from "../../constants/baseUrl";
import { useAuth } from "../Auth/AuthContext";

interface CartApiProduct {
  _id: string;
  title: string;
  image: string;
  unitPrice?: number;
}

interface CartApiItem {
  product: CartApiProduct;
  quantity: number;
  unitPrice: number;
}

interface CartApiResponse {
  items: CartApiItem[];
  totalAmount: number;
}

const mapCartItems = (cart: CartApiResponse): CartItem[] =>
  cart.items.map(({ product, quantity, unitPrice }) => ({
    productId: product._id,
    title: product.title,
    image: product.image,
    quantity,
    unitPrice,
  }));

const CartProvider: FC<PropsWithChildren> = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchCart = async () => {
      const response = await fetch(`${BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cart = (await response.json()) as CartApiResponse;

      setCartItems(mapCartItems(cart));
      setTotalAmount(cart.totalAmount);
    };

    fetchCart();
  }, [token]);





  /////////////////////////////////////////////////////////


  const addItemToCart = async (productId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const cart = (await response.json()) as CartApiResponse;

      setCartItems(mapCartItems(cart));
      setTotalAmount(cart.totalAmount);
    } catch (error) {
      console.error(error);
    }
  };


/////////////////////////////////////////////////////////

  
  const updateItemInCart = async (productId: string, quantity: number) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/items`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const cart = (await response.json()) as CartApiResponse;

      setCartItems(mapCartItems(cart));
      setTotalAmount(cart.totalAmount);
    } catch (error) {
      console.error(error);
    }
  };




  //////////////////////////////////////////////////


  const removeItemInCart = async (productId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/items/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cart = (await response.json()) as CartApiResponse;

      setCartItems(mapCartItems(cart));
      setTotalAmount(cart.totalAmount);
    } catch (error) {
      console.error(error);
    }
  };


//////////////////////////////////////////////////////////




  const clearCart = async () => {
    try {
      await fetch(`${BASE_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems([]);
      setTotalAmount(0);
    } catch (error) {
      console.error(error);
    }
  };





  ///////////////////////////////////////////////////


  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        addItemToCart,
        updateItemInCart,
        removeItemInCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
