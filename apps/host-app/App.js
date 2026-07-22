import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, SafeAreaView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { WebView } from 'react-native-webview';
import Storefront from './src/screens/Storefront';

const { width } = Dimensions.get('window');

// Default apps available on the keyboard
const DEFAULT_APPS = [
    { id: '1', name: 'Uno', emoji: '🃏', url: 'https://cvos-uno.vercel.app' },
    { id: '2', name: 'Whiteboard', emoji: '✏️', url: 'https://cvos-whiteboard.vercel.app' },
    { id: '3', name: 'Wordle', emoji: '🟩', url: 'https://cvos-wordle.vercel.app' },
    { id: '4', name: 'Tic-Tac-Toe', emoji: '❌', url: 'https://cvos-tictactoe.vercel.app' },
    { id: '5', name: 'Polls', emoji: '📊', url: 'https://cvos-polls.vercel.app' },
    { id: '6', name: 'Trivia', emoji: '🎯', url: 'https://cvos-trivia.vercel.app' }
];

export default function App() {
    const [storeOpen, setStoreOpen] = useState(false);
    const [activeWebView, setActiveWebView] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

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
            } catch (err) {
                console.error("Failed to init ghost account:", err);
                userObj = { id: 'fallback-' + Math.floor(Math.random()*1000) };
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
                        
                        // Send token to backend
                        await fetch('https://cvos-backend.onrender.com/api/notifications/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: userObj.id,
                                token: tokenData.data,
                                platform: Platform.OS
                            })
                        });
                    } catch (e) {
                        console.log("Push registration error:", e);
                    }
                }
            }
        }
        setupPushAndUser();
    }, []);

    // Bubble Component (iMessage style)
    const AppBubble = ({ app }) => (
        <TouchableOpacity 
            style={styles.bubble} 
            activeOpacity={0.7}
            onPress={() => {
                if (currentUser) {
                    setActiveWebView(`${app.url}?roomId=demo-room&userId=${currentUser.id}`);
                }
            }}
        >
            <View style={styles.bubbleIcon}>
                <Text style={styles.bubbleEmoji}>{app.emoji}</Text>
            </View>
            <Text style={styles.bubbleText} numberOfLines={1}>{app.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Half: Chat/Active Sessions Area */}
            <View style={styles.chatArea}>
                <Text style={styles.chatHeader}>Active Sessions</Text>
                <View style={styles.activeSessionCard}>
                    <Text style={styles.activeSessionText}>No active sessions right now.</Text>
                </View>
            </View>

            {/* Bottom Half: "The Keyboard" */}
            <View style={styles.keyboardArea}>
                
                {/* Section 1: Default Experiences */}
                <View style={styles.keyboardHeader}>
                    <Text style={styles.keyboardTitle}>CVOS Experiences</Text>
                </View>

                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.bubbleScroll}
                >
                    {DEFAULT_APPS.map(app => <AppBubble key={app.id} app={app} />)}
                </ScrollView>

                {/* Section 2: Storefront */}
                <View style={styles.storefrontSection}>
                    <TouchableOpacity style={styles.storefrontButton} onPress={() => setStoreOpen(true)} activeOpacity={0.8}>
                        <View style={styles.storefrontIcon}>
                            <Text style={{ fontSize: 18 }}>🛍️</Text>
                        </View>
                        <View>
                            <Text style={styles.storefrontTitle}>CVOS Storefront</Text>
                            <Text style={styles.storefrontSub}>Browse more games and apps</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Full Screen Web View for Games */}
            <Modal visible={!!activeWebView} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                    <View style={styles.webviewHeader}>
                        <TouchableOpacity onPress={() => setActiveWebView(null)}>
                            <Text style={styles.closeBtn}>Done</Text>
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

            {/* Full Screen Storefront */}
            <Modal visible={storeOpen} animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#F2F2F7', paddingTop: 40 }}>
                    <View style={styles.webviewHeader}>
                        <TouchableOpacity onPress={() => setStoreOpen(false)}>
                            <Text style={styles.closeBtn}>Close Store</Text>
                        </TouchableOpacity>
                    </View>
                    <Storefront />
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    
    chatArea: { flex: 1, padding: 20 },
    chatHeader: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 },
    activeSessionCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    activeSessionText: { color: '#9CA3AF', fontStyle: 'italic' },

    keyboardArea: { 
        height: 320, 
        backgroundColor: '#D1D5DB', // iOS keyboard gray
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#9CA3AF'
    },
    keyboardHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 12 },
    keyboardTitle: { fontSize: 13, fontWeight: '700', color: '#4B5563', textTransform: 'uppercase' },

    bubbleScroll: { paddingHorizontal: 15, gap: 10, paddingBottom: 20 },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingRight: 15,
        paddingLeft: 4,
        paddingVertical: 4,
        height: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
    },
    bubbleIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    bubbleEmoji: { fontSize: 18 },
    bubbleText: { fontSize: 15, fontWeight: '600', color: '#111827' },

    storefrontSection: {
        paddingHorizontal: 15,
        marginTop: 5,
    },
    storefrontButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
    },
    storefrontIcon: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    storefrontTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    storefrontSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },

    webviewHeader: { 
        height: 50, 
        backgroundColor: '#F2F2F7', 
        justifyContent: 'center', 
        alignItems: 'flex-end', 
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    closeBtn: { fontSize: 17, fontWeight: '600', color: '#007AFF' }
});
