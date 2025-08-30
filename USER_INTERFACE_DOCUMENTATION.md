# QR Scanner Trios - User Interface Documentation

## Overview

This document provides comprehensive documentation of the user interface for the QR Scanner Trios system, including detailed mockups, user flows, and design specifications for both cafe owners and customers.

## Design System

### Color Palette

```css
/* Primary Colors */
--primary-50: #f0f9ff
--primary-100: #e0f2fe
--primary-500: #0ea5e9
--primary-600: #0284c7
--primary-700: #0369a1

/* Neutral Colors */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827

/* Status Colors */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Typography

```css
/* Headings */
h1: 2.25rem (36px) - font-bold
h2: 1.875rem (30px) - font-semibold
h3: 1.5rem (24px) - font-medium
h4: 1.25rem (20px) - font-medium

/* Body Text */
body: 1rem (16px) - font-normal
small: 0.875rem (14px) - font-normal
```

### Component Library

#### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-lg
  hover:bg-primary-700 focus:ring-2 focus:ring-primary-500
  transition-colors duration-200
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg
  hover:bg-gray-300 focus:ring-2 focus:ring-gray-500
  transition-colors duration-200
}

/* Danger Button */
.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg
  hover:bg-red-700 focus:ring-2 focus:ring-red-500
  transition-colors duration-200
}
```

#### Cards
```css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200
}

.card-body {
  @apply px-6 py-4
}
```

## Public Pages

### 1. Landing Page (HomePage)

**Purpose**: Introduce the system to potential cafe owners and customers

**Target Users**: Cafe owners, potential customers, general visitors

**Key Features**:
- Hero section with value proposition
- Feature highlights with icons
- Call-to-action buttons
- Professional design with coffee theme

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ☕ QR Ordering                    [Cafe Login]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Transform Your Cafe with                     │
│                       QR Ordering                               │
│                                                                 │
│         Streamline your cafe operations with our               │
│         innovative QR code ordering system.                    │
│                                                                 │
│         [Get Started]  [Learn more →]                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │    QR Code  │  │   Mobile    │  │   Coffee    │  │Analytics││
│  │ Generation  │  │   Design    │  │ Management  │  │Tracking ││
│  │             │  │             │  │             │  │         ││
│  │ Unique QR   │  │ Mobile-first│  │ Easy menu   │  │ Track   ││
│  │ codes for   │  │ customers   │  │ and updates │  │ orders  ││
│  │ each cafe   │  │ and updates │  │ and updates │  │ & sales ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Ready to get started?                       │
│                                                                 │
│                    [Start Your Free Trial]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. User visits landing page
2. Reads value proposition
3. Clicks "Get Started" or "Cafe Login"
4. Redirected to login/registration

### 2. Cafe Login Page (CafeLoginPage)

**Purpose**: Authenticate cafe owners

**Target Users**: Cafe owners

**Key Features**:
- Login form with email/password
- Registration link
- Error handling
- Remember me functionality

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ☕ QR Ordering System                        │
│                                                                 │
│                    Welcome Back!                               │
│                                                                 │
│                    Sign in to your account                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Email Address                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │                                                     │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                             │ │
│  │  Password                                                   │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │                                                     │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                             │ │
│  │  ☐ Remember me                                             │ │
│  │                                                             │ │
│  │  [Sign In]                                                 │ │
│  │                                                             │ │
│  │  Don't have an account? [Sign up]                          │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. User enters email and password
2. System validates credentials
3. On success: Redirect to dashboard
4. On failure: Show error message

### 3. Customer Menu Page (MenuPage)

**Purpose**: Display menu to customers who scan QR codes

**Target Users**: Customers

**Key Features**:
- Category-based menu display
- Add to cart functionality
- Item details and pricing
- Mobile-optimized design
- Table number display

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ☕ Coffee Corner                    [🛒 Cart (3)]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Categories: [Beverages] [Food] [Desserts]                      │
│                                                                 │
│ Table 5                                                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Beverages                                                       │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☕ Cappuccino                    ₹45.00  [+ Add]            │ │
│ │                                                             │ │
│ │ Rich espresso with steamed milk                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🫖 Green Tea                     ₹25.00  [+ Add]            │ │
│ │                                                             │ │
│ │ Refreshing green tea                                         │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Food                                                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🥪 Club Sandwich                ₹120.00 [+ Add]            │ │
│ │                                                             │ │
│ │ Fresh vegetables with chicken                               │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    [View Cart & Checkout]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Customer scans QR code
2. Menu page opens with table number
3. Customer browses categories
4. Customer adds items to cart
5. Customer proceeds to checkout

### 4. Customer Order Page (OrderPage)

**Purpose**: Complete order process for customers

**Target Users**: Customers

