export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export function normalizePageResponse<T>(value: unknown): PageResponse<T> {
  if (Array.isArray(value)) {
    return {
      content: value as T[],
      page: 0,
      size: value.length,
      totalElements: value.length,
      totalPages: value.length ? 1 : 0,
      first: true,
      last: true
    };
  }

  const response = value && typeof value === 'object'
    ? value as Partial<PageResponse<T>>
    : {};
  const content = Array.isArray(response.content) ? response.content : [];
  const totalElements = Number.isFinite(response.totalElements) ? response.totalElements! : content.length;

  return {
    content,
    page: Number.isFinite(response.page) ? response.page! : 0,
    size: Number.isFinite(response.size) ? response.size! : content.length,
    totalElements,
    totalPages: Number.isFinite(response.totalPages) ? response.totalPages! : (content.length ? 1 : 0),
    first: response.first ?? true,
    last: response.last ?? true
  };
}