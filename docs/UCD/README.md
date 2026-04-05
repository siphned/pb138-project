# UCD (Use Case & Sequence Diagrams)

This folder contains the Use Case Diagram and Sequence Diagrams for WineMarket.

Files:
- `use_case_diagram.puml` — consolidated use case diagram (actors, system flows).
- `seq_checkout.puml` — sequence diagram: guest cart merge → checkout → order freeze.
- `seq_role_request.puml` — sequence diagram: role-request lifecycle (submit → admin review → approve/reject).

Traceability (high level):
- Checkout / Orders: DB tables `Carts`, `Cart_items`, `Orders`, `Order_items`, `Addresses`.
- Role requests: DB table `Role_requests`, `Winemakers`, `Shops`, `Users`.
- Events: `Events`, `Event_invites`, `Comments`.

Usage:
- Render PlantUML files with any PlantUML tool or VS Code PlantUML extension.
- Include exported PNGs/SVGs in Merge Requests for reviewers.

Viewing diagrams (graphic)
--------------------------
- Install the VS Code PlantUML extension (e.g. `jebbs.plantuml`).
- For local rendering, install Graphviz on your machine (optional but recommended).
- Open any `.puml` file and use the command palette: "PlantUML: Preview Current Diagram" to see a live SVG/PNG preview.
- To export an image for the MR, run "PlantUML: Export Current Diagram" and choose PNG or SVG.
- Tip: take the exported PNG/SVG and attach it to the Merge Request for fast review by non-technical stakeholders.

