# WineMarket API - Postman Collection

Complete API testing collection for the WineMarket platform with manual testing workflows for evaluators.

## Quick Start

### 1. Import Collection

1. Open Postman desktop or web application
2. Click **Import** (top-left)
3. Choose **Upload Files** tab
4. Select `winery-api.postman_collection.json` from this directory
5. Click **Import**

### 2. Configure Environment

The collection uses environment variables for dynamic values:

**Variable: `base_url`**
- **Default**: `http://localhost:3000`
- Change if your API runs on different host/port
- Format: `http://[host]:[port]` (no trailing slash)

**Variable: `clerk_jwt_token`**
- **Required for authenticated requests**
- Get from Clerk dashboard or your development session
- Set in **Environment** settings (gear icon top-right)
- Format: Bearer token (just the token value)

**Variable: `last_order_id`**
- Auto-populated after checkout
- Used for order detail retrieval
- Set automatically by Postman test scripts

### 3. Get a JWT Token

For testing authenticated endpoints:

**Option A: From Frontend (Quick)**
1. Log in at `http://localhost:5173`
2. Open browser DevTools (F12)
3. Go to Network tab
4. Look for any API request with Authorization header
5. Copy the token value from `Authorization: Bearer <token>`

**Option B: From Clerk Dashboard (Recommended)**
1. Visit Clerk dashboard for your project
2. Go to Users section
3. Create or select a test user
4. View user details and copy JWT token

**Option C: Generate via Clerk API**
```bash
curl https://api.clerk.com/v1/jwt_templates/default \
  -H "Authorization: Bearer <clerk_api_key>"
```

Then set in Postman:
1. Click gear icon (top-right)
2. Select your environment
3. Find `clerk_jwt_token` variable
4. Paste token in **Current Value** field
5. Click **Save**

## Collection Structure

### 1. Auth & Users
- Get current user profile
- Update user information
- Manage shipping/billing addresses

**Sample Flow:**
```
GET /users/me → PUT /users/me → GET /users/me/addresses → POST /users/me/addresses
```

### 2. Wines
- Browse wine catalog (public)
- Create wines (winemaker only)
- Manage wine inventory

**Sample Flow:**
```
GET /wines → GET /wines/:id → POST /wines (as winemaker) → PUT /wines/:id → DELETE /wines/:id
```

### 3. Products & Bundles
- Catalog browsing
- Product creation (shop owner)
- Bundle management

**Sample Flow:**
```
GET /products → GET /products/:id → POST /shops/:id/products → PATCH /shops/:id/products/:id
```

### 4. Shopping Cart & Checkout
- **Key Flow: Add to Cart → Checkout → Confirm**

**Guest Checkout (No Auth Required):**
```
GET /carts 
→ POST /carts/items (add product) 
→ GET /carts (view cart) 
→ POST /orders/checkout (guest email required)
→ GET /orders/:id (with auth if registered)
```

**Authenticated Checkout:**
```
GET /carts 
→ POST /carts/items 
→ PUT /carts/items/:productId (update quantity)
→ DELETE /carts/items/:productId (remove item)
→ POST /orders/checkout 
→ GET /orders/:id
```

**Note:** Guest sessions use `guest_session_id` cookie. This is auto-managed by Postman.

### 5. Events
- Browse approved events (public)
- Create events (winemaker only)
- Register/unregister
- Comment on events

**Sample Flow:**
```
GET /events 
→ GET /events/:id 
→ POST /events (as winemaker)
→ POST /events/:id/register 
→ GET /events/:id/comments
→ POST /events/:id/comments
```

### 6. Reviews & Ratings
- Create product reviews (must have purchased)
- Rate winemakers and wines
- Delete own reviews

**Sample Flow:**
```
GET /products/:id/reviews 
→ POST /products/:id/reviews 
→ GET /winemakers/:id/reviews
→ DELETE /reviews/:id (own review)
```

### 7. Shops & Winemakers
- Browse shops and winemakers
- Create shop (shop owner)
- Manage shop products

