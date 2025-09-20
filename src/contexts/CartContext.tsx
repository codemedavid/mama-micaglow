'use client';

import type { ReactNode } from 'react';
import { createContext, use, useMemo, useReducer } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'individual' | 'group-buy' | 'regional-group' | 'subgroup';
  image?: string;
  imageUrl?: string; // Keep for backward compatibility
  vialsPerBox?: number;
  batchId?: string; // For group buy items
  productId?: number; // For group buy items
  regionalHostId?: string; // For regional group items
  maxQuantity?: number; // Maximum quantity allowed (remaining vials)
  subGroupId?: number; // For sub-group items
  subGroupName?: string; // For sub-group items
  regionWhatsapp?: string; // For sub-group items
};

type CartState = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

type CartAction
  = | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'CLEAR_GROUP_BUY' }
    | { type: 'CLEAR_REGIONAL_GROUP' }
    | { type: 'CLEAR_SUBGROUP' }
    | { type: 'CLEAR_INDIVIDUAL' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.id === action.payload.id && item.type === action.payload.type,
      );

      if (existingItem) {
        // Clamp to maximum allowed if provided
        const requestedQuantity = existingItem.quantity + action.payload.quantity;
        const maxAllowed = existingItem.maxQuantity ?? Infinity;
        const clampedQuantity = Math.min(requestedQuantity, maxAllowed);

        const updatedItems = state.items.map(item =>
          item.id === action.payload.id && item.type === action.payload.type
            ? { ...item, quantity: clampedQuantity }
            : item,
        );
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        };
      }

      // For new items, check if quantity exceeds max allowed
      const maxAllowed = action.payload.maxQuantity ?? Infinity;
      const initialQuantity = Math.min(action.payload.quantity, maxAllowed);

      const newItems = [...state.items, { ...action.payload, quantity: initialQuantity }];
      const newState = {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      };
      return newState;
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items
        .map((item) => {
          if (item.id !== action.payload.id) {
            return item;
          }
          const maxAllowed = item.maxQuantity ?? Infinity;
          const clamped = Math.max(0, Math.min(action.payload.quantity, maxAllowed));
          return { ...item, quantity: clamped };
        })
        .filter(item => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };

    case 'CLEAR_GROUP_BUY': {
      const filteredGroupBuy = state.items.filter(item => item.type !== 'group-buy');
      return {
        ...state,
        items: filteredGroupBuy,
        total: filteredGroupBuy.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: filteredGroupBuy.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'CLEAR_REGIONAL_GROUP': {
      const filteredRegional = state.items.filter(item => item.type !== 'regional-group');
      return {
        ...state,
        items: filteredRegional,
        total: filteredRegional.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: filteredRegional.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'CLEAR_SUBGROUP': {
      const filteredSubgroup = state.items.filter(item => item.type !== 'subgroup');
      return {
        ...state,
        items: filteredSubgroup,
        total: filteredSubgroup.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: filteredSubgroup.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'CLEAR_INDIVIDUAL': {
      const filteredIndividual = state.items.filter(item => item.type !== 'individual');
      return {
        ...state,
        items: filteredIndividual,
        total: filteredIndividual.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: filteredIndividual.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <CartContext value={contextValue}>
      {children}
    </CartContext>
  );
};

export const useCart = () => {
  const context = use(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