**Key Features**:
- Cart review
- Customer information form
- Special instructions
- Order confirmation

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ☕ Coffee Corner                    [← Back to Menu]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Your Order                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │ 1x Cappuccino                    ₹45.00                     │ │
│ │ 1x Green Tea                     ₹25.00                     │ │
│ │ 1x Club Sandwich                 ₹120.00                    │ │
│ │                                                             │ │
│ │ ────────────────────────────────────────────────────────── │ │
│ │                                                             │ │
│ │ Total:                          ₹190.00                    │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Customer Information                                             │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │ Name:                                                       │ │
│ │ ┌─────────────────────────────────────────────────────┐     │ │
│ │ │                                                     │     │ │
│ │ └─────────────────────────────────────────────────────┘     │ │
│ │                                                             │ │
│ │ Phone:                                                      │ │
│ │ ┌─────────────────────────────────────────────────────┐     │ │
│ │ │                                                     │     │ │
│ │ └─────────────────────────────────────────────────────┘     │ │
│ │                                                             │ │
│ │ Special Instructions:                                       │ │
│ │ ┌─────────────────────────────────────────────────────┐     │ │
│ │ │                                                     │     │ │
│ │ └─────────────────────────────────────────────────────┘     │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                    [Place Order]                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Customer reviews cart
2. Fills in customer information
3. Adds special instructions (optional)
4. Places order
5. Receives order confirmation

### 5. Order Tracking Page (OrderTrackingPage)

**Purpose**: Allow customers to track their order status

**Target Users**: Customers

**Key Features**:
- Order status display
- Real-time updates
- Order details
- Estimated completion time

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ☕ Coffee Corner                    Order #12345                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Order Status                                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │ ● Order Confirmed                                          │ │
│ │ ● Preparing                                                │ │
│ │ ○ Ready for Pickup                                         │ │
│ │ ○ Completed                                                │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Order Details                                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │ Customer: John Doe                                         │ │
│ │ Table: 5                                                   │ │
│ │ Time: 2:30 PM                                              │ │
│ │                                                             │ │
│ │ Items:                                                     │ │
│ │ • 1x Cappuccino                                            │ │
│ │ • 1x Green Tea                                             │ │
│ │ • 1x Club Sandwich                                         │ │
│ │                                                             │ │
│ │ Total: ₹190.00                                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Estimated completion: 10-15 minutes                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Customer enters order number
2. System displays order status
3. Customer monitors progress
4. Order completion notification

## Protected Pages (Cafe Owner)

### 6. Cafe Dashboard (CafeDashboardPage)

**Purpose**: Main control center for cafe owners

**Target Users**: Cafe owners

**Key Features**:
- Statistics cards (orders, revenue, pending orders, menu items)
- QR code display
- Recent orders table
- Real-time updates

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard                    Welcome back, John!               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │ 🛒          │ │ 💰          │ │ ⚠️          │ │ ☕          ││
│ │ Total       │ │ Revenue     │ │ Pending     │ │ Menu        ││
│ │ Orders      │ │ ₹1,250      │ │ Orders      │ │ Items       ││
│ │ 45          │ │             │ │ 3           │ │ 12          ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Your QR Code                                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │              ┌─────────────┐                               │ │
│ │              │             │                               │ │
│ │              │   [QR CODE] │                               │ │
│ │              │             │                               │ │
│ │              └─────────────┘                               │ │
│ │                                                             │ │
│ │              Order Number: #12345                           │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Recent Orders                                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order │ Customer │ Amount │ Status │ Time                   │ │
│ │ #123  │ John Doe │ ₹45.00│ Ready  │ 2:30 PM               │ │
│ │ #124  │ Jane Smith│ ₹32.50│ Pending│ 2:25 PM               │ │
│ │ #125  │ Bob Wilson│ ₹78.00│ Prep   │ 2:20 PM               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Cafe owner logs in
2. Dashboard displays key metrics
3. Owner can view QR code
4. Owner monitors recent orders
5. Quick access to other features

### 7. Menu Management (MenuManagementPage)

**Purpose**: Add, edit, and manage menu items

**Target Users**: Cafe owners

**Key Features**:
- Menu items list with categories
- Add/Edit modal forms
- Availability toggles
- Image upload functionality
- Search and filter

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Menu Management              [+ Add Menu Item]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Categories: [All] [Beverages] [Food] [Desserts]                │
│                                                                 │
│ Search: [Search menu items...]                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☕ Cappuccino                    ₹45.00  [Edit] [×]         │ │
│ │                                                             │ │
│ │ Rich espresso with steamed milk                             │ │
│ │ Category: Beverages                                          │ │
│ │ Available: ✅                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🍰 Chocolate Cake                ₹85.00  [Edit] [×]         │ │
│ │                                                             │ │
│ │ Decadent chocolate cake with cream                          │ │
│ │ Category: Desserts                                           │ │
│ │ Available: ✅                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🥪 Club Sandwich                ₹120.00 [Edit] [×]          │ │
│ │                                                             │ │
│ │ Fresh vegetables with chicken                               │ │
│ │ Category: Food                                               │ │
│ │ Available: ❌                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Add/Edit Menu Item Modal**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Add Menu Item                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Item Name:                                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Description:                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Price:                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ₹                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Category:                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Select Category ▼]                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ☐ Available                                                     │
│                                                                 │
│ [Cancel] [Save Item]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Owner views menu items
2. Owner can add new items
3. Owner can edit existing items
4. Owner can toggle availability
5. Owner can delete items

