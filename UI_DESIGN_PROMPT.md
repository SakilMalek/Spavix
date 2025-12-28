# SPAVIX - AI Room Transformation Platform
## Comprehensive UI Design Prompt for AI Design Tools

---

## 🎯 Product Overview

**SPAVIX** is an AI-powered room transformation platform that allows users to:
1. Upload photos of their rooms
2. Select design styles and materials
3. Generate AI-transformed room images
4. Auto-detect furniture/decor items in transformed images
5. Find and purchase matching products with affiliate links
6. Export shopping lists and design recommendations

**Target Users:** Interior design enthusiasts, homeowners, real estate professionals, interior designers

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Lucide Icons, Gemini 2.0 Flash API

---

## 📱 Current UI Architecture

### **1. Navigation Bar (Modern Navbar)**
**Current Design:**
- Sticky header with gradient background (light: white to gray-50, dark: neutral-900 to neutral-950)
- Logo (140x80px) on the left with hover opacity effect
- Desktop navigation with Home, History links
- Theme toggle (Moon/Sun icon)
- User profile picture (circular avatar)
- Logout button
- Mobile hamburger menu
- Backdrop blur effect (12px)

**Current Issues:**
- Logo takes significant space
- Navigation items could be more visually distinct
- Profile picture display could be more prominent

---

### **2. Dashboard Page**

#### **A. Suggestion Banner**
**Current Design:**
- Gradient background (amber-50 to orange-50 in light mode)
- Icon + heading + description + CTA button
- Suggests using image editor before uploading
- Dismissible on upload

**Current Issues:**
- Could be more visually appealing
- CTA button could stand out more

#### **B. Upload & Generation Panel**
**Current Design:**
- Two-column grid layout
- Left: File upload area (drag-and-drop)
- Right: Form with:
  - Room type selector (dropdown)
  - Design style grid (2x2 buttons with name + description)
  - Materials section with 4 dropdowns:
    - Wall Color
    - Floor Type
    - Curtains
    - Lighting Mood
  - Generate button (HoverBorderGradient component)

**Current Issues:**
- Form is long and scrollable
- Material selections could be more visual (color swatches instead of dropdowns)
- No preview of selections
- Generate button could be more prominent

#### **C. Latest Transformation Card**
**Current Design:**
- ModernTransformationCard component showing:
  - Before/After image comparison
  - Style name and room type
  - Creation date
  - View All, View Details, Download buttons
  - **NEW:** "Detect Products & Find Deals" button below card

**Current Issues:**
- Button placement could be better integrated
- No visual feedback while detecting products
- Product sidebar slides in from right (modal overlay)

#### **D. Product Sidebar (New Feature)**
**Current Design:**
- Fixed right sidebar (450px max-width)
- Header with shopping cart icon + item count
- Expandable item cards showing:
  - Item name
  - Category badge (color-coded)
  - Source badge (Amazon/Flipkart/Wayfair)
  - Best match product with price
  - Number of matches
- Expanded view shows:
  - Top 3 product matches
  - Product image, title, price, source, similarity %
  - "View" link to affiliate URL
- Footer with:
  - CSV/JSON export buttons
  - Share button
  - Selected products count

**Current Issues:**
- Sidebar is modal-based (blocks main content)
- Could be integrated as a panel instead
- Product cards could show images
- Export/Share buttons could be more discoverable

---

### **3. Login Page**

**Current Design:**
- Centered form with:
  - Email input
  - Password input
  - Login button
  - Google OAuth button
  - Sign up link
- Dark/Light theme support
- Gradient background

**Current Issues:**
- Generic form design
- Could have more visual appeal
- Google button could be more prominent

---

### **4. Image Editor Page**

**Current Design:**
- Canvas-based image editor with:
  - Crop tool
  - Rotate tool
  - Brightness/Contrast adjustment
  - Filter effects
  - Undo/Redo
  - Save/Cancel buttons

**Current Issues:**
- UI could be more intuitive
- Tool icons could be larger
- Preview could be better

---

## 🎨 Current Design System

### **Colors**
- **Light Mode:**
  - Background: White, Gray-50
  - Text: Gray-900
  - Borders: Gray-200, Gray-300
  - Accents: Blue-600, Purple-600

- **Dark Mode:**
  - Background: Neutral-950, Neutral-900
  - Text: White, Neutral-300
  - Borders: Neutral-700, Neutral-800
  - Accents: Purple-600, Pink-600

### **Typography**
- **Font Families:**
  - Inter: Body text, UI elements
  - Poppins: Headings (600, 700, 800 weights)

### **Components**
- HoverBorderGradient: Animated border on hover
- ModernTransformationCard: Before/After comparison
- FileUpload: Drag-and-drop file upload
- ProductSidebar: Shopping list sidebar
- ModernNavbar: Sticky navigation

### **Icons**
- Lucide React icons (Upload, Sparkles, Download, LogOut, Loader, ShoppingCart, Wand2, etc.)

---

## 🚀 Key Features to Highlight in UI

