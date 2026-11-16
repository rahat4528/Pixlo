export interface QueryFilters {
  [field: string]: any;
}

export interface QueryOptions {
  filters?: QueryFilters;
  sort?: string; // e.g. "createdAt:desc", "price:asc"
  page?: number;
  pageSize?: number;
  fields?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

export class DynamicQueryEngine {
  /**
   * Filter, sort, paginate, and project dynamic records in memory
   */
  static executeQuery<T extends Record<string, any>>(
    records: T[],
    options: QueryOptions = {}
  ): PaginatedResult<T> {
    let result = [...records];

    // 1. Filtering
    if (options.filters && Object.keys(options.filters).length > 0) {
      result = result.filter((item) => {
        for (const [key, filterVal] of Object.entries(options.filters!)) {
          const itemVal = item[key];

          // Complex operator object: e.g. { $gt: 10 }
          if (typeof filterVal === 'object' && filterVal !== null && !Array.isArray(filterVal)) {
            for (const [op, opVal] of Object.entries(filterVal)) {
              switch (op) {
                case '$eq':
                  if (itemVal !== opVal) return false;
                  break;
                case '$ne':
                  if (itemVal === opVal) return false;
                  break;
                case '$gt':
                  if (!(itemVal > (opVal as any))) return false;
                  break;
                case '$gte':
                  if (!(itemVal >= (opVal as any))) return false;
                  break;
                case '$lt':
                  if (!(itemVal < (opVal as any))) return false;
                  break;
                case '$lte':
                  if (!(itemVal <= (opVal as any))) return false;
                  break;
                case '$contains':
                  if (typeof itemVal !== 'string' || !itemVal.toLowerCase().includes(String(opVal).toLowerCase()))
                    return false;
                  break;
                case '$in':
                  if (!Array.isArray(opVal) || !opVal.includes(itemVal)) return false;
                  break;
              }
            }
          } else {
            // Direct equality check
            if (itemVal !== filterVal) {
              return false;
            }
          }
        }
        return true;
      });
    }

    // 2. Sorting
    if (options.sort) {
      const [sortField, sortDir] = options.sort.split(':');
      const isDesc = sortDir?.toLowerCase() === 'desc';

      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA > valB) return isDesc ? -1 : 1;
        return isDesc ? 1 : -1;
      });
    }

    const total = result.length;
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, Math.min(100, options.pageSize || 10));
    const pageCount = Math.ceil(total / pageSize);

    // 3. Pagination
    const startIndex = (page - 1) * pageSize;
    const paginated = result.slice(startIndex, startIndex + pageSize);

    // 4. Projection
    let projected = paginated;
    if (options.fields && options.fields.length > 0) {
      const keepFields = new Set([...options.fields, 'id']);
      projected = paginated.map((item) => {
        const obj: any = {};
        for (const f of keepFields) {
          if (item[f] !== undefined) obj[f] = item[f];
        }
        return obj;
      });
    }

    return {
      data: projected,
      meta: {
        page,
        pageSize,
        total,
        pageCount,
      },
    };
  }
}
