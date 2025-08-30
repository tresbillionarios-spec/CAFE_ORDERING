# QR Scanner Trios - API Documentation

## Overview

This document provides comprehensive API documentation for the QR Scanner Trios system. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication Endpoints

### POST /api/auth/register

Register a new cafe owner account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cafe owner registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "cafe_owner"
    },
    "token": "jwt_token_here"
  }
}
```

**Status Codes:**
- 201: Created successfully
- 400: Bad request (validation error)
- 409: Email already exists

### POST /api/auth/login

Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "cafe_owner",
      "cafe": {
        "id": "cafe_uuid",
        "name": "Coffee Corner",
        "address": "123 Main St"
      }
    },
    "token": "jwt_token_here"
  }
}
```

**Status Codes:**
- 200: Login successful
- 401: Invalid credentials
- 400: Bad request

### GET /api/auth/me

Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "cafe_owner",
      "cafe": {
        "id": "cafe_uuid",
        "name": "Coffee Corner",
        "address": "123 Main St",
        "phone": "+1234567890",
        "description": "A cozy coffee shop"
      }
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

## Cafe Management Endpoints

### POST /api/cafes

Create a new cafe (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Coffee Corner",
  "address": "123 Main Street, City",
  "phone": "+1234567890",
  "description": "A cozy coffee shop"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cafe created successfully",
  "data": {
    "cafe": {
      "id": "cafe_uuid",
      "name": "Coffee Corner",
      "address": "123 Main Street, City",
      "phone": "+1234567890",
      "description": "A cozy coffee shop",
      "owner_id": "user_uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Status Codes:**
- 201: Created successfully
- 400: Bad request
- 401: Unauthorized

### GET /api/cafes/:id

Get cafe details (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "cafe": {
      "id": "cafe_uuid",
      "name": "Coffee Corner",
      "address": "123 Main Street, City",
      "phone": "+1234567890",
      "description": "A cozy coffee shop"
    }
  }
}
```

**Status Codes:**
- 200: Success
- 404: Cafe not found

### PUT /api/cafes/:id

Update cafe information (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Coffee Corner",
  "address": "456 New Street, City",
  "phone": "+1234567890",
  "description": "An updated cozy coffee shop"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cafe updated successfully",
  "data": {
    "cafe": {
      "id": "cafe_uuid",
      "name": "Updated Coffee Corner",
      "address": "456 New Street, City",
      "phone": "+1234567890",
      "description": "An updated cozy coffee shop",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Status Codes:**
- 200: Updated successfully
- 400: Bad request
- 401: Unauthorized
- 404: Cafe not found

### POST /api/cafes/:id/qr

Generate QR code for cafe (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_code": {
      "url": "https://mycafe.com/menu/cafe_uuid",
      "data": "https://mycafe.com/menu/cafe_uuid",
      "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }
}
```

**Status Codes:**
- 200: QR code generated successfully
- 401: Unauthorized
- 404: Cafe not found

### GET /api/cafes/:id/dashboard

Get cafe dashboard data (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dashboard": {
      "orders": {
        "total": 45,
        "pending": 3,
        "preparing": 2,
        "ready": 1,
        "completed": 39
      },
      "revenue": {
        "total": 1250.00,
        "today": 150.00,
        "this_week": 450.00,
        "this_month": 1250.00
      },
      "menu": {
        "total": 15,
        "available": 12,
        "unavailable": 3
      },
      "recent_orders": [
        {
          "id": "order_uuid",
          "order_number": "123",
          "customer_name": "John Doe",
          "total_amount": 45.00,
          "status": "ready",
          "created_at": "2024-01-01T14:30:00Z"
        }
      ]
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Cafe not found

## Menu Management Endpoints

### GET /api/cafes/:id/menu

Get cafe menu (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "menu": [
      {
        "id": "menu_uuid",
        "name": "Cappuccino",
        "description": "Rich espresso with steamed milk",
        "price": 45.00,
        "category": "Beverages",
        "is_available": true,
        "image_url": "https://example.com/cappuccino.jpg"
      }
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 404: Cafe not found

### POST /api/menu

Add new menu item (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Cappuccino",
  "description": "Rich espresso with steamed milk",
  "price": 45.00,
  "category": "Beverages",
  "is_available": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item added successfully",
  "data": {
    "menu_item": {
      "id": "menu_uuid",
      "name": "Cappuccino",
      "description": "Rich espresso with steamed milk",
      "price": 45.00,
      "category": "Beverages",
      "is_available": true,
      "cafe_id": "cafe_uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Status Codes:**
- 201: Created successfully
- 400: Bad request
- 401: Unauthorized

### PUT /api/menu/:id

Update menu item (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Cappuccino",
  "description": "Updated description",
  "price": 50.00,
  "category": "Beverages",
  "is_available": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "menu_item": {
      "id": "menu_uuid",
      "name": "Updated Cappuccino",
      "description": "Updated description",
      "price": 50.00,
      "category": "Beverages",
      "is_available": false,
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Status Codes:**
- 200: Updated successfully
- 400: Bad request
- 401: Unauthorized
- 404: Menu item not found

### DELETE /api/menu/:id

Delete menu item (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

**Status Codes:**
- 200: Deleted successfully
- 401: Unauthorized
- 404: Menu item not found

## Order Management Endpoints

### POST /api/orders

Create new order (public endpoint).

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "items": [
    {
      "menu_id": "menu_uuid",
      "quantity": 2,
      "special_instructions": "Extra hot"
    }
  ],
  "table_number": 5,
  "special_instructions": "Please deliver to table"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "id": "order_uuid",
      "order_number": "12345",
      "customer_name": "John Doe",
      "customer_phone": "+1234567890",
      "total_amount": 90.00,
      "status": "pending",
      "special_instructions": "Please deliver to table",
      "cafe_id": "cafe_uuid",
      "table_id": "table_uuid",
      "created_at": "2024-01-01T14:30:00Z",
      "items": [
        {
          "id": "order_item_uuid",
          "menu_item": {
            "name": "Cappuccino",
            "description": "Rich espresso with steamed milk"
          },
          "quantity": 2,
          "price": 45.00,
          "special_instructions": "Extra hot"
        }
      ]
    }
  }
}
```

**Status Codes:**
- 201: Order created successfully
- 400: Bad request
- 404: Cafe or menu item not found

### GET /api/orders

Get orders for cafe (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status`: Filter by status (pending, confirmed, preparing, ready, completed, cancelled)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_uuid",
        "order_number": "12345",
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "total_amount": 90.00,
        "status": "pending",
        "table_number": 5,
        "created_at": "2024-01-01T14:30:00Z",
        "items": [
          {
            "menu_item": {
              "name": "Cappuccino"
            },
            "quantity": 2,
            "price": 45.00
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

### GET /api/orders/:id

Get order details (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_uuid",
      "order_number": "12345",
      "customer_name": "John Doe",
      "customer_phone": "+1234567890",
      "total_amount": 90.00,
      "status": "pending",
      "special_instructions": "Please deliver to table",
      "table_number": 5,
      "created_at": "2024-01-01T14:30:00Z",
      "items": [
        {
          "id": "order_item_uuid",
          "menu_item": {
            "name": "Cappuccino",
            "description": "Rich espresso with steamed milk"
          },
          "quantity": 2,
          "price": 45.00,
          "special_instructions": "Extra hot"
        }
      ]
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Order not found

### PUT /api/orders/:id/status

Update order status (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": {
      "id": "order_uuid",
      "order_number": "12345",
      "status": "preparing",
      "updated_at": "2024-01-01T14:35:00Z"
    }
  }
}
```

**Status Codes:**
- 200: Updated successfully
- 400: Bad request
- 401: Unauthorized
- 404: Order not found

### GET /api/orders/track/:orderNumber

Track order status (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_uuid",
      "order_number": "12345",
      "customer_name": "John Doe",
      "total_amount": 90.00,
      "status": "preparing",
      "table_number": 5,
      "created_at": "2024-01-01T14:30:00Z",
      "estimated_completion": "2024-01-01T14:45:00Z",
      "items": [
        {
          "menu_item": {
            "name": "Cappuccino"
          },
          "quantity": 2,
          "price": 45.00
        }
      ]
    }
  }
}
```

**Status Codes:**
- 200: Success
- 404: Order not found

## Table Management Endpoints

### POST /api/tables/cafe/:cafeId/bulk

Create multiple tables with QR codes (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "tableCount": 10,
  "startNumber": 1,
  "capacity": 4,
  "location": "main"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tables created successfully",
  "data": {
    "tables": [
      {
        "id": "table_uuid",
        "table_number": 1,
        "name": "Table 1",
        "capacity": 4,
        "location": "main",
        "is_active": true,
        "qr_code_url": "https://mycafe.com/menu/cafe_uuid?table=1",
        "qr_code_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ]
  }
}
```

**Status Codes:**
- 201: Created successfully
- 400: Bad request
- 401: Unauthorized
- 404: Cafe not found

### GET /api/tables/cafe/:cafeId

Get all tables for cafe (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "table_uuid",
        "table_number": 1,
        "name": "Table 1",
        "capacity": 4,
        "location": "main",
        "is_active": true,
        "qr_code_url": "https://mycafe.com/menu/cafe_uuid?table=1",
        "qr_code_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Cafe not found

### POST /api/tables/:id/regenerate-qr

Regenerate QR code for specific table (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "QR code regenerated successfully",
  "data": {
    "table": {
      "id": "table_uuid",
      "table_number": 1,
      "qr_code_url": "https://mycafe.com/menu/cafe_uuid?table=1",
      "qr_code_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }
}
```

**Status Codes:**
- 200: QR code regenerated successfully
- 401: Unauthorized
- 404: Table not found

## Error Handling

### Common Error Codes

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error - Server error

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  }
}
```

### Validation Errors

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **QR code generation**: 10 requests per 15 minutes

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination metadata is included in responses:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## File Upload

### Image Upload for Menu Items

**Endpoint:** `POST /api/menu/:id/image`

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
Form data with 'image' field containing the file
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image_url": "https://example.com/uploads/menu-item-image.jpg"
  }
}
```

## Webhooks (Future Enhancement)

### Order Status Updates

**Endpoint:** `POST /webhooks/order-status`

**Headers:**
```
X-Webhook-Signature: <signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "order.status_updated",
  "data": {
    "order_id": "order_uuid",
    "order_number": "12345",
    "status": "ready",
    "updated_at": "2024-01-01T14:35:00Z"
  }
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://your-backend-domain.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Get cafe menu
const getMenu = async (cafeId) => {
  try {
    const response = await api.get(`/cafes/${cafeId}/menu`);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu:', error.response.data);
    throw error;
  }
};

// Example: Place order
const placeOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error.response.data);
    throw error;
  }
};
```

### Python

```python
import requests

class QRScannerAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        
        if token:
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
    
    def get_menu(self, cafe_id):
        response = self.session.get(f'{self.base_url}/cafes/{cafe_id}/menu')
        response.raise_for_status()
        return response.json()
    
    def place_order(self, order_data):
        response = self.session.post(f'{self.base_url}/orders', json=order_data)
        response.raise_for_status()
        return response.json()

# Usage
api = QRScannerAPI('https://your-backend-domain.com/api')
menu = api.get_menu('cafe_uuid')
```

## Testing

### Postman Collection

Import the following collection for testing:

```json
{
  "info": {
    "name": "QR Scanner Trios API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/auth/register",
              "host": ["{{base_url}}"],
              "path": ["auth", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

### cURL Examples

```bash
# Register new user
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get cafe menu (public)
curl -X GET https://your-backend-domain.com/api/cafes/cafe_uuid/menu

# Place order (public)
curl -X POST https://your-backend-domain.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "items": [
      {
        "menu_id": "menu_uuid",
        "quantity": 2
      }
    ],
    "table_number": 5
  }'
```

This comprehensive API documentation provides all the necessary information for integrating with the QR Scanner Trios system, including authentication, endpoints, error handling, and examples.
