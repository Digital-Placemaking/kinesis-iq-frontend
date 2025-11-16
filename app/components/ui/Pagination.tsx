/**
 * Pagination Component
 * Modern pagination using shadcn Button components
 * Reusable pagination component with page numbers, navigation buttons, and item count display
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pagination Constants
 * Configure pagination behavior here
 */
export const PAGINATION = {
  // Number of items per page
  ITEMS_PER_PAGE: 10,
  // Maximum number of page buttons to show
  MAX_PAGE_BUTTONS: 5,
  // Minimum number of items to show pagination
  MIN_ITEMS_FOR_PAGINATION: 1,
} as const;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Reusable pagination component
 * Displays page numbers and navigation buttons
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}: PaginationProps) {
  // Don't show pagination if there's only one page, no items, or 10 or fewer items
  if (totalPages <= 1 || totalItems === 0 || totalItems <= itemsPerPage) {
    return null;
  }

  // Calculate page range to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxButtons = PAGINATION.MAX_PAGE_BUTTONS;
    const halfButtons = Math.floor(maxButtons / 2);

    if (totalPages <= maxButtons) {
      // Show all pages if total is less than max buttons
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - halfButtons);
      let end = Math.min(totalPages - 1, currentPage + halfButtons);

      // Adjust if we're near the start
      if (currentPage <= halfButtons + 1) {
        end = Math.min(maxButtons, totalPages - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - halfButtons) {
        start = Math.max(2, totalPages - maxButtons + 1);
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add page numbers in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range for display
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 sm:flex-row sm:justify-between",
        className
      )}
    >
      {/* Item count info */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-sm text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
