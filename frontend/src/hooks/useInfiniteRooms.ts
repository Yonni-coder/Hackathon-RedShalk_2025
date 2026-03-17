import { Room } from '@/types/room';
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteRoomsProps {
  initialRooms: Room[];
  filterType?: string;
}

export function useInfiniteRooms({ initialRooms, filterType }: UseInfiniteRoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [displayedRooms, setDisplayedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const ITEMS_PER_PAGE = 9;

  // Initialize rooms
  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  // Filter rooms based on type
  useEffect(() => {
    if (filterType && filterType !== 'all') {
      const filtered = rooms.filter(room => room.type_name === filterType);
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms(rooms);
    }
    setPage(1);
    setHasMore(true);
  }, [rooms, filterType]);

  // Update displayed rooms when filter or page changes
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    const newDisplayedRooms = filteredRooms.slice(startIndex, endIndex);
    
    setDisplayedRooms(newDisplayedRooms);
    setHasMore(endIndex < filteredRooms.length);
  }, [filteredRooms, page]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setPage(prev => prev + 1);
      setLoading(false);
    }, 500);
  }, [loading, hasMore]);

  return {
    rooms: displayedRooms,
    loading,
    hasMore,
    loadMore,
  };
}