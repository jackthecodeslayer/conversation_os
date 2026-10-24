import React, { useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, 
    SafeAreaView, Platform, StatusBar 
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { WebView } from 'react-native-webview';
import { THEME } from './src/theme';

// Stock First-Party Experiences available natively in the Play Dock
const STOCK_EXPERIENCES = [
    // Flagship Card & Board Games
    { id: '1', name: 'Chess Masters', emoji: '♟️', category: 'Classic Board', url: 'https://cvos-chess.vercel.app', isHot: true },
    { id: '2', name: 'Uno Live', emoji: '🃏', category: 'Card Game', url: 'https://cvos-uno.vercel.app', isHot: true },
    { id: '3', name: 'Wordle Blitz', emoji: '🟩', category: 'Word Puzzle', url: 'https://cvos-wordle.vercel.app', isHot: true },
    { id: '4', name: 'Connect 4', emoji: '🔴', category: 'Board Game', url: 'https://cvos-connect-four.vercel.app' },
    
    // Productivity & Collaboration Tools
    { id: '4', name: 'Whiteboard', emoji: '✏️', category: 'Productivity', url: 'https://cvos-whiteboard.vercel.app', isHot: true },
    { id: '5', name: 'Splitter', emoji: '🧾', category: 'Productivity', url: 'https://cvos-splitter.vercel.app', isHot: true },
    { id: '6', name: 'Planner', emoji: '📅', category: 'Productivity', url: 'https://cvos-planner.vercel.app' },
    
    // Social Party & Arcade Games
    { id: '7', name: 'Undercover', emoji: '🕵️', category: 'Party Game', url: 'https://cvos-undercover.vercel.app' },
    { id: '8', name: 'Scribble Chat', emoji: '🎨', category: 'Party Game', url: 'https://cvos-scribble.vercel.app' },
    { id: '9', name: 'Trivia Blitz', emoji: '🎯', category: 'Trivia Game', url: 'https://cvos-trivia.vercel.app' },
    { id: '10', name: 'Flick Darts', emoji: '🎯', category: 'Arcade', url: 'https://cvos-flick-darts.vercel.app' },
    { id: '11', name: 'Archery Clash', emoji: '🏹', category: 'Arcade', url: 'https://cvos-archery-clash.vercel.app' },
    { id: '12', name: 'Word Forge', emoji: '🔤', category: 'Word Game', url: 'https://cvos-word-forge.vercel.app' },
    { id: '13', name: 'Tic-Tac-Toe', emoji: '❌', category: 'Quick Match', url: 'https://cvos-tictactoe.vercel.app' },
];

export default function App() {
    const [activeWebView, setActiveWebView] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Live active sessions tracking
    const [activeSessions] = useState([
        {
            id: 'session-101',
            gameName: 'Uno Live',
            emoji: '🃏',
            opponentName: 'Sarah K.',
            status: 'YOUR TURN',
            isMyTurn: true,
            lastPlayed: '2m ago',
            url: 'https://cvos-uno.vercel.app'
        }
    ]);

    useEffect(() => {
        async function setupPushAndUser() {
            let deviceId = await SecureStore.getItemAsync('cvos_device_id');
            if (!deviceId) {
                deviceId = Crypto.randomUUID();
                await SecureStore.setItemAsync('cvos_device_id', deviceId);
            }
            
            let userObj = null;
            try {
                const res = await fetch('https://cvos-backend.onrender.com/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId })
                });
                const { user } = await res.json();
                setCurrentUser(user);
                userObj = user;
            } catch (_err) {
                userObj = { id: 'user-' + Math.floor(Math.random()*1000) };
                setCurrentUser(userObj);
            }

            // Register for Push Notifications
            if (Device.isDevice && userObj) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }
                
                if (finalStatus === 'granted') {
                    try {
                        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? "cvos-demo-project";
                        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
                        
                        await fetch('https://cvos-backend.onrender.com/api/notifications/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: userObj.id,
                                token: tokenData.data,
                                platform: Platform.OS
                            })
                        });
                    } catch (_e) {
                        // Silent push registration fallback
                    }
                }
            }
        }
        setupPushAndUser();
    }, []);

    const launchExperience = (url) => {
        const userId = currentUser?.id || 'demo-user';
        setActiveWebView(`${url}?roomId=demo-room&userId=${userId}`);
    };

    // Tactile Bubble Component for the Keyboard Play Dock
    const AppBubble = ({ app }) => (
        <TouchableOpacity 
            style={styles.bubble} 
            activeOpacity={0.78}
            onPress={() => launchExperience(app.url)}
        >
            <View style={styles.bubbleIconWrap}>
                <Text style={styles.bubbleEmoji}>{app.emoji}</Text>
                {app.isHot && <View style={styles.bubbleHotDot} />}
            </View>
            <View style={styles.bubbleTextContainer}>
                <Text style={styles.bubbleTitle} numberOfLines={1}>{app.name}</Text>
                <Text style={styles.bubbleSub} numberOfLines={1}>{app.category}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Navigation / Brand Header */}
            <View style={styles.topBar}>
                <View style={styles.brandRow}>
                    <View style={styles.brandLogoCircle}>
                        <Text style={styles.brandLogoText}>C</Text>
                    </View>
                    <View>
                        <Text style={styles.brandTitle}>Conversation OS</Text>
                        <Text style={styles.brandSubtitle}>Play in chat • Zero-install multiplayer</Text>
                    </View>
                </View>
                <View style={styles.statusPill}>
                    <View style={styles.statusLiveDot} />
                    <Text style={styles.statusPillText}>Ready</Text>
                </View>
            </View>

            {/* Top Viewport: In-Chat Live Activity Hub */}
            <View style={styles.chatArea}>
                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionBadge}>ACTIVE SESSIONS</Text>
                    <Text style={styles.activeCountBadge}>{activeSessions.length} live</Text>
                </View>

                {activeSessions.length > 0 ? (
                    activeSessions.map((session) => (
                        <TouchableOpacity 
                            key={session.id} 
                            style={styles.activeSessionCard}
                            activeOpacity={0.85}
                            onPress={() => launchExperience(session.url)}
                        >
                            <View style={styles.sessionIconBox}>
                                <Text style={styles.sessionEmoji}>{session.emoji}</Text>
                            </View>
                            <View style={styles.sessionMeta}>
                                <View style={styles.sessionHeaderRow}>
                                    <Text style={styles.sessionGameTitle}>{session.gameName}</Text>
                                    <View style={[styles.statusBadge, session.isMyTurn ? styles.statusBadgeTurn : styles.statusBadgeWait]}>
                                        <Text style={[styles.statusBadgeText, session.isMyTurn ? styles.statusBadgeTextTurn : styles.statusBadgeTextWait]}>
                                            {session.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.sessionOpponent}>vs. {session.opponentName} • {session.lastPlayed}</Text>
                            </View>
                            <View style={styles.resumeButton}>
                                <Text style={styles.resumeButtonText}>Play</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptySessionCard}>
                        <Text style={styles.emptySessionTitle}>No active games</Text>
                        <Text style={styles.emptySessionSub}>Tap any experience in the Play Dock below to challenge someone in your conversation.</Text>
                    </View>
                )}

                {/* Simulated Conversation Hint */}
                <View style={styles.chatPreviewBubble}>
                    <Text style={styles.chatPreviewSender}>Sarah K.</Text>
                    <Text style={styles.chatPreviewText}>"Rematch in Uno? Let's go! 🚀"</Text>
                </View>
            </View>

            {/* Bottom Viewport: The "Play Dock" (All First-Party Stock Experiences) */}
            <View style={styles.dockContainer}>
                {/* Dock Header */}
                <View style={styles.dockHeader}>
                    <View style={styles.dockHeaderLeft}>
                        <Text style={styles.dockTitle}>CVOS PLAY DOCK</Text>
                    </View>
                    <Text style={styles.dockCountBadge}>{STOCK_EXPERIENCES.length} Experiences</Text>
                </View>

                {/* Horizontal App Bubbles Carousel */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.bubbleScroll}
                >
                    {STOCK_EXPERIENCES.map(app => <AppBubble key={app.id} app={app} />)}
                </ScrollView>

                {/* Quick Share / Invite Banner */}
                <View style={styles.inviteCardSection}>
                    <View style={styles.inviteCard}>
                        <View style={styles.inviteIconBox}>
                            <Text style={styles.inviteEmoji}>💬</Text>
                        </View>
                        <View style={styles.inviteTextWrap}>
                            <Text style={styles.inviteCardTitle}>Play Anywhere in Chat</Text>
                            <Text style={styles.inviteCardSub}>Friends don't need the app to play with you. Links open instantly.</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Full-Screen Web View Modal for Active Games */}
            <Modal visible={!!activeWebView} animationType="slide">
                <SafeAreaView style={styles.modalFullContainer}>
                    <View style={styles.webviewHeader}>
                        <View style={styles.webviewTitleWrap}>
                            <Text style={styles.webviewTitle}>CVOS Session</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.doneBtnWrap}
                            onPress={() => setActiveWebView(null)}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.doneBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    {activeWebView && (
                        <WebView 
                            source={{ uri: activeWebView }} 
                            style={{ flex: 1 }} 
                            allowsInlineMediaPlayback
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: THEME.colors.bgApp 
    },
    
    // Top Bar Brand
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: THEME.spacing.lg,
        paddingTop: Platform.OS === 'android' ? 12 : 6,
        paddingBottom: THEME.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.borderSubtle,
        backgroundColor: THEME.colors.surfaceElevated,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    brandLogoCircle: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: THEME.colors.brandPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandLogoText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18,
    },
    brandTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: THEME.colors.textPrimary,
        letterSpacing: -0.2,
    },
    brandSubtitle: {
        fontSize: 11,
        color: THEME.colors.textSecondary,
        fontWeight: '500',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: THEME.radii.pill,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    statusLiveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: THEME.colors.success,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#065F46',
    },

    // Upper Chat Area
    chatArea: { 
        flex: 1, 
        paddingHorizontal: THEME.spacing.lg,
        paddingTop: THEME.spacing.lg,
        backgroundColor: THEME.colors.bgApp,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionBadge: { 
        fontSize: 11, 
        fontWeight: '800', 
        color: THEME.colors.textSecondary, 
        letterSpacing: 0.8,
    },
    activeCountBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: THEME.colors.brandPrimary,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: THEME.radii.pill,
    },
    
    // Active Match Card
    activeSessionCard: { 
        backgroundColor: THEME.colors.surfaceCard, 
        padding: 14, 
        borderRadius: THEME.radii.card, 
        borderWidth: 1, 
        borderColor: THEME.colors.borderSubtle,
        flexDirection: 'row',
        alignItems: 'center',
        ...THEME.shadows.card,
        marginBottom: 12,
    },
    sessionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    sessionEmoji: {
        fontSize: 22,
    },
    sessionMeta: {
        flex: 1,
    },
    sessionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sessionGameTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: THEME.colors.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusBadgeTurn: {
        backgroundColor: THEME.colors.successBg,
    },
    statusBadgeWait: {
        backgroundColor: THEME.colors.surfaceMuted,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    statusBadgeTextTurn: {
        color: THEME.colors.success,
    },
    statusBadgeTextWait: {
        color: THEME.colors.textSecondary,
    },
    sessionOpponent: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        marginTop: 3,
    },
    resumeButton: {
        backgroundColor: THEME.colors.brandPrimary,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: THEME.radii.pill,
    },
    resumeButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },

    emptySessionCard: {
        backgroundColor: THEME.colors.surfaceCard,
        padding: 16,
        borderRadius: THEME.radii.card,
        borderWidth: 1,
        borderColor: THEME.colors.borderSubtle,
        marginBottom: 12,
    },
    emptySessionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.colors.textPrimary,
        marginBottom: 4,
    },
    emptySessionSub: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        lineHeight: 16,
    },

    // Chat Bubble Hint
    chatPreviewBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
        marginTop: 8,
        maxWidth: '82%',
        borderWidth: 1,
        borderColor: THEME.colors.borderSubtle,
        ...THEME.shadows.soft,
    },
    chatPreviewSender: {
        fontSize: 11,
        fontWeight: '700',
        color: THEME.colors.brandPrimary,
        marginBottom: 2,
    },
    chatPreviewText: {
        fontSize: 14,
        color: THEME.colors.textPrimary,
    },

    // Bottom Play Dock (Keyboard Drawer)
    dockContainer: { 
        backgroundColor: '#F1F5F9',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 18 : 12,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.borderProminent,
        ...THEME.shadows.dock,
    },
    dockHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: THEME.spacing.lg, 
        marginBottom: 10,
    },
    dockHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dockTitle: { 
        fontSize: 12, 
        fontWeight: '800', 
        color: THEME.colors.textSecondary, 
        letterSpacing: 0.6,
    },
    dockCountBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: THEME.colors.textSecondary,
        backgroundColor: THEME.colors.surfaceCard,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: THEME.radii.pill,
        borderWidth: 1,
        borderColor: THEME.colors.borderSubtle,
    },

    // Bubbles
    bubbleScroll: { 
        paddingHorizontal: THEME.spacing.lg, 
        gap: 10, 
        paddingBottom: 12,
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.surfaceCard,
        borderRadius: THEME.radii.bubble,
        paddingRight: 14,
        paddingLeft: 6,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: THEME.colors.borderSubtle,
        ...THEME.shadows.soft,
    },
    bubbleIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        position: 'relative',
    },
    bubbleEmoji: { 
        fontSize: 18, 
    },
    bubbleHotDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: THEME.colors.brandSecondary,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    bubbleTextContainer: {
        justifyContent: 'center',
    },
    bubbleTitle: { 
        fontSize: 13, 
        fontWeight: '700', 
        color: THEME.colors.textPrimary,
    },
    bubbleSub: {
        fontSize: 10,
        fontWeight: '500',
        color: THEME.colors.textSecondary,
    },

    // Invite Card Section
    inviteCardSection: {
        paddingHorizontal: THEME.spacing.lg,
        marginTop: 2,
    },
    inviteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: THEME.radii.card,
        padding: 12,
        borderWidth: 1,
        borderColor: THEME.colors.borderSubtle,
        ...THEME.shadows.soft,
    },
    inviteIconBox: {
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        backgroundColor: '#EFF6FF',
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    inviteEmoji: { 
        fontSize: 20, 
    },
    inviteTextWrap: {
        flex: 1,
    },
    inviteCardTitle: { 
        fontSize: 13, 
        fontWeight: '800', 
        color: THEME.colors.textPrimary,
    },
    inviteCardSub: { 
        fontSize: 11, 
        color: THEME.colors.textSecondary, 
        marginTop: 2,
        lineHeight: 15,
    },

    // Webview Full-screen Modal
    modalFullContainer: { 
        flex: 1, 
        backgroundColor: '#0F172A' 
    },
    webviewHeader: { 
        height: 48, 
        backgroundColor: '#1E293B', 
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155'
    },
    webviewTitleWrap: {
        flex: 1,
    },
    webviewTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F8FAFC',
    },
    doneBtnWrap: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: THEME.radii.pill,
    },
    doneBtnText: { 
        fontSize: 13, 
        fontWeight: '700', 
        color: '#FFFFFF' 
    },
});
