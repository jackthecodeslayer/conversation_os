# CVOS User Experience — Design Direction & System Specification

## 1. Design Intent & Personality
- **Intent:** Allow users chatting with friends to discover, launch, and jump back into multiplayer games in less than 2 seconds, without feeling like they are leaving their conversation.
- **Personality Attributes:**
  1. **Tactile:** High feedback on press, rounded squircle tokens (`16px`-`24px`), gentle diffused elevation shadows.
  2. **Snappy:** Micro-animations for sheet expansion and bubble taps; immediate visual confirmation.
  3. **Playful yet Restrained:** Clean light backgrounds (`#F8FAFC`), crisp dark slate typography (`#0F172A`), with deliberate energetic accents (Cobalt `#0066FF` and Solar Orange `#FF8C42`).
  4. **Context-Aware:** Clear division between "Chat Conversation / Active Matches" (top viewport) and "Keyboard Play Dock" (bottom viewport).

---

## 2. Token Architecture & Foundations

### Color Tokens
```javascript
export const CVOS_THEME = {
  colors: {
    // Brand
    brandPrimary: '#0066FF',      // Cobalt Blue (from logo)
    brandSecondary: '#FF8C42',    // Solar Orange (from logo)
    brandDark: '#0A192F',         // Midnight Navy
    
    // Backgrounds & Surfaces
    bgApp: '#F8FAFC',             // Clean light slate
    surfaceCard: '#FFFFFF',       // Pure white card
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F1F5F9',      // Subtle neutral for icon backdrops
    dockBg: '#E2E8F0',            // Refined keyboard platform grey
    
    // Text Hierarchy
    textPrimary: '#0F172A',       // Slate 900 - High contrast WCAG AAA
    textSecondary: '#64748B',     // Slate 500
    textMuted: '#94A3B8',         // Slate 400
    textInverse: '#FFFFFF',
    
    // Functional & Feedback
    success: '#10B981',           // Active turn indicator green
    warning: '#F59E0B',           // Pending invitation yellow
    danger: '#EF4444',            // Deny / error red
    borderSubtle: '#E2E8F0',
    borderProminent: '#CBD5E1',
  },
  
  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    bubble: {
      shadowColor: '#0066FF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    floating: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    }
  },
  
  radii: {
    pill: 9999,
    card: 18,
    bubble: 22,
    icon: 14,
    sheet: 26,
  }
};
```

---

## 3. Component Design Rules

### A. The "Play Dock" (Keyboard Area)
- Replace flat muddy `#D1D5DB` with a polished, modern container using clean border separators and subtle backdrop lighting.
- Section header displays an icon + label + count badge (e.g., `EXPERIENCES · 6`).
- App bubbles feature:
  - Squircle icon container with subtle brand gradient ring when an active game exists.
  - Distinct app name label with bold primary text.
  - Touch down opacity feedback (`0.75`).
- Storefront banner:
  - Clean bento card with an inviting icon, high-contrast title, description, and chevron action indicator.

### B. "Active Sessions" Hub (Chat Area)
- Transform the empty placeholder into an interactive live session tracker:
  - When sessions exist: displays thumbnail preview, opponent avatars, turn countdown badge (`YOUR MOVE`), and instant "Resume" CTA.
  - When empty: displays a friendly empty state with quick recommendations to start a match.

### C. Discovery Storefront Modal
- Apple App Store / Arcade style navigation bar with pull-down handle and transparent close action.
- Filter chips with smooth selection states (Black pill when active, light neutral pill when inactive).
- Rich product cards with Star rating, player count, and "GET" / "ADDED" badge transitions.
- Game detail modal with clear feature bullets and "Quick Play" test launcher.
