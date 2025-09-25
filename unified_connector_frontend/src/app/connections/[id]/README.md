# /connections/[id] Route

This page implements a detailed view for a specific connection with these tabs:
- Containers: Lists containers (projects/spaces).
- Items: Lists and searches items; supports creating an item.
- Item Detail: Displays selected item info and comments; supports adding comments.
- Raw JSON: Shows raw connection JSON for debugging.

Implementation details:
- Uses SWR for data fetching with a unified envelope fetcher.
- All backend calls assume a unified envelope format. Non-enveloped responses are normalized where possible.
- Ocean Professional theme via Tailwind classes and global CSS variables.
- Accessibility: Proper aria labels, semantic structure, and keyboard focus preservation are considered.

Deep linking:
- Uses URL search params:
  - tab=containers|items|item|raw
  - itemId=<id> (used by Item Detail)
  - q=<search> (used by Items)
  - containerId=<id> (optional filtering on items)

Environment:
- NEXT_PUBLIC_BACKEND_URL should point to the backend base URL.
