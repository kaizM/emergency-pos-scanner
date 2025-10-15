# Design Guidelines: Emergency POS Scanner Web Application

## Design Approach: Utility-First System Design
**Selected Framework:** Material Design principles adapted for retail/POS environments
**Rationale:** This is a mission-critical utility tool requiring immediate clarity, high contrast for various lighting conditions, and responsive feedback for stressed cashiers during system failures.

---

## Core Design Principles
1. **Speed Over Beauty** - Every visual choice prioritizes task completion speed
2. **High Contrast Always** - Ensure readability in poor retail lighting
3. **Large Touch Targets** - Minimum 48px for all interactive elements
4. **Immediate Feedback** - Visual confirmation for every action within 100ms
5. **Error Prevention** - Clear states prevent costly checkout mistakes

---

## Color System

### Light Mode (Primary)
- **Background:** 0 0% 98% (near-white for bright retail environments)
- **Surface Cards:** 0 0% 100% (pure white)
- **Primary Action:** 142 76% 36% (strong green - universally understood as "proceed")
- **Destructive:** 0 84% 60% (red for remove/cancel actions)
- **Text Primary:** 0 0% 13% (near-black for maximum contrast)
- **Text Secondary:** 0 0% 45% (medium gray for supporting info)
- **Border/Divider:** 0 0% 88%

### Dark Mode
- **Background:** 0 0% 7%
- **Surface Cards:** 0 0% 12%
- **Primary Action:** 142 76% 45% (slightly brighter green)
- **Text Primary:** 0 0% 98%
- **Border/Divider:** 0 0% 20%

### Semantic Colors
- **Success State:** 142 76% 36% (green - item scanned successfully)
- **Warning:** 38 92% 50% (amber - manual price entry needed)
- **Error:** 0 84% 60% (red - barcode not found)
- **Info/Scanner Active:** 217 91% 60% (blue - camera scanning mode)

---

## Typography

### Font Stack
- **Primary:** 'Inter', -apple-system, system-ui, sans-serif
- **Monospace (Prices/Barcodes):** 'Roboto Mono', 'Courier New', monospace

### Type Scale
- **Display (Totals):** 3.5rem (56px) / Bold / -0.02em tracking
- **Heading 1 (Section Headers):** 2rem (32px) / Semibold
- **Heading 2 (Item Names):** 1.25rem (20px) / Medium
- **Body (UI Text):** 1rem (16px) / Regular
- **Small (Metadata):** 0.875rem (14px) / Regular
- **Micro (Barcodes):** 0.75rem (12px) / Mono / Medium

---

## Layout System

### Spacing Scale
Use Tailwind units: **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: `p-4` to `p-6`
- Section spacing: `gap-6` to `gap-8`
- Container max-width: `max-w-2xl` (optimal for tablet portrait)

### Grid Structure
**Mobile-First Single Column:**
- Scanner viewport: Full-width, minimum 60vh
- Cart items: Stacked list with clear dividers
- Action buttons: Full-width with 4-unit spacing

**Tablet/Desktop (768px+):**
- Split view: Scanner left (40%), Cart right (60%)
- Side-by-side item details (name left, price right)

---

## Component Library

### Scanner Viewport
- **Active State:** Pulsing blue border (217 91% 60%), camera viewfinder overlay with corner guides
- **Scanning Feedback:** Rapid green flash on successful scan
- **Error State:** Red shake animation + border change
- **Idle State:** Subtle gray border with "Tap to Scan" prompt

### Shopping Cart Items
- **Card Design:** White surface with subtle shadow, 4-unit padding, 1px bottom border
- **Layout:** Flexbox - item name (flex-1), quantity badge (pill), price (bold, right-aligned)
- **Remove Button:** Small red "X" icon button (32px) positioned far right
- **Empty State:** Large centered icon with "Scan items to begin" message

### Price Display System
- **Subtotal:** Regular weight, medium gray, right-aligned
- **Tax Line:** Smaller text "(8.25%)" inline, dimmed
- **Grand Total:** Display size (56px), bold, green color, prominent card with background tint
- **Manual Price Input:** Large numeric keypad, monospace display

### Action Buttons
- **Primary (Checkout):** Full-width, 56px height, green background, white text, uppercase, bold
- **Secondary (Cash/Card):** Outlined style, 48px height, maintains width
- **Destructive (Remove/Clear):** Red background or outline depending on severity
- **Scanner Toggle:** Floating action button (FAB) 64px circle, blue, fixed bottom-right

### Status Indicators
- **Scanning Active:** Blue dot pulsing animation top-right
- **Item Added:** Brief green checkmark overlay on scanner
- **Network Status:** Small icon in header (online/offline indicator)

### Payment Flow Screens
- **Cash Calculator:** Large number display, visual keypad, change calculation in green
- **Card Reader:** Instructional graphic, step-by-step text, confirmation button

---

## Responsive Behavior

### Mobile Portrait (320-767px)
- Single column stack
- Scanner full-width, 60vh minimum
- Cart below scanner, max-height with scroll
- Bottom action bar with checkout button

### Tablet Portrait/Landscape (768px+)
- Two-column layout: scanner | cart
- Floating scanner card with rounded corners
- Cart sticky with internal scroll
- Action buttons in cart footer

### Touch Interactions
- All buttons minimum 48×48px
- Generous spacing (12px) between items
- Large swipe-to-remove gesture for cart items
- Haptic feedback on successful scan (where supported)

---

## Animation & Motion

### Scanner Feedback (Essential)
- Scan success: 200ms green pulse + subtle scale (1.05)
- Scan failure: 300ms red shake (±4px horizontal)
- Loading state: Rotating spinner (blue)

### Cart Interactions
- Add item: 300ms slide-in from top
- Remove item: 250ms fade-out + collapse
- Clear cart: Staggered fade-out (50ms delay per item)

### Payment Flow
- Screen transition: 400ms slide (left/right)
- Total reveal: Count-up animation (800ms)

**No Decorative Animations** - Every motion serves a functional purpose.

---

## Accessibility & States

### Focus States
- 3px solid blue outline (217 91% 60%) with 2px offset
- High contrast mode: Thicker borders (4px)

### Loading States
- Skeleton screens for cart items
- Spinner for price lookup
- Disabled button states with 50% opacity

### Error Handling
- Inline error messages below inputs (red text, icon)
- Toast notifications for system errors (top-center, 4s duration)
- Manual price entry fallback always visible

---

## Critical UX Patterns

### Barcode Not Found Flow
1. Scanner shows warning border (amber)
2. Modal appears: "Item not in pricebook"
3. Large manual price input with numeric keypad
4. Item name text field
5. Add to cart button

### Quick Clear/Reset
- Swipe gesture or prominent "Clear Cart" button
- Confirmation dialog with large "Yes, Clear" destructive button
- Instant visual feedback (cart empties with animation)

### Offline Functionality
- Service worker caches pricebook JSON
- Offline indicator in header
- All scanning features work without internet
- Payment instructions load from cache

---

**Visual Character:** Utilitarian, high-contrast, confidence-inspiring retail tool that works flawlessly under pressure in any lighting condition. Clean, professional, and fast—never decorative.