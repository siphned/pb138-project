# Role-Permission Matrix

## Overview
This matrix defines which user roles can perform which actions in the WineMarket system. This is the **source of truth** for authorization logic throughout the application.

**Legend:**
- ✅ = Full access
- ❌ = No access
- 🔒 = Own resources only (user's own data)
- ⚙️ = Conditional/Admin approval required
- `-` = N/A (feature not applicable to this role)

---

## Role Hierarchy

```
┌─ Guest (unauthenticated)
│
├─ Customer (registered user)
│  ├─ Winemaker (role acquired via AU-6, admin approval)
│  ├─ Shop Owner (role acquired via AU-7, admin approval)
│  └─ Both Winemaker + Shop Owner simultaneously ✓
│
└─ Admin (staff member, full access)
```

---

## Authorization Matrix

| **Feature Category** | **Feature** | **ID** | **Guest** | **Customer** | **Winemaker** | **Shop Owner** | **Admin** |
|---|---|---|---|---|---|---|---|
| **AUTHENTICATION** |
| | Register (email/password/OAuth) | AU-1 | ✅ | - | - | - | - |
| | Confirmation email | AU-2 | ✅ | - | - | - | - |
| | Login / Logout | AU-3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Change password | AU-4 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Request Winemaker role | AU-6 | ❌ | ✅ | - | ✅ | - |
| | Request Shop Owner role | AU-7 | ❌ | ✅ | ✅ | - | - |
| | Receive role request notification | AU-8 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Access back-office | AU-5 | ❌ | ❌ | ❌ | ❌ | ✅ |
| **CATALOG & SEARCH** |
| | Browse wines (with filters) | CA-1 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | View wine detail | CA-2 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Browse winemakers | CA-3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Browse shops (with filters) | CA-4 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | View shop detail | CA-5 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Add wine to catalog | CA-6 | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Edit / Delete own wine | CA-7 | ❌ | ❌ | 🔒 | ❌ | ✅ |
| **CART & ORDERS** |
| | Add product to cart | OR-1 | ✅ | ✅ | ✅ | ✅ | - |
| | Modify/remove from cart | OR-2 | ✅ | ✅ | ✅ | ✅ | - |
| | View cart total | OR-3 | ✅ | ✅ | ✅ | ✅ | - |
| | Checkout (create order) | OR-4 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Select delivery address | OR-5 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Receive order confirmation email | OR-6 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | View own order history | OR-7 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Manage incoming shop orders | OR-8 | ❌ | ❌ | ❌ | 🔒 | ✅ |
| | Change order status | OR-8 | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **WINE BUNDLES** |
| | Create WineBundle | WB-1 | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Edit / Delete WineBundle | WB-2 | ❌ | ❌ | ❌ | 🔒 | ✅ |
| | View WineBundle details | WB-3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SHOPS** |
| | View own shop profile | - | ❌ | ❌ | ❌ | 🔒 | ✅ |
| | Edit shop profile | - | ❌ | ❌ | ❌ | 🔒 | ✅ |
| | Manage shop availability | - | ❌ | ❌ | ❌ | 🔒 | ✅ |
| | Add products to shop | - | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **EVENTS** |
| | Browse events (approved only) | EV-1 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | View event detail | EV-2 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Register for event | EV-3 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Comment on event | EV-4 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Create event (requires approval) | EV-5 | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Edit / Cancel own event | EV-6 | ❌ | ❌ | 🔒 | ❌ | ✅ |
| | Approve / Reject event | EV-7 | ❌ | ❌ | ❌ | ❌ | ✅ |
| **REVIEWS & RATINGS** |
| | Write product review | RE-1 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Write winemaker review | RE-2 | ❌ | ✅ | ✅ | ✅ | ✅ |
| | View reviews & ratings | RE-3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Moderate reviews | RE-4 | ❌ | ❌ | ❌ | ❌ | ✅ |
| **ADMIN / BACK-OFFICE** |
| | View all users | BO-1 | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Deactivate user account | BO-1 | ❌ | ❌ | ❌ | ❌ | ✅ |
| | View pending role requests | BO-6 | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Approve / Reject role request | BO-6 | ❌ | ❌ | ❌ | ❌ | ✅ |
| | View/Manage all shops | BO-4 | ❌ | ❌ | ❌ | ❌ | ✅ |
| | View/Manage all products | BO-4 | ❌ | ❌ | ❌ | ❌ | ✅ |
| | View platform statistics | BO-5 | ❌ | ❌ | ❌ | ❌ | ✅ |
| **USER PROFILE** |
| | View own profile | - | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Edit own profile | - | ❌ | 🔒 | 🔒 | 🔒 | ✅ |
| | Manage own addresses | - | ❌ | 🔒 | 🔒 | 🔒 | ✅ |

---

## Key Business Rules

### Role Acquisition
- **Guest** → **Customer**: Automatic upon registration (AU-1)
- **Customer** → **Winemaker**: Submit request (AU-6) → Admin approval → role activated
- **Customer** → **Shop Owner**: Submit request (AU-7) → Admin approval → role activated
- One user can hold multiple roles simultaneously (e.g., Customer + Winemaker + Shop Owner)

### Resource Ownership (🔒)
- **Own wine** = Created by logged-in Winemaker
- **Own shop** = Owned by logged-in Shop Owner
- **Own order** = Created by logged-in Customer/Winemaker/Shop Owner
- **Own product** = Added to shop by logged-in Shop Owner
- **Own bundle** = Created by logged-in Shop Owner

### Admin Override
- Admin can perform any action including all customer/user operations
- Admin bypasses all ownership checks and role restrictions
- Admin can approve/reject events and role requests
- Admin can moderate and manage all content

### Special Cases
- **Checkout**: Only authenticated users (❌ for Guest)
- **Event Registration**: Only authenticated users, max 1 registration per user
- **Create Event**: Winemakers can create, but events need Admin approval before publication (EV-7)
- **Order Management**: Shop Owner sees only orders for their shop; Admin sees all

---

## Revision History
- **v1.0** (Week 6) — Initial role matrix from PRD requirements
- Baseline for API and service layer authorization logic
