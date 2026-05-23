# Product Guidelines

## Core Principles

WineMarket aims to be the premier online platform connecting wine enthusiasts with producers and retailers. Our guiding principles are user-centricity, robust functionality, and a seamless experience across all user roles. We are committed to data integrity through consistent validation and transactional database operations. Our platform fosters a direct B2B2C connection between winemakers, shops, and customers, emphasizing transparency in information about wines, shops, and events.

## Target Users

The platform is designed to serve a diverse user base with specific roles and permissions:

*   **Winemakers:** Manage their profile, list and edit wines, create and manage events (pending admin approval), and manage their own dashboard.
*   **Shop Owners:** Manage their profile, set opening hours, add/edit products (from catalog), create/edit bundles, and manage incoming orders and their statuses.
*   **Customers:** Browse, filter, and view details for wines, shops, and events. Add products to cart, complete checkout (with simulated payment/delivery), manage orders, register for events, write reviews and comments, manage their profile, and request Winemaker or Shop Owner roles.
*   **Admins:** Oversee the platform with capabilities including user management (view, disable accounts), role request approval, event approval/rejection, review/comment moderation, cross-platform shop and product management, and access to basic platform statistics.

## Key Features for MVP

The initial focus will be on delivering essential functionality:

*   **Product Catalog & Discovery:** Comprehensive wine catalog with filtering (region, type, color, vintage, price), detailed wine views, winemaker profiles, shop listings, and user reviews.
*   **Order Management:** Includes guest cart management, customer checkout (simulated payment/delivery), order history tracking, and shop owner order status updates.
*   **Event Management:** Winemaker event creation/management, admin approval workflow, customer event registration/commenting, and guest browsing of upcoming events.
*   **Wine Bundles:** Shop owners can create and manage curated wine bundles with custom pricing.

## Key Differentiators

WineMarket will stand out through:

*   **Direct-to-Consumer Focus:** Emphasizing the connection between winemakers and consumers.
*   **Community Features:** Fostering interaction and community among users.
*   **Integrated Event Ticketing & Management:** Providing seamless ticketing and management for wine events.
*   **Personalized Recommendations:** Offering tailored suggestions based on user preferences.

## Non-Functional Requirements

Critical non-functional aspects will be prioritized:

*   **High Performance:** Ensuring fast loading times and smooth interactions through code splitting and optimized data fetching.
*   **Scalability:** Designing the system for future growth with a layered architecture.
*   **High Availability:** Maintaining consistent uptime and reliability of the platform.
*   **Security & Compliance:**
    *   Robust input validation on both frontend and backend using Zod.
    *   Strict adherence to Role-Based Access Control (RBAC) for all user actions.
    *   Secure handling of sensitive data and environment variables (e.g., hashed passwords).
*   **Theming:** Support for both light and dark modes.
*   **Responsiveness:** Mobile-first design adhering to WCAG AA accessibility standards.
*   **Comprehensive Testing:** Extensive unit and end-to-end tests (Vitest, Playwright) ensuring code quality.
*   **CI/CD Integration:** GitLab CI for automated checks and deployment readiness.
*   **API Documentation:** Clear API contracts generated via OpenAPI/Kubb for maintainability.
