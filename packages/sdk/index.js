import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// ── Default backend URL ────────────────────────────────────────────────────────
const DEFAULT_BACKEND_URL = 'https://cvos-backend.onrender.com';

// ── createCvosClient ──────────────────────────────────────────────────────────
/**
 * Initialises the CVOS client. Returns an object with all SDK methods.
 *
 * @example
 * const cvos = createCvosClient({ gameId: 'my-game', publishableKey: 'pk_prod_...' });
 */
export function createCvosClient({ gameId, publishableKey, backendUrl } = {}) {
    if (!gameId) throw new Error('[cvos/sdk] gameId is required');
    if (!publishableKey)  throw new Error('[cvos/sdk] publishableKey is required');

    const BASE = backendUrl || DEFAULT_BACKEND_URL;
    const HEADERS = { 'Content-Type': 'application/json', 'X-API-Key': publishableKey };

    // Shared in-memory state (set when the React hook runs)
    let _socket = null;
    let _session = null;
    let _user    = null;

    // Event listener registry
    const _listeners = {};

    function _emit(event, data) {
        if (_listeners[event]) {
            _listeners[event].forEach(fn => {
                try { fn(data); } catch (e) { console.error(`[cvos] listener error (${event}):`, e); }
            });
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    const cvos = {
        _setSocket(socket) { _socket = socket; },
        _setSession(session) { _session = session; },
        _setUser(user)    { _user = user; },
        _emit,

        /**
         * Subscribe to real-time events.
         * @param {'move'|'player.joined'|'player.left'|'session.started'|'session.ended'|'presence.update'} event
         */
        on(event, handler) {
            if (!_listeners[event]) _listeners[event] = [];
            _listeners[event].push(handler);
            return () => {
                _listeners[event] = _listeners[event].filter(fn => fn !== handler);
            };
        },

        /** Broadcast a game action to all session participants. */
        send(event, payload) {
            if (!_socket) throw new Error('[cvos] Not connected. Call useConversationOS() first.');
            _socket.emit('game_action', { roomId: _session?.roomId, action: { type: event, ...payload } });
        },

        /** Returns current session metadata. */
        getSession() {
            return _session;
        },

        /** Returns the authenticated user object. */
        getUser() {
            return _user;
        },

        // ── Store API ─────────────────────────────────────────────────────────
        store: {
            /** Fetch all products defined for this game. */
            async getProducts() {
                const res = await fetch(`${BASE}/api/games/${gameId}/products`, { headers: HEADERS });
                if (!res.ok) throw new Error(`getProducts failed: ${res.status}`);
                const { products } = await res.json();
                return products;
            },

            /**
             * Check if the current user owns an entitlement.
             * @returns {Promise<boolean>}
             */
            async checkEntitlement(entitlementId) {
                if (!_user?.id) return false;
                const res = await fetch(
                    `${BASE}/api/store/entitlement/${entitlementId}?userId=${_user.id}`,
                    { headers: HEADERS }
                );
                if (!res.ok) throw new Error(`checkEntitlement failed: ${res.status}`);
                const { owned } = await res.json();
                return owned;
            },

            /**
             * Trigger the CVOS-hosted payment sheet.
             * Resolves with { success: true } after payment is confirmed.
             * Rejects if the user cancels or payment fails.
             */
            async purchase(entitlementId) {
                if (!_user?.id) throw new Error('[cvos] User must be authenticated to purchase');

                const res = await fetch(`${BASE}/api/store/purchase`, {
                    method: 'POST',
                    headers: HEADERS,
                    body: JSON.stringify({ userId: _user.id, entitlementId }),
                });
                if (!res.ok) {
                    const { error } = await res.json();
                    throw new Error(error || 'Purchase failed');
                }

                const { clientSecret } = await res.json();

                // Open the payment sheet — relies on @stripe/stripe-react-native in the host app.
                // The SDK fires a 'purchase.complete' event when the webhook confirms it.
                return new Promise((resolve, reject) => {
                    // Signal to the host app that a Stripe payment sheet should open
                    _emit('purchase.initiated', { clientSecret, entitlementId });

                    // Wait for the entitlement.granted WebSocket event (fired after Stripe webhook)
                    const unsub = cvos.on('entitlement.granted', (data) => {
                        if (data.entitlementId === entitlementId) {
                            unsub();
                            resolve({ success: true, entitlementId });
                        }
                    });

                    // Timeout after 5 minutes
                    setTimeout(() => {
                        unsub();
                        reject(new Error('Purchase timed out'));
                    }, 300_000);
                });
            },

            /** Get the user's current consumable credit balance for this game. */
            async getBalance() {
                if (!_user?.id) return 0;
                const res = await fetch(
                    `${BASE}/api/store/balance?userId=${_user.id}&gameId=${gameId}`,
                    { headers: HEADERS }
                );
                if (!res.ok) throw new Error(`getBalance failed: ${res.status}`);
                const { balance } = await res.json();
                return balance;
            },
        },

        /**
         * Send a push notification to the players whose turn it is.
         * Requires the host app to have registered push tokens.
         */
        async notify(message) {
            if (!_session?.roomId) return;
            await fetch(`${BASE}/api/notifications/send`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({
                    userIds: message.userIds,
                    title: message.title || 'Your turn!',
                    body: message.body || "It's your move.",
                    data: { roomId: _session.roomId, gameId, ...message.data },
                }),
            });
        },

        /**
         * Persist arbitrary JSON to the user's cloud save for this game.
         * Data survives server restarts and reconnections.
         */
        async save(key, value) {
            if (!_session?.roomId) throw new Error('[cvos] No active session to save to');
            const current = await cvos.load(key);
            const newState = { ...current, [key]: value };
            // Included as newState in the next game_action so the server persists it
            _emit('__save', { key, value, mergedState: newState });
            return { success: true };
        },

        /** Load a previously saved value from cloud save. */
        async load(key) {
            if (!_session?.roomId) return null;
            const res = await fetch(`${BASE}/api/rooms/${_session.roomId}/state`, { headers: HEADERS });
            if (!res.ok) return null;
            const { state } = await res.json();
            return key ? (state[key] ?? null) : state;
        },
    };

    // Attach credentials to the client object for use by hooks
    cvos._publishableKey = publishableKey;
    cvos._backendUrl = backendUrl;

    return cvos;
}

// ── useConversationOS ─────────────────────────────────────────────────────────
/**
 * The core React Hook for CVOS experiences.
 * Manages the Socket.io connection, room lifecycle, and exposes the cvos client.
 *
 * @param {Object} cvos         - Client returned by createCvosClient()
 * @param {string} roomId       - Room ID from the universal link
 * @param {string} userId       - Current user's CVOS ID
 * @param {string} requestedRole - 'player' | 'spectator'
 */
export function useConversationOS(cvos, roomId, userId, requestedRole = 'player') {
    const [gameState,    setGameState]    = useState(null);
    const [participants, setParticipants] = useState([]);
    const [roomStatus,   setRoomStatus]   = useState('connecting');
    const [myRole,       setMyRole]       = useState(null);
    const [error,        setError]        = useState(null);

    const socketRef = useRef(null);

    const backendUrl = cvos._backendUrl || 'https://cvos-backend.onrender.com';
    const publishableKey = cvos._publishableKey;

    useEffect(() => {
        if (!roomId || !userId) return;

        const socket = io(backendUrl, {
            transports: ['websocket'],
            auth: { apiKey: publishableKey },
            autoConnect: true,
        });

        socketRef.current = socket;
        cvos._setSocket(socket);

        socket.on('connect', () => {
            socket.emit('join_room', { roomId, userId, requestedRole }, (response) => {
                if (response.success) {
                    setMyRole(response.participant.role);
                    setRoomStatus('lobby');
                    cvos._setSession({ roomId, role: response.participant.role });

                    // Restore persisted state if it exists
                    if (response.participant.gameState) {
                        setGameState(response.participant.gameState);
                        cvos._emit('state.restored', response.participant.gameState);
                    }
                } else {
                    setRoomStatus('error');
                    setError(response.error);
                }
            });
        });

        socket.on('participant_joined', ({ participant }) => {
            setParticipants(prev => [...prev, participant]);
            cvos._emit('player.joined', participant);
        });

        socket.on('game_started', () => {
            setRoomStatus('active');
            cvos._emit('session.started', { roomId });
        });

        socket.on('game_action_received', (data) => {
            setGameState(data);
            cvos._emit('move', data);
        });

        // entitlement.granted — fired from server after Stripe webhook
        socket.on('entitlement.granted', (data) => {
            cvos._emit('entitlement.granted', data);
        });

        socket.on('disconnect', () => {
            cvos._emit('player.left', { userId, reason: 'disconnect' });
        });

        socket.on('connect_error', (err) => {
            setError(err.message);
            setRoomStatus('error');
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [roomId, userId, requestedRole]);

    const sendAction = useCallback((action, newState) => {
        const socket = socketRef.current;
        if (!socket || roomStatus !== 'active') return;
        if (myRole === 'spectator') {
            console.warn('[cvos] Spectators cannot send game actions.');
            return;
        }
        socket.emit('game_action', { roomId, action, userId, newState });
        if (newState !== undefined) setGameState(newState);
    }, [roomId, userId, myRole, roomStatus]);

    const startGame = useCallback(() => {
        const socket = socketRef.current;
        if (!socket || myRole !== 'host') return;
        socket.emit('start_game', { roomId, hostId: userId });
    }, [roomId, userId, myRole]);

    return { roomStatus, myRole, participants, gameState, error, sendAction, startGame };
}

// ── Legacy hook export (backwards compat) ─────────────────────────────────────
/** @deprecated Use createCvosClient() + useConversationOS() instead */
export function useCvos(roomId, userId, requestedRole = 'player') {
    const client = createCvosClient({
        gameId: 'legacy',
        apiKey: typeof process !== 'undefined' ? process.env?.CVOS_API_KEY : '',
    });
    return useConversationOS(client, roomId, userId, requestedRole);
}