**Sample Flow:**
```
GET /shops 
→ GET /shops/:id 
→ POST /shops (as shop owner)
→ PATCH /shops/:id 
→ GET /shops/:id/products
```

### 8. Admin Panel
- Moderation workflows
- User management
- Event and review moderation

**Sample Moderation Flow:**
```
GET /admin/events (pending) 
→ POST /admin/events/:id/approve 
→ GET /admin/reviews 
→ DELETE /admin/reviews/:id
```

## Running Tests

Each request has **Test** scripts that validate:
- HTTP status codes
- Response structure
- Required fields

### View Test Results

1. Send a request
2. Click **Tests** tab in response panel
3. See passed/failed assertions

Example test output:
```
✓ Status code is 200
✓ Response has user id
✓ Response has roles array
```

## Common Testing Scenarios

### Scenario 1: Complete Shopping Journey (Guest)
1. **Add to Cart** → POST `/carts/items`
2. **View Cart** → GET `/carts`
3. **Checkout** → POST `/orders/checkout` (provide guest email)
4. **Order Confirmation** → Auto-saved `last_order_id`

### Scenario 2: Wine Tasting Event Registration
1. **List Events** → GET `/events`
2. **View Event** → GET `/events/:id`
3. **Register** → POST `/events/:id/register`
4. **Post Comment** → POST `/events/:id/comments`

### Scenario 3: Product Review Flow
1. **Order Product** → POST `/orders/checkout`
2. **List Product Reviews** → GET `/products/:id/reviews`
3. **Create Review** → POST `/products/:id/reviews` (requires order history)
4. **Delete Review** → DELETE `/reviews/:id`

### Scenario 4: Admin Moderation
1. **List Pending Events** → GET `/admin/events?status=pending`
2. **Approve Event** → POST `/admin/events/:id/approve`
3. **List All Reviews** → GET `/admin/reviews`
4. **Remove Inappropriate Content** → DELETE `/admin/reviews/:id`

### Scenario 5: Winemaker Workflow
1. **Create Wine** → POST `/wines`
2. **Create Event** → POST `/events`
3. **View Registrations** → See event attendees

## Error Handling & Edge Cases

### Out of Stock
**Request:** POST `/orders/checkout` with insufficient inventory
**Expected:** HTTP 422 with `INSUFFICIENT_STOCK` message

### Duplicate Review
**Request:** POST `/products/:id/reviews` (second time for same user)
**Expected:** HTTP 400 or conflict response

### Unauthorized Access
**Request:** DELETE `/wines/:id` (not owner, not admin)
**Expected:** HTTP 403 Forbidden

**Testing:** Try without JWT or as wrong user to see proper error handling.

### Invalid JWT
**Request:** Any authenticated endpoint with malformed token
**Expected:** HTTP 401 Unauthorized
**Test:** Clear `clerk_jwt_token` and try authenticated request

## Tips for Evaluators

### 1. Testing as Different Roles

Create multiple environments in Postman:
- `Development-Admin` (admin token)
- `Development-WineMaker` (winemaker token)
- `Development-ShopOwner` (shop owner token)
- `Development-Customer` (customer token)
- `Development-Guest` (no auth)

Switch between them using the environment dropdown (top-right).

### 2. Export Test Results

1. Run collection (arrow icon next to collection name)
2. Select requests to run
3. After completion, click **Run Results** → **Export** (gear icon)
4. Save as HTML or JSON for evaluation records

### 3. Performance Testing

For basic performance checks:
1. Use Postman's **Run Collection** feature
2. Set up multiple iterations
3. Check **Response time** in Results summary

### 4. Debugging Failed Requests

1. Click **Logs** (bottom of Postman)
2. See request/response details
3. Check:
   - JWT token validity
   - Correct base_url
   - Required body fields
   - Proper ID references

### 5. Batch Testing Workflow

**For evaluators testing the complete system:**

