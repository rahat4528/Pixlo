import { DynamicQueryEngine } from '../src/core/dynamic-query';

describe('DynamicQueryEngine', () => {
  const sampleProducts = [
    { id: '1', title: 'Mechanical Keyboard', price: 120, category: 'Hardware', stock: 15 },
    { id: '2', title: 'Wireless Mouse', price: 45, category: 'Hardware', stock: 50 },
    { id: '3', title: '4K Monitor', price: 450, category: 'Electronics', stock: 8 },
    { id: '4', title: 'USB-C Cable', price: 15, category: 'Accessories', stock: 100 },
    { id: '5', title: 'Noise Cancelling Headphones', price: 280, category: 'Electronics', stock: 12 },
  ];

  it('should filter by direct field equality', () => {
    const result = DynamicQueryEngine.executeQuery(sampleProducts, {
      filters: { category: 'Electronics' },
    });
    expect(result.data.length).toBe(2);
    expect(result.meta.total).toBe(2);
    expect(result.data.every((p) => p.category === 'Electronics')).toBe(true);
  });

  it('should filter using $gt and $contains operators', () => {
    const result = DynamicQueryEngine.executeQuery(sampleProducts, {
      filters: {
        price: { $gt: 100 },
        title: { $contains: 'Keyboard' },
      },
    });
    expect(result.data.length).toBe(1);
    expect(result.data[0].title).toBe('Mechanical Keyboard');
  });

  it('should sort records in descending order', () => {
    const result = DynamicQueryEngine.executeQuery(sampleProducts, {
      sort: 'price:desc',
    });
    expect(result.data[0].price).toBe(450); // Monitor
    expect(result.data[result.data.length - 1].price).toBe(15); // Cable
  });

  it('should paginate results accurately', () => {
    const result = DynamicQueryEngine.executeQuery(sampleProducts, {
      page: 2,
      pageSize: 2,
    });
    expect(result.data.length).toBe(2);
    expect(result.meta.page).toBe(2);
    expect(result.meta.total).toBe(5);
    expect(result.meta.pageCount).toBe(3);
  });

  it('should project only requested fields', () => {
    const result = DynamicQueryEngine.executeQuery(sampleProducts, {
      fields: ['title', 'price'],
    });
    expect(result.data[0].title).toBeDefined();
    expect(result.data[0].price).toBeDefined();
    expect((result.data[0] as any).category).toBeUndefined();
  });
});
