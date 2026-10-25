# Conversation OS — Complete Application Encyclopedia
## The Living Handbook for Platform Architecture, Native Shell, SDK, and Experiences
**Version:** 1.0 (Production Pre-Launch)  
**Author:** Application Encyclopedia Lead / Senior Systems Architect  
**Date:** October 2026  

---

# Chapter 01 — Executive Overview & Product Thesis

### 1.1 What is Conversation OS?
Conversation OS (CVOS) is a universal, cross-platform interaction infrastructure designed to make every digital conversation interactive. Rather than requiring users to leave WhatsApp, Telegram, iMessage, Discord, or SMS to download bulky third-party apps, CVOS allows users to launch multiplayer games and collaborative tools straight from their keyboard drawer with a single link.

### 1.2 The Core Product Promise
- **Time to First Move (TTFM) < 0.8 seconds:** A friend tapping a CVOS link does not download an app, create an account, or enter a password. They are in the live room instantly.
- **Universal Cross-Platform:** Connects iPhone and Android users seamlessly without walled-garden barriers.
- **The Conversation Remains Center:** The chat is the destination; CVOS is merely the invisible interaction layer.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONVERSATION OS TOPOLOGY                         │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Native Mobile Host App ]                   [ Recipient Mobile / Web ]
 (Android IME / iOS Keyboard)                 (WhatsApp / Telegram Link)
             │                                             │
             ▼                                             ▼
 [ CVOS Play Dock ] ──► Generates Universal Link ──► [ Instant Mobile Webview ]
   (15 Stock Apps)      (cvos.app/r/room-123)          (Ghost Authentication)
             │                                             │
             └──────────────────────┬──────────────────────┘
                                    │
                                    ▼
                      [ Render Backend / WebSocket ]
                        (Socket.io State Sync Engine)
                                    │
                                    ▼
                        [ Supabase PostgreSQL DB ]
                        (RLS, Presence, Push Registry)
```

---

# Chapter 02 — Complete Feature & Experience Catalogue

The platform currently includes **15 verified First-Party Experiences** residing in `packages/demo-games/` and `packages/demo-apps/`:

### 2.1 Flagship Board & Card Suite
1. **CVOS Chess Masters (`packages/demo-games/cvos-chess`):**
   - Full rule engine via `chess.js` (Castling, En Passant, Pawn Promotion, Checkmate, Stalemate).
   - Real-time move broadcasting, legal move dots, capture indicators, and live spectator view.
2. **CVOS Uno Live (`packages/demo-games/cvos-uno`):**
   - 4-color custom card deck, card action effects (Skip, Reverse, Draw 2, Wild Draw 4), color picker, and tournament admit/deny lobby.
3. **Connect 4 (`packages/demo-games/connect-four`):**
   - 7x6 drop board, diagonal/horizontal/vertical win detector, automatic 2-player capacity enforcement.
4. **Tic-Tac-Toe (`packages/demo-games/tic-tac-toe`):**
   - Lightweight 3x3 turn-based board with instant reset and spectator badge.

### 2.2 Productivity & Collaboration Suite
5. **CVOS Whiteboard (`packages/demo-apps/cvos-whiteboard`):**
   - Infinite collaborative vector canvas, real-time stroke streaming, multi-color palette, and 1-tap PDF export (`jspdf`).
6. **CVOS Splitter (`packages/demo-apps/cvos-splitter`):**
   - Group receipt splitting with on-device camera capture and OCR (`Tesseract.js`). Chat participants tap items to claim shares in real time.
7. **CVOS Planner (`packages/demo-apps/cvos-planner`):**
   - Interactive availability calendar. Participants drag across visual hour slots to generate an instant group heatmap.

### 2.3 Party & Social Deduction Games
8. **Undercover (`packages/demo-games/undercover`):**
   - Social deduction game (Civilians, Undercover, Mr. White). Features secret word assignment, timed speaking rounds, and in-chat voting.
9. **Scribble Chat (`packages/demo-games/scribble-chat`):**
   - Turn-based drawing and guessing room with live canvas synchronization and in-game guess detection.
10. **Trivia Clash (`packages/demo-games/trivia-clash`):**
    - Timed multiple-choice trivia battle with real-time buzzer and scoreboards.

### 2.4 Word & Puzzle Games
11. **Wordle Blitz (`packages/demo-games/wordle-blitz`):**
    - Simultaneous multiplayer 5-letter word challenge with live opponent progress meters.
12. **Word Forge (`packages/demo-games/word-forge`):**
    - Real-time anagram builder and tile placement engine with dictionary validation.
13. **Shared Flashcards (`packages/demo-games/flashcards`):**
    - Real-time study session with question/answer card flipping.

### 2.5 Physics Arcade Titles
14. **Flick Darts (`packages/demo-games/flick-darts`):**
    - Touch gesture angle and velocity physics engine with standard dartboard point zones.
15. **Archery Clash (`packages/demo-games/archery-clash`):**
    - Dynamic wind vector simulation with bow release physics and target ring detection.

---

# Chapter 03 — Technical Architecture & Monorepo Structure

### 3.1 Repository Layout
```text
conversation_os/
├── apps/
│   ├── host-app/              # Expo React Native Native Mobile App (Android + iOS)
│   │   ├── plugins/           # Custom Expo Config Plugin for native Keyboard Service
│   │   ├── src/theme.js       # Central Bento Light design tokens
│   │   └── App.js             # Native host UI, Play Dock, and Ghost Auth engine
│   └── developer-portal/      # Self-serve web portal for third-party game creators
├── backend/                   # Node.js Express + Socket.io Server (Deployed on Render)
│   ├── src/services/          # Room matchmaking, auth, push notifications, Stripe
│   └── src/socket/            # Real-time WebSocket event dispatchers
└── packages/
    ├── sdk/                   # @cvos/sdk - React hook (useConversationOS)
    ├── demo-games/            # 11 independent React/Vite micro-games
    └── demo-apps/             # 3 independent React/Vite productivity applications
