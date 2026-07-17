import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useConversationOS } from '@cvos/sdk';

export default function TicTacToe({ roomId, userId, requestedRole }) {
    const { roomStatus, myRole, gameState, sendAction, startGame, error } = useConversationOS(roomId, userId, requestedRole);
    
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isMyTurn, setIsMyTurn] = useState(myRole === 'host');
    const [winner, setWinner] = useState(null);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diags
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        if (!squares.includes(null)) return 'DRAW';
        return null;
    };

    useEffect(() => {
        if (gameState?.action?.type === 'MOVE') {
            const newBoard = [...board];
            newBoard[gameState.action.index] = gameState.action.playerSymbol;
            setBoard(newBoard);
            setWinner(checkWinner(newBoard));
            setIsMyTurn(true);
        } else if (gameState?.action?.type === 'RESET') {
            setBoard(Array(9).fill(null));
            setWinner(null);
            setIsMyTurn(myRole === 'host');
        }
    }, [gameState]);

    const handleMove = (index) => {
        if (!isMyTurn || board[index] || winner || myRole === 'spectator' || roomStatus !== 'active') return;

        const mySymbol = myRole === 'host' ? 'X' : 'O';
        const newBoard = [...board];
        newBoard[index] = mySymbol;
        setBoard(newBoard);
        setWinner(checkWinner(newBoard));
        setIsMyTurn(false);

        sendAction({ type: 'MOVE', index: index, playerSymbol: mySymbol });
    };

    const handleReset = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setIsMyTurn(myRole === 'host');
        sendAction({ type: 'RESET' });
    };

    if (error) return <Text style={styles.errorText}>Connection Error: {error}</Text>;

    if (roomStatus === 'lobby') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.lobbyCard}>
                    <Text style={styles.iconEmoji}>🎮</Text>
                    <Text style={styles.title}>Tic-Tac-Toe</Text>
                    <Text style={styles.subText}>Waiting in Lobby as {myRole === 'host' ? 'Host (X)' : 'Player (O)'}</Text>
                    {myRole === 'host' ? (
                        <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
                            <Text style={styles.primaryButtonText}>START MATCH</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.waitingText}>Waiting for host to start...</Text>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tic-Tac-Toe</Text>
                {myRole === 'spectator' && <Text style={styles.spectatorBadge}>🔴 LIVE SPECTATOR</Text>}
                <Text style={styles.statusText}>
                    {winner === 'DRAW' ? "It's a Draw!" : 
                     winner ? `${winner} Wins!` : 
                     (myRole === 'spectator' ? 'Match in progress...' : (isMyTurn ? 'Your Turn' : 'Waiting for opponent...'))}
                </Text>
            </View>
            
            <View style={styles.boardContainer}>
                <View style={styles.board}>
                    {board.map((cell, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.cell, 
                                index < 3 && styles.cellTop,
                                index > 5 && styles.cellBottom,
                                index % 3 === 0 && styles.cellLeft,
                                index % 3 === 2 && styles.cellRight
                            ]} 
                            onPress={() => handleMove(index)}
                            activeOpacity={0.7}
                            disabled={!!cell || !!winner || myRole === 'spectator'}
                        >
                            <Text style={[styles.cellText, cell === 'X' ? styles.xText : styles.oText]}>
                                {cell}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {winner && myRole !== 'spectator' && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
                    <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF',
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
    statusText: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginTop: 8 },
    spectatorBadge: { color: '#FF3B30', fontWeight: '800', fontSize: 14, marginTop: 4, letterSpacing: 1 },
    boardContainer: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
        borderRadius: 24,
        padding: 20,
        marginBottom: 40
    },
    board: { 
        width: 280, 
        height: 280, 
        flexDirection: 'row', 
        flexWrap: 'wrap' 
    },
    cell: { 
        width: '33.33%', 
        height: '33.33%', 
        borderWidth: 1, 
        borderColor: '#E5E5EA', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    cellTop: { borderTopWidth: 0 },
    cellBottom: { borderBottomWidth: 0 },
    cellLeft: { borderLeftWidth: 0 },
    cellRight: { borderRightWidth: 0 },
    cellText: { fontSize: 50, fontWeight: '800' },
    xText: { color: '#007AFF' }, // iOS Blue
    oText: { color: '#FF3B30' }, // iOS Red
    primaryButton: { 
        backgroundColor: '#007AFF', 
        paddingVertical: 14, 
        paddingHorizontal: 40, 
        borderRadius: 24 
    },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
    errorText: { color: '#FF3B30', padding: 20, fontWeight: '600' }
});