### 8. Order Management (OrderManagementPage)

**Purpose**: Track and manage incoming orders

**Target Users**: Cafe owners, kitchen staff

**Key Features**:
- Order list with status filters
- Status update buttons
- Order details modal
- Real-time notifications
- Search and filter

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Order Management                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Status: [All] [Pending] [Preparing] [Ready] [Completed]        │
│                                                                 │
│ Search: [Search orders...]                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order #123 - Table 5              ₹45.00                   │ │
│ │                                                             │ │
│ │ Customer: John Doe                                         │ │
│ │ Items: 1x Cappuccino                                      │ │
│ │ Time: 2:30 PM                                             │ │
│ │                                                             │ │
│ │ Status: [Pending] [Confirm] [Preparing] [Ready]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order #124 - Table 3              ₹32.50                   │ │
│ │                                                             │ │
│ │ Customer: Jane Smith                                       │ │
│ │ Items: 1x Green Tea                                        │ │
│ │ Time: 2:25 PM                                              │ │
│ │                                                             │ │
│ │ Status: [Pending] [Confirm] [Preparing] [Ready]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Order #125 - Table 7              ₹78.00                   │ │
│ │                                                             │ │
│ │ Customer: Bob Wilson                                       │ │
│ │ Items: 1x Club Sandwich                                    │ │
│ │ Time: 2:20 PM                                              │ │
│ │                                                             │ │
│ │ Status: [Pending] [Confirm] [Preparing] [Ready]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Order Details Modal**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Order #123 Details                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Customer Information:                                           │
│ • Name: John Doe                                               │
│ • Phone: +1234567890                                           │
│ • Table: 5                                                     │
│ • Time: 2:30 PM                                                │
│                                                                 │
│ Order Items:                                                    │
│ • 1x Cappuccino - ₹45.00                                       │
│   Special: Extra hot                                           │
│                                                                 │
│ Total: ₹45.00                                                  │
│                                                                 │
│ Special Instructions:                                           │
│ Please deliver to table 5                                      │
│                                                                 │
│ Status: [Pending] [Confirm] [Preparing] [Ready] [Complete]     │
│                                                                 │
│ [Close]                                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Staff views incoming orders
2. Staff can filter by status
3. Staff updates order status
4. Staff views order details
5. Real-time updates for customers

### 9. QR Code Management (QRCodeManagementPage)

**Purpose**: Generate and manage QR codes for tables

**Target Users**: Cafe owners

**Key Features**:
- Table list with QR codes
- Bulk QR generation
- Download functionality
- QR code regeneration
- Copy URL functionality

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ QR Code Management        [Generate Bulk QR Codes]             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Table 1 - Main Area                                        │ │
│ │                                                             │ │
│ │ ┌─────────────┐                                            │ │
│ │ │             │                                            │ │
│ │ │   [QR CODE] │ [Download] [Copy URL] [Regenerate]         │ │
│ │ │             │                                            │ │
│ │ └─────────────┘                                            │ │
│ │                                                             │ │
│ │ URL: https://mycafe.com/menu/123?table=1                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Table 2 - Main Area                                        │ │
│ │                                                             │ │
│ │ ┌─────────────┐                                            │ │
│ │ │             │                                            │ │
│ │ │   [QR CODE] │ [Download] [Copy URL] [Regenerate]         │ │
│ │ │             │                                            │ │
│ │ └─────────────┘                                            │ │
│ │                                                             │ │
│ │ URL: https://mycafe.com/menu/123?table=2                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Table 3 - Outdoor                                          │ │
│ │                                                             │ │
│ │ ┌─────────────┐                                            │ │
│ │ │             │                                            │ │
│ │ │   [QR CODE] │ [Download] [Copy URL] [Regenerate]         │ │
│ │ │             │                                            │ │
│ │ └─────────────┘                                            │ │
│ │                                                             │ │
│ │ URL: https://mycafe.com/menu/123?table=3                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Download All QR Codes]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Bulk QR Generation Modal**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Generate QR Codes                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Number of Tables:                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 10                                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Starting Table Number:                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 1                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Capacity per Table:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 4                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Location:                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Select Location ▼]                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Cancel] [Generate QR Codes]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Owner views existing tables and QR codes
2. Owner can generate new QR codes
3. Owner can download individual QR codes
4. Owner can download all QR codes
5. Owner can regenerate QR codes if needed

