
import { useState, useMemo } from "react";
import { Domain } from "@/types";

interface UsePaginationProps {
  items: Domain[];
  itemsPerPage: number;
}

export const usePagination = ({ items, itemsPerPage }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    setCurrentPage,
    paginatedItems,
    totalPages,
    resetPage
  };
};
