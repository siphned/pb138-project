# UI Audit - Missing Backend Endpoints

- MISSING_BE: usePatchWinesById — required by route /wines/$id/edit
- MISSING_BE: usePatchWinemakersById — required by route /winemakers/$id/edit
- MISSING_BE: useGetAdminUsersById — required by route /admin/users/$id
- MISSING_BE: useGetRoleRequestsById — required by route /admin/role-requests/$id
- MISSING_BE: useGetProducts?containsProductId — required by route /products/$productId
- MISSING_BE: useGetOrders — required by route /_authenticated/orders
- MISSING_BE: useGetEventsByIdInvitations — required by route /events/$id/invitations
- MISSING_BE: usePutShopsById — required by route /shops/$id/edit
- MISSING_BE: useDeleteShopsById — required by route /shops/$id/edit
- MISSING_BE: usePutProductsById — required by route /shops/$id/inventory/$productId/edit
- MISSING_BE: useDeleteProductsById — required by route /shops/$id/inventory/$productId/edit
- MISSING_BE: useGetOrdersByShopId — required by route /shops/$id/orders
