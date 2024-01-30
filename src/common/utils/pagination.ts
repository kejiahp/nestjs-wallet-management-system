interface PaginationInfo {
  limit: number;
  page: number;
  data: any[];
  total_no_of_items: number;
  next_page: number;
  previous_page: number;
  current_page_count: number;
  total_no_of_pages: number;
}

function calculatePagination(
  items: any[],
  total_no_of_items: number,
  page: number,
  limit: number,
): PaginationInfo {
  const total_no_of_pages = Math.ceil(total_no_of_items / limit);
  return {
    limit: limit,
    page: page,
    data: items,
    next_page: page + 1,
    previous_page: page - 1,
    current_page_count: items.length,
    total_no_of_pages,
    total_no_of_items: total_no_of_items,
  };
}

export default calculatePagination;