```
1. Test Public Endpoints (no auth)
   - List wines, products, events, shops
   
2. Test Authentication
   - GET /users/me (with valid token)
   
3. Test Shopping (Guest)
   - Add to cart → Checkout
   
4. Test Shopping (Authenticated)
   - Add to cart → Update quantity → Checkout
   
5. Test Winemaker Flows
   - Create wine, create event
   
6. Test Reviews & Comments
   - Create reviews, post event comments
   
7. Test Admin Panel
   - List events, approve/reject, manage users
```

## Troubleshooting

### "Invalid token" Error
- Verify JWT is not expired
- Re-generate token from Clerk
- Ensure token is in `clerk_jwt_token` variable

### "Request failed" with No Response
- Check `base_url` is correct
- Verify API server is running (`bun dev`)
- Check CORS settings if using different domain

### "404 Not Found" for IDs
- Ensure IDs exist (use list endpoints first)
- IDs may have different prefix (user_, wine_, product_, etc.)
- Some resources are soft-deleted (don't appear in lists)

### Guest Session Not Working
- Postman automatically handles `guest_session_id` cookie
- Check **Cookies** tab if debugging
- Clear cookies if testing multiple guest sessions

### Admin Endpoints Return 403
- Verify `clerk_jwt_token` is from admin user
- Check user has `admin` role in Clerk
- May need to recreate admin token after role assignment

## API Response Examples

### Successful User Response (200)
```json
{
  "id": "user_abc123def456",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "roles": ["customer"],
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

### Successful Cart Response (200)
```json
{
  "id": "cart_xyz789",
  "userId": "user_abc123",
  "items": [
    {
      "id": "item_001",
      "productId": "product_123",
      "quantity": 2,
      "product": {
        "id": "product_123",
        "name": "Premium Bordeaux",
        "price": "79.99",
        "shopId": "shop_456"
      }
    }
  ],
  "createdAt": "2026-05-15T12:00:00Z",
  "updatedAt": "2026-05-15T14:30:00Z"
}
```

### Successful Order Response (200)
```json
{
  "id": "order_abc789",
  "userId": "user_abc123",
  "status": "pending",
  "totalPrice": "159.98",
  "paymentMethod": "card",
  "paymentStatus": "paid",
  "deliveryType": "shipping",
  "shippingFee": "5.00",
  "discount": "0.00",
  "shippingAddressId": "addr_123",
  "billingAddressId": "addr_124",
  "createdAt": "2026-05-15T15:00:00Z",
  "updatedAt": "2026-05-15T15:00:00Z"
}
```

### Error Response (400/403/404)
```json
{
  "message": "Error description here",
  "statusCode": 400
}
```

## Collection Maintenance

This collection covers:
- **25+ main endpoints** across 8 feature areas
- **Auth flows** (Clerk JWT)
- **Multi-step workflows** (cart → checkout → order)
- **Role-based access** (public, customer, winemaker, shop owner, admin)
- **Error scenarios** (out of stock, permission denied, not found)
- **Test assertions** for each request

### Adding New Endpoints

When API changes:
1. Identify new endpoint in Elysia routes
2. Create request in appropriate collection folder
3. Add body schema if POST/PATCH/PUT
4. Add test assertions (status code + response validation)
5. Export updated collection

### Updating Existing Requests

1. Right-click request → **Edit**
2. Update method/path/headers/body as needed
3. Update test scripts if response structure changed
4. Save collection

## Documentation Links

- **API Spec**: See `/docs/API/api.md` for all endpoints
- **Architecture**: See `/docs/ARCHITECTURE/architecture.md`
- **Database Schema**: See `/apps/server/src/db/schema.ts`
- **Generated API Client**: Kubb-generated hooks in `/apps/web/src/generated/`

## Support & Questions

For issues:
1. Check Postman console (bottom-left)
2. Verify base_url and jwt_token settings
3. Check API server logs
4. Review endpoint definitions in `/docs/API/api.md`

---

**Last Updated:** May 17, 2026
**Collection Version:** 1.0
**Status:** Ready for M3 Evaluation
