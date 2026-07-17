import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
// import branch from 'react-native-branch'; // Branch.io for Deferred Deep Linking
import Storefront from './src/screens/Storefront';
import TicTacToe from '@cvos/game-tic-tac-toe';

// Configure push notifications to show even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
    const [deepLinkData, setDeepLinkData] = useState(null);
    const [testMode, setTestMode] = useState(false); // Temporary for Live Testing

    useEffect(() => {
        // Initialize Branch.io listener for deferred deep links
        /*
        branch.subscribe(({ error, params }) => {
            if (error) {
                console.error('Error from Branch: ' + error);
                return;
            }
            if (params['+clicked_branch_link']) {
                setDeepLinkData(params);
            }
        });
        */
        console.log("Listening for Branch.io Universal Links...");
        Notifications.requestPermissionsAsync();
    }, []);

    // If deep link data is present, route to game
    if (deepLinkData?.roomId) {
        return (
            <View style={styles.container}>
                <Text>Redirecting directly into Game Room: {deepLinkData.roomId}</Text>
            </View>
        );
    }

    // --- PHASE 1 LIVE TESTING UI ---
    if (testMode) {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => setTestMode(false)} style={styles.backButton}>
                    <Text style={styles.backText}>← Exit Live Test</Text>
                </TouchableOpacity>
                <TicTacToe roomId="test-room-777" userId={`test-user-${Math.floor(Math.random() * 1000)}`} requestedRole="host" />
            </View>
        );
    }

    // Default Host App view is the Storefront discovery page
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.testBanner}>
                <TouchableOpacity onPress={() => setTestMode(true)}>
                    <Text style={styles.testBannerText}>🚀 START LIVE SERVER TEST (TIC-TAC-TOE)</Text>
                </TouchableOpacity>
            </View>
            <Storefront />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    testBanner: { backgroundColor: '#FF3B30', padding: 15, alignItems: 'center', paddingTop: 50 },
    testBannerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
    backButton: { padding: 15, marginTop: 40, backgroundColor: '#F2F2F7' },
    backText: { color: '#007AFF', fontWeight: 'bold' }
});
