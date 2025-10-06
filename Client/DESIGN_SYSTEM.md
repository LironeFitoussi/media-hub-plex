# 🎨 Design System - iOS 26 Glassy Theme

## Overview
This design system provides a comprehensive guide for creating consistent, modern UI components with a light glassy aesthetic inspired by iOS 26 design principles.

## 🎯 Design Principles

### 1. **Glass Morphism**
- Semi-transparent backgrounds with blur effects
- Layered depth with subtle shadows
- Light, airy feel with transparency

### 2. **Modern iOS Aesthetics**
- Rounded corners with consistent radius
- Smooth animations and transitions
- Clean typography with proper hierarchy
- Subtle color palette with blue accents

### 3. **Consistency**
- Unified spacing and sizing system
- Consistent interaction patterns
- Harmonious color relationships

## 🎨 Color Palette

### Primary Colors
```css
/* Glass Backgrounds */
bg-white/20          /* Main glass background */
bg-white/40          /* Hover glass background */
bg-white/90          /* Solid glass background */

/* Borders */
border-white/30       /* Main glass borders */
border-white/50       /* Stronger glass borders */

/* Text Colors */
text-gray-700         /* Primary text */
text-gray-600         /* Secondary text */
text-gray-500         /* Tertiary text */
text-gray-800         /* Dark text on light backgrounds */

/* Accent Colors */
text-blue-600         /* Primary accent */
text-blue-500         /* Secondary accent */
bg-blue-500           /* Accent backgrounds */
```

### Status Colors
```css
/* Success */
text-green-600
bg-green-100
border-green-200

/* Warning */
text-yellow-600
bg-yellow-100
border-yellow-200

/* Error */
text-red-600
bg-red-100
border-red-200

/* Info */
text-blue-600
bg-blue-100
border-blue-200
```

## 📐 Spacing & Sizing

### Border Radius
```css
rounded-xl           /* 12px - Small elements */
rounded-2xl          /* 16px - Medium elements */
rounded-3xl          /* 24px - Large containers */
```

### Padding & Margins
```css
/* Small elements */
p-2, px-2, py-2     /* 8px */
p-3, px-3, py-3     /* 12px */

/* Medium elements */
p-4, px-4, py-4     /* 16px */
p-6, px-6, py-6     /* 24px */

/* Large elements */
p-8, px-8, py-8     /* 32px */
```

### Icon Sizes
```css
w-3 h-3             /* 12px - Small icons */
w-4 h-4             /* 16px - Standard icons */
w-5 h-5             /* 20px - Large icons */
w-6 h-6             /* 24px - Extra large icons */
```

## 🎭 Component Patterns

### 1. **Glass Containers**
```css
/* Standard glass container */
bg-white/20 backdrop-blur-xl rounded-3xl shadow-lg border border-white/30

/* Hover glass container */
hover:bg-white/40 hover:shadow-xl

/* Solid glass container */
bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50
```

### 2. **Interactive Elements**
```css
/* Primary button */
bg-white/90 hover:bg-white text-blue-600 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300

/* Secondary button */
bg-white/40 hover:bg-white/60 text-gray-700 rounded-xl transition-all duration-300

/* Icon button */
rounded-2xl bg-white/90 hover:bg-white text-blue-600 h-8 w-8 shadow-sm hover:shadow-md transition-all duration-300
```

### 3. **Navigation Elements**
```css
/* Active navigation item */
bg-white/90 text-blue-600 shadow-lg shadow-blue-500/20

/* Inactive navigation item */
text-gray-600 hover:bg-white/40 hover:text-gray-800

/* Navigation container */
bg-white/20 backdrop-blur-xl rounded-3xl px-4 py-3 shadow-lg border border-white/30
```

### 4. **Cards & Content**
```css
/* Standard card */
bg-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300

/* Selected card */
bg-white/40 border-blue-200 shadow-lg shadow-blue-500/20

/* Card content */
text-gray-700 hover:text-blue-600 transition-colors duration-300
```

## 🎬 Animation Guidelines

### Duration Standards
```css
duration-200         /* Quick interactions (150ms) */
duration-300         /* Standard transitions (300ms) */
duration-500         /* Complex animations (500ms) */
```

### Easing Functions
```css
ease-out            /* Standard easing */
ease-in-out         /* Smooth transitions */
ease-in             /* Entrance animations */
```

### Scale Animations
```css
hover:scale-105      /* Subtle hover */
hover:scale-110      /* Medium hover */
scale-95            /* Pressed state */
```

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px           /* Small devices */
md: 768px           /* Medium devices */
lg: 1024px          /* Large devices */
xl: 1280px          /* Extra large devices */
```

### Mobile-First Approach
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly sizing (minimum 44px touch targets)

## 🔧 Implementation Guidelines

### 1. **Component Structure**
```tsx
// Always use motion for animations
import { motion } from "framer-motion";

// Consistent class structure
className="bg-white/20 backdrop-blur-xl rounded-3xl px-4 py-3 shadow-lg border border-white/30 transition-all duration-300"
```

### 2. **State Management**
```tsx
// Active states
className={`${baseClasses} ${isActive ? 'bg-white/90 text-blue-600 shadow-lg shadow-blue-500/20' : 'text-gray-600 hover:bg-white/40'}`}
```

### 3. **Accessibility**
- Maintain proper contrast ratios
- Include focus states
- Use semantic HTML elements
- Provide alt text for images

### 4. **Performance**
- Use `backdrop-blur-xl` sparingly
- Optimize animations for 60fps
- Lazy load heavy components

## 📋 Component Checklist

When creating new components, ensure:

- [ ] Uses glass morphism background (`bg-white/20` or `bg-white/90`)
- [ ] Includes `backdrop-blur-xl` for glass effect
- [ ] Has consistent border radius (`rounded-xl`, `rounded-2xl`, `rounded-3xl`)
- [ ] Uses proper spacing (`p-4`, `px-4`, `py-3`)
- [ ] Includes smooth transitions (`transition-all duration-300`)
- [ ] Has hover states with appropriate scaling
- [ ] Uses blue accent colors for active states
- [ ] Follows typography hierarchy
- [ ] Is responsive and mobile-friendly
- [ ] Includes proper accessibility features

## 🎨 Example Components

### Button Component
```tsx
<motion.button
  className="bg-white/90 hover:bg-white text-blue-600 rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300 font-semibold"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Button Text
</motion.button>
```

### Card Component
```tsx
<motion.div
  className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300"
  whileHover={{ y: -2 }}
>
  Card Content
</motion.div>
```

### Navigation Item
```tsx
<Link
  className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
  to="/path"
>
  Navigation Item
</Link>
```

## 🔄 Migration Guide

When updating existing components:

1. **Replace dark backgrounds** with glass backgrounds
2. **Update border radius** to use consistent rounded corners
3. **Add backdrop blur** for glass effect
4. **Update color scheme** to use gray text with blue accents
5. **Enhance animations** with smooth transitions
6. **Improve hover states** with subtle scaling
7. **Add proper shadows** for depth

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Glass Morphism Design Trends](https://www.figma.com/blog/glassmorphism-in-user-interface/)

---

*This design system is living documentation and should be updated as the design evolves.*