1. **AI Image Generation** - Central feature, should be prominent
2. **Product Detection** - Auto-detect items in generated images
3. **Shopping Integration** - Find and buy products with affiliate links
4. **Design Customization** - Room type, style, materials selection
5. **Image Editing** - Pre-upload image enhancement
6. **Dark/Light Theme** - Full theme support
7. **Export/Share** - CSV, JSON export, sharing capabilities

---

## 💡 UI Improvement Areas

### **High Priority**
1. **Dashboard Layout**
   - Current: Long scrollable form
   - Suggestion: Sidebar layout with upload on left, preview on right
   - Or: Tabbed interface (Upload → Style → Materials → Generate)

2. **Product Sidebar**
   - Current: Modal overlay blocking content
   - Suggestion: Slide-in panel that doesn't block main content
   - Or: Integrated as right column on desktop, bottom drawer on mobile

3. **Material Selection**
   - Current: 4 dropdown selects
   - Suggestion: Visual color/texture swatches with preview
   - Or: Grid of visual options instead of dropdowns

4. **Style Selection**
   - Current: 2x2 grid of buttons
   - Suggestion: Carousel or larger grid with preview images
   - Or: Cards with style images and descriptions

5. **Generate Button**
   - Current: HoverBorderGradient at bottom of form
   - Suggestion: Floating action button or sticky button at top
   - Or: Prominent CTA in the center of the page

### **Medium Priority**
1. **Before/After Comparison**
   - Current: Side-by-side cards
   - Suggestion: Slider comparison tool
   - Or: Toggle between before/after

2. **Product Cards**
   - Current: Text-only with badges
   - Suggestion: Show product images
   - Or: Product preview cards with ratings

3. **Navigation**
   - Current: Minimal navbar
   - Suggestion: More prominent navigation with icons
   - Or: Sidebar navigation on desktop

4. **Loading States**
   - Current: Spinner in button
   - Suggestion: Full-page progress indicator
   - Or: Animated skeleton screens

### **Low Priority**
1. **Animations**
   - Add smooth transitions between states
   - Skeleton screens for loading
   - Micro-interactions on hover

2. **Accessibility**
   - Better color contrast
   - Keyboard navigation
   - ARIA labels

3. **Mobile Responsiveness**
   - Optimize for small screens
   - Touch-friendly buttons
   - Simplified forms

---

## 📐 Current Layout Patterns

### **Dashboard Grid Layout**
```
┌─────────────────────────────────────────┐
│           Modern Navbar                 │
├─────────────────────────────────────────┤
│  Suggestion Banner (full width)         │
├─────────────────────────────────────────┤
│  Upload Panel (2 col)  │  Form Panel    │
│  - File Upload        │  - Room Type   │
│                       │  - Styles      │
│                       │  - Materials   │
│                       │  - Generate    │
├─────────────────────────────────────────┤
│  Latest Transformation Card (full width)│
│  - Before/After Images                  │
│  - Detect Products Button               │
├─────────────────────────────────────────┤
│  Product Sidebar (modal overlay)        │
│  - Detected Items                       │
│  - Product Matches                      │
│  - Export/Share                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Design Goals for Improvement

1. **Clarity** - Make the AI transformation process clear and intuitive
2. **Visual Hierarchy** - Emphasize key actions (Upload, Generate, Detect Products)
3. **Engagement** - Make the UI feel modern and interactive
4. **Efficiency** - Reduce form complexity, streamline the workflow
5. **Monetization** - Make product shopping seamless and discoverable
6. **Mobile-First** - Ensure great experience on all devices

---

## 📊 User Flow

```
1. Login/Signup
   ↓
2. Upload Room Image
   ↓
3. Select Room Type, Style, Materials
   ↓
4. Generate Transformation
   ↓
5. View Before/After
   ↓
6. Detect Products in Transformed Image
   ↓
7. Browse Product Matches
   ↓
8. Export/Share Shopping List
   ↓
9. Purchase Products (via affiliate links)
```

---

## 🔧 Technical Constraints

- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS + inline styles
- **Icons:** Lucide React
- **State Management:** Zustand
- **API:** Gemini 2.0 Flash for image analysis
- **Performance:** Optimized for mobile (81/100 PageSpeed score)

---

## 💬 Use This Prompt With Replit

You can use this description with Replit's UI generation by saying:

> "Based on this SPAVIX AI Room Transformation platform description, generate an improved UI design that:
> 1. Makes the image generation workflow more intuitive
> 2. Integrates the product shopping feature seamlessly
> 3. Improves visual hierarchy and engagement
> 4. Optimizes for both desktop and mobile
> 5. Uses modern design patterns and animations
> 6. Maintains dark/light theme support"

---

## 📝 Questions for Design Iteration

1. Should the product sidebar be a side panel or bottom drawer?
2. Should material selection use visual swatches or dropdowns?
3. Should we use a slider for before/after comparison?
4. Should the generate button be floating or sticky?
5. Should we show product images in the sidebar?
6. Should we have a preview of selections before generating?
7. Should we use more animations and micro-interactions?
8. Should the navbar be more prominent or minimal?

