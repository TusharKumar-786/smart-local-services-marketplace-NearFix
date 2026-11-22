# NearFix Engineering Rules

These rules govern every phase of NearFix development. They are strict and non-negotiable.

## 1. Two Audiences, Two Rules
- **Backend Code & Architecture Documentation**: DSA-based structures and algorithms are implemented cleanly from scratch in `server/src/engine/` and explained with time and space complexities in `ARCHITECTURE.md` for project evaluators and engineers.
- **Product Facing Surface**: Customers and service providers must **never** see or infer any DSA terminology. No UI screen, button label, tooltip, copy, FAQ, error notification, or README feature list may mention: *DSA, data structures, algorithms, heap, priority queue, Dijkstra, hash map, merge sort, binary search, Big-O, or time complexity*. The matching engine is presented solely through natural human value metrics: *"Best match"*, *"Closest"*, *"Top rated"*, and calculated match percentages (e.g. `94% match`).

## 2. Technical Stack
- MERN Stack: MongoDB with Mongoose, Express.js, React (Vite), Node.js.
- Client animation: Framer Motion and purposeful CSS transitions.
- Client icons: Lucide SVG icons.
- Validation: Zod schemas on server and client.
- Maps: OpenStreetMap with Leaflet.

## 3. Visual & Aesthetic Standards
- **Real-World Photographs Only**: Free-license (Unsplash, Pexels) documentary-style photographs of actual Indian tradespeople, homes, tools, and neighbourhoods.
- **Strictly No AI Slop**: No generic blue-purple gradients, no floating glassmorphism blobs, no 3D cartoon avatars, no empty buzzwords ("revolutionize your journey").
- **Authentic Local Content**: Genuine Indian names, Chandigarh Tricity neighbourhoods (Mohali, Chandigarh, Panchkula), realistic prices in Indian Rupees (₹), and credible customer reviews.

## 4. Brand Palette & Contrast
- Strict adherence to designated brand colors:
  - Deep Teal `#0F5C63` (Primary)
  - Marigold `#F2A32C` (Accent)
  - Signal Red `#D8402F` (Urgent badges & emergency action only)
  - Leaf Green `#2E8B57` (Success & verified states)
  - Warm White `#FAF7F2` (Base background)
  - Ink `#1E2A2E` (Headings and primary text)
- All text meets WCAG AA contrast standards.

## 5. Phased Progression
- Work in three distinct phases (Foundation -> Journeys -> Polish/Admin). Finish and verify each phase completely before moving to the next.
