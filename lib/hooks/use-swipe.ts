'use client';

import { useRef, useState, useCallback, TouchEvent } from 'react';

export type SwipeDirection = 'left' | 'right' | null;

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number; // Distancia mínima en px para considerar un swipe
  maxSwipeTime?: number; // Tiempo máximo en ms para considerar un swipe
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
  swipeDirection: SwipeDirection;
  swipeDistance: number;
  swipeOffset: number; // Desplazamiento actual en px (puede ser negativo)
  isSwipping: boolean;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 80,
  maxSwipeTime = 500,
}: SwipeOptions): SwipeHandlers {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0); // Desplazamiento actual
  const [isSwipping, setIsSwipping] = useState(false);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setSwipeDirection(null);
    setSwipeDistance(0);
    setSwipeOffset(0);
    setIsSwipping(false);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartX.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Solo considerar swipe horizontal si el movimiento horizontal es mayor que el vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      setIsSwipping(true);
      setSwipeDistance(Math.abs(diffX));
      setSwipeOffset(diffX); // Guardar el desplazamiento real (con signo)
      
      if (diffX > 0) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection('left');
      }
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current) return;

    const touchEndTime = Date.now();
    const swipeTime = touchEndTime - touchStartTime.current;

    // Solo ejecutar callback si cumple las condiciones
    if (swipeTime <= maxSwipeTime && swipeDistance >= minSwipeDistance) {
      if (swipeDirection === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (swipeDirection === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    }

    // Reset
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchStartTime.current = 0;
    setSwipeDirection(null);
    setSwipeDistance(0);
    setSwipeOffset(0);
    setIsSwipping(false);
  }, [swipeDirection, swipeDistance, minSwipeDistance, maxSwipeTime, onSwipeLeft, onSwipeRight]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swipeDirection,
    swipeDistance,
    swipeOffset,
    isSwipping,
  };
}