### 10. Table Management (TableManagementPage)

**Purpose**: Manage cafe tables and their configurations

**Target Users**: Cafe owners

**Key Features**:
- Table list with details
- Add/edit table configurations
- Table status management
- Location management

**Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Table Management              [+ Add Table]                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Location: [All] [Main Area] [Outdoor] [VIP]                    │
│                                                                 │
│ Status: [All] [Active] [Inactive]                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Table 1                    Main Area         [Edit] [×]    │ │
│ │                                                             │ │
│ │ Capacity: 4 people                                         │ │
│ │ Status: Active                                             │ │
│ │ QR Code: Generated                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Table 2                    Main Area         [Edit] [×]    │ │
│ │                                                             │ │
│ │ Capacity: 6 people                                         │ │
│ │ Status: Active                                             │ │
│ │ QR Code: Generated                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Table 3                    Outdoor           [Edit] [×]    │ │
│ │                                                             │ │
│ │ Capacity: 4 people                                         │ │
│ │ Status: Inactive                                           │ │
│ │ QR Code: Not Generated                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Add/Edit Table Modal**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Add Table                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Table Number:                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Table Name (Optional):                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Capacity:                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Select Capacity ▼]                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Location:                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Select Location ▼]                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ☐ Active                                                        │
│                                                                 │
│ [Cancel] [Save Table]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Flow**:
1. Owner views all tables
2. Owner can add new tables
3. Owner can edit table configurations
4. Owner can activate/deactivate tables
5. Owner can manage table locations

## Responsive Design

### Mobile-First Approach

The application is designed with a mobile-first approach, ensuring optimal experience across all devices:

#### Mobile (< 768px)
- Single column layout
- Collapsible navigation
- Touch-friendly buttons
- Optimized forms
- Swipe gestures

#### Tablet (768px - 1024px)
- Two-column layout where appropriate
- Sidebar navigation
- Larger touch targets
- Optimized tables

#### Desktop (> 1024px)
- Multi-column layout
- Full sidebar navigation
- Hover effects
- Advanced interactions

### Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* Mobile-specific styles */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet-specific styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop-specific styles */
}
```

## Accessibility Features

### WCAG 2.1 Compliance

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels and semantic HTML
3. **Color Contrast**: High contrast ratios for text readability
4. **Focus Indicators**: Clear focus indicators for keyboard users
5. **Alt Text**: Descriptive alt text for images

### Accessibility Implementation

```jsx
// Example of accessible button
<button
  aria-label="Add menu item"
  onClick={handleAddItem}
  className="btn-primary"
>
  <PlusIcon aria-hidden="true" />
  Add Item
</button>

// Example of accessible form
<form role="form" aria-labelledby="form-title">
  <h2 id="form-title">Add Menu Item</h2>
  <label htmlFor="item-name">Item Name:</label>
  <input
    id="item-name"
    type="text"
    aria-describedby="name-help"
    required
  />
  <div id="name-help">Enter the name of the menu item</div>
</form>
```

## User Experience Guidelines

### Design Principles

1. **Simplicity**: Clean, uncluttered interface
2. **Consistency**: Uniform design patterns
3. **Efficiency**: Minimize clicks and steps
4. **Feedback**: Clear status indicators
5. **Error Prevention**: Validate inputs and confirm actions

### Interaction Patterns

1. **Loading States**: Show loading indicators for async operations
2. **Success Feedback**: Confirm successful actions
3. **Error Handling**: Clear error messages with solutions
4. **Progressive Disclosure**: Show information progressively
5. **Undo Actions**: Allow users to undo critical actions

### Performance Considerations

1. **Fast Loading**: Optimize images and bundle size
2. **Smooth Animations**: Use CSS transitions for state changes
3. **Lazy Loading**: Load content as needed
4. **Caching**: Cache frequently accessed data
5. **Offline Support**: Basic offline functionality

## Future Enhancements

### Planned UI Improvements

1. **Dark Mode**: Toggle between light and dark themes
2. **Custom Branding**: Allow cafes to customize colors and logos
3. **Advanced Analytics**: Interactive charts and graphs
4. **Real-time Notifications**: Push notifications for new orders
5. **Multi-language Support**: Internationalization for global use
6. **Voice Commands**: Voice-activated ordering for accessibility

### Mobile App Features

1. **Native Apps**: iOS and Android applications
2. **Offline Mode**: Basic functionality without internet
3. **Push Notifications**: Real-time order updates
4. **Camera Integration**: Direct QR code scanning
5. **Payment Integration**: In-app payment processing

This comprehensive UI documentation provides a complete guide to the user interface design, ensuring consistency, accessibility, and excellent user experience across all devices and user types.