```

### 3.2 The Ghost Authentication Mechanism
- **File:** `apps/host-app/App.js` & `backend/src/services/auth.service.js`
- **How it works:** When a user first opens CVOS, `SecureStore` is checked for `cvos_device_id`. If absent, `Crypto.randomUUID()` generates an unforgeable device hash. The backend issues a lightweight JWT granting immediate session access without requesting emails, passwords, or phone numbers.
- **Account Upgrade:** When a user later enters billing or developer features, the ghost account seamlessly promotes to a Full Account without resetting game history.

### 3.3 The Custom Keyboard Config Plugin
- **File:** `apps/host-app/plugins/withCustomKeyboard.js`
- **Android Injection:** Injects `CvosKeyboardService.java` (`InputMethodService`) and `method.xml` during `expo prebuild`, ensuring Android registers the keyboard without manual native folder maintenance.
- **Apple iOS Injection:** Copies `KeyboardViewController.swift` and `Info.plist` into `ios/CVOSKeyboard`, operating within Apple's strict **50MB RAM limit** via a lightweight native Swift UICollectionView.

---

# Chapter 04 — Failure Modes, Security & Operations

### 4.1 Failure Modes & Mitigations
1. **Network Disconnection:** If a user loses cell reception in a subway, Socket.io heartbeats detect disconnection and maintain room state for 120 seconds, allowing seamless reconnection when signal returns.
2. **Spectator Flooding:** In 100-person group chats, game state broadcast is optimized via delta-compression over WebSockets so spectator volume does not degrade the active players' move latency.
3. **RAM Limits:** Games run as sandboxed webviews inside the host app shell or browser, preventing heavy game assets from causing OS-level keyboard memory crashes.

### 4.2 Security Architecture
- **Supabase Row Level Security (RLS):** All developer tables (`games`, `entitlements`, `payouts`) are locked down with strict RLS policies ensuring developers can only read and mutate their own titles.
- **Host Authoritative State:** Crucial game math (Uno card draws, Chess move legality, Connect 4 win checks) is evaluated authoritatively so clients cannot spoof game-winning moves.

---

# Chapter 05 — Owner's Operational Guidebook

### 5.1 How to Start the Host App Locally
```bash
cd "D:\desktop\Astute web\conversation_os\apps\host-app"
npx expo start
```

### 5.2 How to Build the Native Android Package (.apk)
```bash
cd "D:\desktop\Astute web\conversation_os\apps\host-app"
npx eas-cli build -p android --profile preview --clear-cache
```

### 5.3 How to Build the Apple iOS Package (TestFlight)
```bash
cd "D:\desktop\Astute web\conversation_os\apps\host-app"
npx eas-cli build -p ios --profile preview
```

### 5.4 Backend & API Status
- **Backend URL:** `https://cvos-backend.onrender.com`
- **Database:** Supabase PostgreSQL with verified RLS policies and push token registry.
- **Real-Time Port:** 10000 (Socket.io WebSockets with auto-reconnect).
