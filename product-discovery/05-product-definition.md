# Conversation OS — Product Definition & Go-to-Market Strategy

**Product:** Conversation OS (CVOS)  
**Stage:** 5 & 7 — Definition, Economics, Distribution & Launch  
**Date:** October 2026  

---

## 1. Product Architecture & User Journey

### The Viral Loop (K-Factor > 1.2 Engine):
```
User A (Host) opens CVOS Play Dock in WhatsApp
   │
   ├─► Selects "Uno Live" ──► Universal room link generated (cvos.app/r/xyz)
   │
   ├─► Pastes into WhatsApp / iMessage group chat
   │
   ├─► User B (Player) taps link
   │      │
   │      ├─► Instant webview loads (<0.8s) via Ghost Auth (No account required)
   │      ├─► Plays turn & responds in chat
   │      └─► Sees prompt: "Add CVOS to your keyboard to challenge others"
   │
   └─► Users C, D, E (Group members) tap link
          └─► Automatically join as Live Spectators with zero setup!
```

---

## 2. Business Model & Unit Economics

### Revenue Streams:
1. **Developer Revenue Share (70/30 split):**
   - 3rd-party developers sell in-app items (e.g., custom card decks, hints, avatar skins, extra credits).
   - Processed via CVOS Stripe Connect. CVOS retains 30% platform margin; 70% paid out directly to developer accounts.
2. **First-Party Premium Unlocks:**
   - 100% margin on first-party titles (Uno tournaments, Whiteboard PDF high-res exports).
3. **No Intrusive Ads Policy:**
   - Ads (pop-ups, 30s unskippable video banners) are strictly forbidden in CVOS games. All experiences must feel ambient and native to conversations.

---

## 3. Go-to-Market & Launch Roadmap

### Phase 1 — First-Party Launch Suite (Complete):
- **Gaming:** Uno Live, Wordle Blitz, Connect 4, Flick Darts, Archery Clash, Word Forge, Trivia Clash, Undercover, Tic-Tac-Toe.
- **Productivity:** Collaborative Whiteboard, Receipt Splitter (with OCR), Meet Planner.
- **Infrastructure:** Real-time WebSocket engine on Render + Supabase RLS security + Expo Push Notifications.

### Phase 2 — Sideload Beta & Android Verification (In Progress):
- Sideload `.apk` distribution to early community testers to benchmark Time to First Move (TTFM) across cellular networks.
- Verification of push notifications when opponents play their turns.

### Phase 3 — App Store & Play Store Launch:
- Native keyboard extension injection via custom Expo Config Plugin.
- Public launch on Google Play Store and Apple App Store using verified listing copy and graphics.

### Phase 4 — Developer Ecosystem Activation:
- Public launch of `cvos-portal.vercel.app` for indie HTML5/React game creators.
- Developer hackathon offering prizes for the best conversational micro-experiences.
