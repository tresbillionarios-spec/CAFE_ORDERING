# QR Code System for Cafe Management

## Overview

The QR code system allows cafe owners to generate unique QR codes for each table in their establishment. When customers scan these QR codes, they are taken directly to the cafe's menu with their table number automatically associated with their order.

## Features

### 1. Table Management with QR Codes
- **Bulk Table Creation**: Create multiple tables at once (up to 100 tables)
- **Automatic QR Generation**: Each table gets a unique QR code automatically
- **Table Configuration**: Set table numbers, capacity, and location
- **QR Code Storage**: QR codes are stored in the database as base64 images

### 2. QR Code Functionality
- **Unique URLs**: Each QR code contains a unique URL with table number
- **Direct Menu Access**: Scanning takes customers directly to the menu
- **Table Association**: Orders are automatically linked to the correct table
- **Download Options**: Download individual or all QR codes as PNG files

### 3. Order Flow
1. Customer scans QR code at their table
2. QR code opens menu page with table number in URL
3. Customer browses menu and adds items to cart
4. Table number is preserved throughout the ordering process
5. Order is submitted with table number for accurate delivery

## Technical Implementation

### Backend (Node.js/Express)

#### Database Schema
```sql
-- Tables table with QR code fields
CREATE TABLE tables (
  id UUID PRIMARY KEY,
  table_number INTEGER NOT NULL,
  name VARCHAR(255),
  capacity INTEGER DEFAULT 4,
  location VARCHAR(255) DEFAULT 'main',
  is_active BOOLEAN DEFAULT true,
  qr_code_url TEXT,
  qr_code_data TEXT,
  qr_code_image TEXT, -- Base64 encoded PNG
  cafe_id UUID REFERENCES cafes(id)
);
```

#### API Endpoints

**Create Tables in Bulk**
```
POST /api/tables/cafe/:cafeId/bulk
```
- Creates multiple tables with QR codes
- Generates QR codes using the `qrcode` library
- Stores QR codes as base64 images in database

**Get Tables for Cafe**
```
GET /api/tables/cafe/:cafeId
```
- Returns all tables with their QR codes
- Includes QR code images and URLs

**Regenerate QR Code**
```
POST /api/tables/:id/regenerate-qr
```
- Regenerates QR code for a specific table
- Updates the QR code image and data

### Frontend (React)

#### Components

**TableSetupModal**
- Modal for setting up tables during cafe creation
- Allows configuration of table count, start number, capacity, and location
- Generates QR codes and shows preview

**QRCodeManagementPage**
- Dedicated page for managing QR codes
- Bulk QR code generation
- Individual QR code download and regeneration
- Copy URL functionality

**BulkQRCodeGenerator**
- Component for generating multiple QR codes at once
- Progress tracking during generation
- Bulk download functionality

**QRCodeGenerator**
- Individual QR code generator component
- Download and copy URL options

#### QR Code URL Structure
```
https://yourdomain.com/menu/{cafeId}?table={tableNumber}
```

Example:
```
https://mycafe.com/menu/123e4567-e89b-12d3-a456-426614174000?table=5
```

## Usage Guide

### For Cafe Owners

#### 1. Setting Up Tables During Cafe Creation
1. Create your cafe account
2. Fill in cafe details (name, address, etc.)
3. After cafe creation, the table setup modal appears
4. Configure:
   - Number of tables (1-100)
   - Starting table number
   - Capacity per table
   - Location (main, outdoor, etc.)
5. Click "Generate Tables & QR Codes"
6. Preview generated QR codes
7. Click "Save Tables" to complete setup

#### 2. Managing QR Codes
1. Navigate to "QR Codes" in the sidebar
2. View all existing tables and their QR codes
3. Use bulk generation for additional tables
4. Download individual QR codes or all at once
5. Copy URLs for sharing or testing
6. Regenerate QR codes if needed

#### 3. Printing and Display
1. Download QR codes as PNG files
2. Print QR codes and place them on tables
3. Ensure QR codes are clearly visible and scannable
4. Consider laminating for durability

### For Customers

#### 1. Ordering Process
1. Scan the QR code on your table
2. Your phone opens the cafe's menu
3. Browse menu items by category
4. Add items to your cart
5. Review your order and add special instructions
6. Complete the order with your details
7. Order is automatically associated with your table

#### 2. Order Tracking
1. After placing order, you'll receive an order number
2. Use the order number to track your order status
3. Kitchen staff will prepare and deliver to your table

## Benefits

### For Cafe Owners
- **Reduced Staff Workload**: No need for staff to take orders manually
- **Faster Service**: Orders go directly to kitchen without waiting
- **Accurate Orders**: Eliminates order mistakes and miscommunication
- **Table Tracking**: Know exactly which table placed each order
- **Contactless Service**: Improves hygiene and customer safety
- **24/7 Menu Access**: Customers can view menu anytime

### For Customers
- **Convenience**: Order at your own pace without waiting for staff
- **Accuracy**: No misheard orders or mistakes
- **Hygiene**: Contactless ordering reduces physical contact
- **Detailed Menu**: See full menu with descriptions, prices, and dietary info
- **Special Instructions**: Add custom requests easily

## Technical Requirements

### Backend Dependencies
```json
{
  "qrcode": "^1.5.3",
  "sequelize": "^6.35.0",
  "express": "^4.18.2"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "lucide-react": "^0.263.1"
}
```

## Security Considerations

1. **QR Code URLs**: URLs contain cafe ID and table number - ensure proper access controls
2. **Table Ownership**: Only cafe owners can manage their tables and QR codes
3. **Order Validation**: Verify table numbers are valid for the cafe
4. **Rate Limiting**: Implement rate limiting on QR code generation endpoints

## Troubleshooting

### Common Issues

**QR Code Not Scanning**
- Ensure QR code is clearly printed and visible
- Check that QR code size is appropriate (minimum 2cm x 2cm)
- Verify QR code is not damaged or faded

**Orders Not Associated with Table**
- Check that table number is properly passed in URL
- Verify table exists in database
- Ensure QR code URL is correct

**QR Code Generation Fails**
- Check backend logs for errors
- Verify `qrcode` library is properly installed
- Ensure sufficient memory for bulk generation

### Support

For technical support or questions about the QR code system, please refer to the main project documentation or contact the development team.

## Future Enhancements

1. **Dynamic QR Codes**: QR codes that update based on menu changes
2. **Analytics**: Track QR code scans and usage patterns
3. **Custom Branding**: Add cafe logo to QR codes
4. **Multi-language Support**: QR codes for different languages
5. **Offline Support**: QR codes that work without internet
6. **Integration**: Connect with POS systems and payment gateways
