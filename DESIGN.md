---
name: Wassla Premium
description: A high-contrast, hardware-precise design system for Djerba's pulse.
colors:
  primary: "#111111"
  neutral-bg: "#FAFAFA"
  neutral-text: "#111111"
  neutral-muted: "#888888"
  accent: "#000000"
typography:
  display:
    fontFamily: "Outfit, Inter, sans-serif"
    fontWeight: 700
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
    fontSize: "16px"
rounded:
  sm: "4px"
  md: "12px"
  lg: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
---

<!-- SEED — re-run $impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Wassla Premium

## 1. Overview

**Creative North Star: "The Luminous Monolith"**

A design system that feels like a piece of precision-engineered hardware. It rejects the standard "tech" clutter in favor of high-contrast minimalism and bold, intentional hierarchy. It is a "Sophisticated Utility" that gives users a sense of exclusive access to the island's rhythm.

**Key Characteristics:**
- **Luminous Minimalist**: Driven by pure whites and sharp blacks.
- **Hardware-Precise**: Every element feels physical, with generous spacing and sharp radii.
- **Information Density**: High-utility data is prioritized through scale and weight, not color.

## 2. Colors

**The Monolith Palette.** A restrained, monochrome strategy where color is used only for extreme emphasis or functional feedback.

### Primary
- **Obsidian Black** (#111111): Used for primary headings, call-to-action backgrounds, and heavy structural elements.

### Neutral
- **Alabaster White** (#FAFAFA): The canvas. A slightly warm, tinted white that feels premium and reduces glare.
- **Stone Gray** (#888888): Used for secondary text, metadata, and subtle borders.

### Named Rules
**The Rare Contrast Rule.** Dark elements must never occupy more than 15% of the total surface area. Their presence should feel like a deliberate "stamp" on the light canvas.

## 3. Typography

**Display Font:** Outfit (Bold, geometric)
**Body Font:** Inter (Clean, high-legibility)

**Character:** High-tech precision meets editorial clarity. The contrast between heavy Outfit headings and crisp Inter body text creates a "hardware" feel.

### Hierarchy
- **Display** (700, 32px+, 1.1): Hero titles and large data points (e.g., arrival times).
- **Headline** (600, 20px, 1.2): Section headers.
- **Body** (400, 16px, 1.5): Primary informational text. Max line length 65ch.
- **Label** (500, 12px, 0.05em, Uppercase): Overlines, tags, and small metadata.

## 4. Elevation

**The Layered Light Rule.** Depth is conveyed through subtle tonal shifts and extremely soft, large-radius shadows.

### Shadow Vocabulary
- **Ambient Lift** (`box-shadow: 0 4px 24px rgba(0,0,0,0.04)`): Used for primary cards to separate them from the Alabaster background.

## 5. Components

[Seed: Canonical primitives to be synthesized at implementation]

### Buttons
- **Shape:** Soft-cornered rectangles (12px radius).
- **Primary:** Obsidian Black background with Alabaster White text. No border.
- **Secondary:** Ghost style. Thin Obsidian border (1px) with Obsidian text.

### Cards
- **Corner Style:** Large radius (24px).
- **Background:** Pure White (#FFFFFF).
- **Shadow:** Ambient Lift.

## 6. Do's and Don'ts

### Do:
- **Do** use generous whitespace (32px+ margins) to create a premium, "breathable" feel.
- **Do** use uppercase labels for all metadata to maintain a technical, precise tone.
- **Do** rely on font weight (Bold vs. Regular) for hierarchy rather than multiple colors.

### Don't:
- **Don't** use Dark Mode. The interface must always remain luminous.
- **Don't** use standard Material Design components like Floating Action Buttons.
- **Don't** use bright neon accents or saturated gradients.
- **Don't** use thin, low-contrast lines. Every line should be intentional and visible.
