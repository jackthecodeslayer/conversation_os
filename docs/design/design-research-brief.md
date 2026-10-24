# CVOS User Experience — Design Research Brief

**Target Product:** Conversation OS (CVOS) — User Experience Layer (Mobile Host App, Keyboard Drawer, Discovery Storefront, In-Chat Active Sessions).  
**Date:** October 2026  
**Auditor / Designer:** Design Language Studio  

---

## 1. Product Context & User Problem

CVOS turns everyday messaging conversations (WhatsApp, iMessage, Telegram) into zero-install multiplayer rooms and collaborative experiences. 

### Core User Tasks:
1. **Browse & Discover:** In the middle of chatting, quickly swipe through a drawer of lightweight multiplayer games (Uno, Wordle Blitz, Connect 4) and utilities (Whiteboard, Splitter, Planner).
2. **Instant Launch & Invite:** Send a game invite into an existing chat without opening external apps or making friends register accounts (Ghost accounts give 0.5s time-to-first-move).
3. **Active Session Tracking:** Glance at ongoing turns, rematches, and live spectator lobbies directly in the host shell.
4. **Storefront Exploration:** Browse high-quality third-party and first-party experiences, view details, and pin favorites to the primary keyboard drawer.

---

## 2. Selected Design Systems Reference

### A. Apple Human Interface Guidelines (HIG) — Messages Extensions & App Drawer
- **Why it fits:** The primary mental model of CVOS is an OS-level keyboard/chat drawer similar to iMessage App Drawer and iOS input accessories.
- **Key Patterns Inspected:**
  - Compact drawer height vs. expanded modal presentation.
  - 44pt minimum touch target sizes.
  - Blur materials (translucent frosted glass, system grouped backgrounds `#F2F2F7`).
  - SF Pro typographic hierarchy: bold title headings with high-contrast primary labels.
- **Adopt:**
  - Standardized bottom drawer ergonomics and grabber handle for sheet transitions.
  - Segmented control and pill navigation for category filtering.
  - High-density bubble cards with recognizable glyphs and micro-metadata.
- **Adapt:**
  - Distinctive CVOS visual signature: incorporate CVOS brand accents (warm electric blue `#0A66C2` / `#0070F3` paired with playful brand orange `#FF8C42` from the logo) rather than purely generic monochrome iOS styling.
- **Reject:**
  - iOS-only proprietary SF Symbols and rigid Apple-only navigation stacks, ensuring cross-platform Android/Expo fidelity.

### B. Material Design 3 (M3) — Handheld Ergonomics & Surfaces
- **Why it fits:** CVOS is cross-platform (Android & iOS). M3 provides top-tier guidance for thumb-zone ergonomics, bottom sheets, surface tonal elevation, and touch feedback.
- **Key Patterns Inspected:**
  - Bottom sheet drag handles and dismiss physics.
  - Tonal palettes for container surfaces instead of harsh borders.
  - High-contrast text on elevated cards with WCAG AAA compliance.
- **Adopt:**
  - Surface elevations (`#FFFFFF` on `#F8FAFC` base) with soft, ambient diffusion shadows rather than heavy harsh borders (`borderWidth: 1`).
  - Active session state chips with clear pulse/turn indicators.
- **Reject:**
  - Oversized floating action buttons (FABs) and generic Material ripple effects that clash with the keyboard drawer format.

---

## 3. Product Reference Observations

| Reference | Workflow / Screen Inspected | Concrete Observation | Proposed Action for CVOS |
| :--- | :--- | :--- | :--- |
| **Apple iMessage App Drawer** | Bottom drawer strip under chat input | Horizontal scrolling carousel of high-contrast circular/squircle app icons with clear labels; minimal vertical footprint (<80pt in compact mode). | **Adopt & Polish:** Transform CVOS drawer bubbles into ergonomic squircles with crisp SVG icons/emojis, badges for active/pinned apps, and smooth touch-down states. |
| **Discord Activities (Voice/Chat Mini-games)** | In-chat game launch tray & active session banner | Top banner shows "Live Session in Progress" with joined player avatars and "Join / Spectate" buttons; zero ambiguity on whether a game is active. | **Adopt:** Replace the empty grey box in CVOS "Active Sessions" with an interactive card showing active participants, game thumbnail, and direct "Resume Turn" action. |
| **App Store Today / Arcade Tab** | App cards and Top Charts | Clear typographic contrast (`#000` title, `#8E8E93` metadata), pill buttons ("GET" / "ADDED"), structured modal bottom sheets with key metrics (players, category, rating). | **Adopt & Refine:** Elevate `Storefront.js` with richer product cards, transparent branding, and seamless install/remove feedback. |

---

## 4. Current State Deficit Analysis (Host App)

1. **Active Sessions Area:** Currently renders a static card saying *"No active sessions right now."* with hardcoded grey styling and no ability to simulate or preview live multiplayer rooms.
2. **Keyboard Drawer Height & Density:** Fixed at `320px` with a flat `#D1D5DB` iOS-grey background that looks dated and disconnected from the modern clean bento aesthetic of the demo games.
3. **Bubble Components:** The app bubbles use raw system text emojis and basic borders. They lack active status indicators, badge counters (e.g., "Your Turn"), and subtle tactile press states.
4. **Brand Presence:** The new CVOS logo and color palette (Deep navy/cobalt blue + warm solar orange) are not yet expressed in the host app shell or storefront.
5. **Storefront Integration:** Opening the storefront modal presents a solid `#F2F2F7` view without a unified navigation bar or animated bottom-sheet gesture.

---

## 5. Proposed Design Direction

- **Personality:** Tactile, Snappy, Playful, Ambient, Light-Bento.
- **Visual Thesis:** Turn the keyboard drawer from a dull grey input into an inviting **Play Dock** that feels native to mobile messaging while carrying a clear, energetic CVOS brand identity.
