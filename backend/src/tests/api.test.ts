import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server';
import { orderStore } from '../store/orderStore';

describe('Menu API', () => {
  describe('GET /api/menu', () => {
    it('should return all menu items', async () => {
      const response = await request(app).get('/api/menu');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter menu items by category', async () => {
      const response = await request(app).get('/api/menu?category=Pizza');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((item: any) => {
        expect(item.category).toBe('Pizza');
      });
    });

    it('should search menu items by name', async () => {
      const response = await request(app).get('/api/menu?search=pizza');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/menu/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app).get('/api/menu/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toContain('Pizza');
      expect(response.body.data).toContain('Burgers');
    });
  });

  describe('GET /api/menu/:id', () => {
    it('should return a single menu item', async () => {
      const response = await request(app).get('/api/menu/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.name).toBe('Margherita Pizza');
    });

    it('should return 404 for non-existent menu item', async () => {
      const response = await request(app).get('/api/menu/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Menu item not found');
    });
  });
});

const mongoEnabled = Boolean(process.env.MONGODB_URI);
const orderDescribe = mongoEnabled ? describe : describe.skip;

orderDescribe('Order API', () => {
  beforeEach(async () => {
    await orderStore.clearAll();
  });

  afterEach(async () => {
    await orderStore.clearAll();
  });

  const validOrderData = {
    items: [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella cheese, basil',
        price: 14.99,
        image: 'https://example.com/pizza.jpg',
        category: 'Pizza',
        rating: 4.8,
        prepTime: '20-25 min',
        quantity: 2
      }
    ],
    deliveryDetails: {
      name: 'John Doe',
      address: '123 Main St, City, State 12345',
      phone: '2345678900'
    }
  };

  describe('POST /api/orders', () => {
    it('should create a new order with valid data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.total).toBe(29.98); // 14.99 * 2
    });

    it('should return 400 for empty cart', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: [],
          deliveryDetails: validOrderData.deliveryDetails
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('at least one item');
    });

    it('should return 400 for missing delivery details', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: validOrderData.items,
          deliveryDetails: {
            name: '',
            address: '',
            phone: ''
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate phone number format', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: validOrderData.items,
          deliveryDetails: {
            ...validOrderData.deliveryDetails,
            phone: '123'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('10 digits');
    });

    it('should accept orders even with invalid email', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: validOrderData.items,
          deliveryDetails: {
            ...validOrderData.deliveryDetails,
            email: 'invalid-email'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/orders', () => {
    it('should return empty array when no orders exist', async () => {
      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all orders', async () => {
      // Create an order first
      await request(app).post('/api/orders').send(validOrderData);

      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return an order by ID', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      const orderId = createResponse.body.data.id;

      const response = await request(app).get(`/api/orders/${orderId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(orderId);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app).get('/api/orders/ORD-NONEXISTENT');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('confirmed');
    });

    it('should allow sequential status updates', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      const orderId = createResponse.body.data.id;

      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'confirmed' });

      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'preparing' });

      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'out_for_delivery' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('out_for_delivery');
    });

    it('should reject invalid status transition', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'delivered' }); // Skip statuses

      expect(response.status).toBe(400);
    });

    it('should reject invalid status value', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/orders/:id/status-updates', () => {
    it('should return status updates for an order', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      const orderId = createResponse.body.data.id;

      const response = await request(app).get(`/api/orders/${orderId}/status-updates`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete an order', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .send(validOrderData);

      const orderId = createResponse.body.data.id;

      const response = await request(app).delete(`/api/orders/${orderId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app).delete('/api/orders/ORD-NONEXISTENT');

      expect(response.status).toBe(404);
    });
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('FoodHub API is running');
  });
});

describe('Error Handling', () => {
  it('should return 404 for unknown endpoint', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
