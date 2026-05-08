# Specification: WINE-69 Wine & Winemaker Pages Shipping

## 1. Overview
The WINE-69 prototype (Wine Detail and Winemaker Profile pages) needs to be formalized, moved to an isolated environment, and completed according to project standards for shipping.

## 2. Functional Requirements
- **Selective Isolation**: Identify and move *only* WINE-69 related changes (files/commits) to a dedicated git worktree and branch.
- **Wine Detail Page**:
  - Full metadata display.
  - "Available in Shops" section (functional shop links).
  - Review section for the wine.
- **Winemaker Profile**:
  - Tabbed interface (Wines, Events, Reviews).
  - Functional links to individual wine details and event details.
- **Standards Alignment**: Review and refactor implementation to match codebase architectural patterns (Repository, Service, Controller/Router) and UI/UX guidelines.

## 3. Non-Functional Requirements
- **Testing**:
  - Unit tests for all new UI components.
  - Integration tests for new backend filters and review endpoints.
  - E2E tests for the core discovery flow.
- **Performance**: Ensure efficient data fetching using TanStack Query.
- **Code Quality**: Pass Biome linting and strict TypeScript checks.

## 4. Acceptance Criteria
- [ ] Only WINE-69 related changes successfully moved to `WINE-69-wine-and-winemakers-profile` branch in a worktree.
- [ ] Wine Detail page shows all required sections with live data.
- [ ] Winemaker profile tabs function correctly.
- [ ] Unit/Integration/E2E tests pass for the feature.
- [ ] UI matches project design standards.

## 5. Out of Scope
- Global redesign of the wine catalog (outside of the detail page).
- Payment gateway integration (handled in WINE-71).
- Unrelated feature changes from the current session.
