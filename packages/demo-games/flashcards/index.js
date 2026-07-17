import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useConversationOS } from '@cvos/sdk';

const DECK = [
    { q: "What metric does Conversation OS optimize for?", a: "TTFM (Time to First Move)" },
    { q: "How do we bypass iMessage lock-in?", a: "Universal Links + Websockets" },
    { q: "What role watches without playing?", a: "Spectator" }
];

export default function Flashcards({ roomId, userId, requestedRole }) {
    const { roomStatus, myRole, gameState, sendAction, startGame, error } = useConversationOS(roomId, userId, requestedRole);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (gameState?.action?.type === 'FLIP') setIsFlipped(true);
        if (gameState?.action?.type === 'NEXT') {
            setIsFlipped(false);
            setCurrentIndex((prev) => (prev + 1) % DECK.length);
        }
    }, [gameState]);

    const handleFlip = () => {
        if (myRole === 'spectator') return;
        setIsFlipped(true);
        sendAction({ type: 'FLIP' });
    };

    const handleNext = () => {
        if (myRole === 'spectator') return;
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % DECK.length);
        sendAction({ type: 'NEXT' });
    };

    if (error) return <Text style={styles.errorText}>Connection Error: {error}</Text>;

    if (roomStatus === 'lobby') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.lobbyCard}>
                    <Text style={styles.iconEmoji}>🧠</Text>
                    <Text style={styles.title}>Shared Flashcards</Text>
                    <Text style={styles.subText}>Study together in real-time</Text>
                    {myRole === 'host' ? (
                        <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
                            <Text style={styles.primaryButtonText}>START SESSION</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.waitingText}>Waiting for host to begin...</Text>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Flashcards</Text>
                {myRole === 'spectator' && <Text style={styles.spectatorBadge}>🔴 LIVE SPECTATOR</Text>}
                <Text style={styles.counter}>Card {currentIndex + 1} of {DECK.length}</Text>
            </View>
            
            <TouchableOpacity 
                style={[styles.card, isFlipped && styles.cardFlipped]} 
                onPress={handleFlip} 
                activeOpacity={0.9}
                disabled={isFlipped || myRole === 'spectator'}
            >
                <Text style={styles.cardIndicator}>{isFlipped ? "ANSWER" : "QUESTION"}</Text>
                <Text style={[styles.cardText, isFlipped && styles.cardTextAnswer]}>
                    {isFlipped ? DECK[currentIndex].a : DECK[currentIndex].q}
                </Text>
                {!isFlipped && myRole !== 'spectator' && <Text style={styles.tapPrompt}>Tap to flip</Text>}
            </TouchableOpacity>

            <View style={styles.controls}>
                {myRole !== 'spectator' && isFlipped && (
                    <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                        <Text style={styles.primaryButtonText}>NEXT CARD</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F2F2F7', // iOS grouped background
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 40 : 20
    },
    lobbyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    iconEmoji: { fontSize: 60, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '800', color: '#000000', letterSpacing: -0.5, marginBottom: 8 },
    subText: { fontSize: 16, color: '#8E8E93', marginBottom: 30 },
    waitingText: { fontSize: 16, color: '#8E8E93', marginTop: 20, fontStyle: 'italic' },
    header: { alignItems: 'center', marginBottom: 40 },
    counter: { fontSize: 15, fontWeight: '600', color: '#8E8E93', marginTop: 8 },
    spectatorBadge: { color: '#FF3B30', fontWeight: '800', fontSize: 14, marginTop: 4, letterSpacing: 1 },
    card: { 
        width: 320, 
        height: 400, 
        backgroundColor: '#FFFFFF', 
        borderRadius: 24, 
        padding: 30, 
        alignItems: 'center', 
        justifyContent: 'center', 
        shadowColor: '#000', 
        shadowOpacity: 0.08, 
        shadowRadius: 15, 
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E5EA'
    },
    cardFlipped: {
        backgroundColor: '#F5F5F9',
        borderColor: '#007AFF',
        borderWidth: 2
    },
    cardIndicator: {
        position: 'absolute',
        top: 20,
        left: 20,
        fontSize: 12,
        fontWeight: '800',
        color: '#C7C7CC',
        letterSpacing: 1
    },
    cardText: { fontSize: 28, textAlign: 'center', fontWeight: '700', color: '#000000', lineHeight: 36 },
    cardTextAnswer: { color: '#007AFF' },
    tapPrompt: {
        position: 'absolute',
        bottom: 20,
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF'
    },
    controls: { marginTop: 40, height: 60, justifyContent: 'center' },
    primaryButton: { 
        backgroundColor: '#007AFF', 
        paddingVertical: 14, 
        paddingHorizontal: 40, 
        borderRadius: 24 
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
    errorText: { color: '#FF3B30', padding: 20, fontWeight: '600' }
});
