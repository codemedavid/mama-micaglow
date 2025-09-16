'use client';

import type { CartItem } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';

export const useCartActions = () => {
  const { dispatch } = useCart();

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, quantity: 1 },
    });
  };

  const addIndividualItem = (product: {
    id: string;
    name: string;
    pricePerBox: number;
    imageUrl?: string;
    vialsPerBox: number;
  }) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.pricePerBox,
      type: 'individual',
      imageUrl: product.imageUrl,
      vialsPerBox: product.vialsPerBox,
    });
  };

  const addGroupBuyItem = (product: {
    id: string;
    name: string;
    pricePerVial: number;
    batchId: string;
    imageUrl?: string;
  }) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.pricePerVial,
      type: 'group-buy',
      imageUrl: product.imageUrl,
      batchId: product.batchId,
    });
  };

  const addRegionalGroupItem = (product: {
    id: string;
    name: string;
    pricePerVial: number;
    regionalHostId: string;
    imageUrl?: string;
  }) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.pricePerVial,
      type: 'regional-group',
      imageUrl: product.imageUrl,
      regionalHostId: product.regionalHostId,
    });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const clearGroupBuy = () => {
    dispatch({ type: 'CLEAR_GROUP_BUY' });
  };

  const clearRegionalGroup = () => {
    dispatch({ type: 'CLEAR_REGIONAL_GROUP' });
  };

  return {
    addToCart,
    addIndividualItem,
    addGroupBuyItem,
    addRegionalGroupItem,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearGroupBuy,
    clearRegionalGroup,
  };
};
