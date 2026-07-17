import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Animated
} from 'react-native';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INSTALLED_GAMES = [
  { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', icon: '❌', category: 'Games' },
  { id: 'quick-poll', name: 'Quick Poll', icon: '📊', category: 'Productivity' },
  { id: 'flashcards', name: 'Flashcards', icon: '🧠', category: 'Study' },
];

const BROWSE_BY_CATEGORY = {
  Games: [
    { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', icon: '❌' },
    { id: 'word-battles', name: 'Word Battles', icon: '📝' },
    { id: 'trivia-blitz', name: 'Trivia Blitz', icon: '🎯' },
    { id: 'chess', name: 'Chess', icon: '♟️' },
  ],
  Study: [
    { id: 'flashcards', name: 'Flashcards', icon: '🧠' },
    { id: 'language-duel', name: 'Language Duel', icon: '🌍' },
  ],
  Productivity: [
    { id: 'quick-poll', name: 'Quick Poll', icon: '📊' },
    { id: 'whiteboard', name: 'Whiteboard', icon: '✏️' },
  ],
};

const ACTIVE_SESSIONS = [
  { id: 'room-001', gameName: 'Tic-Tac-Toe', opponent: 'Alex', icon: '❌', isMyTurn: true },
  { id: 'room-002', gameName: 'Word Battles', opponent: 'Maya & 2 others', icon: '📝', isMyTurn: false },
  { id: 'room-003', gameName: 'Flashcards', opponent: 'Study Group', icon: '🧠', isMyTurn: false, ended: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function GameCard({ item, onPress, showNewBadge }) {
  return (
    <TouchableOpacity style={styles.gameCard} onPress={() => onPress(item)} activeOpacity={0.75}>
      <View style={styles.gameCardIconWrap}>
        <Text style={styles.gameCardIcon}>{item.icon}</Text>
        {showNewBadge && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
      <Text style={styles.gameCardName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );
}

function TurnChip({ isMyTurn, ended }) {
  if (ended) return (
    <View style={[styles.chip, styles.chipEnded]}>
      <Text style={styles.chipTextEnded}>ENDED</Text>
    </View>
  );
  if (isMyTurn) return (
    <View style={[styles.chip, styles.chipYourTurn]}>
      <View style={styles.chipDot} />
      <Text style={styles.chipTextYourTurn}>YOUR TURN</Text>
    </View>
  );
  return (
    <View style={[styles.chip, styles.chipWaiting]}>
      <Text style={styles.chipTextWaiting}>WAITING</Text>
    </View>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function ActivePanel() {
  if (ACTIVE_SESSIONS.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎮</Text>
        <Text style={styles.emptyTitle}>No active sessions</Text>
        <Text style={styles.emptySub}>Start a game from My Library</Text>
      </View>
    );
  }
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.activeList} showsVerticalScrollIndicator={false}>
      {ACTIVE_SESSIONS.map(session => (
        <TouchableOpacity
          key={session.id}
          style={[
            styles.sessionRow,
            session.isMyTurn && styles.sessionRowYourTurn,
            session.ended && styles.sessionRowEnded,
          ]}
          onPress={() => Linking.openURL(`cvos://room/${session.id}`)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.sessionAccent,
            session.isMyTurn ? styles.accentGreen : session.ended ? styles.accentGray : styles.accentAmber,
          ]} />
          <View style={styles.sessionIconWrap}>
            <Text style={styles.sessionIcon}>{session.icon}</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionGameName}>{session.gameName}</Text>
            <Text style={styles.sessionOpponent}>vs {session.opponent}</Text>
          </View>
          <TurnChip isMyTurn={session.isMyTurn} ended={session.ended} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function BrowsePanel({ category, onInsertGame }) {
  const items = BROWSE_BY_CATEGORY[category] || [];
  if (items.length === 0) return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>Nothing here yet</Text>
      <Text style={styles.emptySub}>Check the Storefront for new experiences</Text>
    </View>
  );
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.browseScroll}>
      {items.map((item, i) => (
        <GameCard key={item.id} item={item} onPress={onInsertGame} showNewBadge={i === items.length - 1} />
      ))}
    </ScrollView>
  );
}

function LibraryPanel({ onOpenStorefront, onInsertGame }) {
  return (
    <View style={{ flex: 1 }}>
      {INSTALLED_GAMES.length > 0 ? (
        <>
          <Text style={styles.libraryLabel}>YOUR LIBRARY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.browseScroll}>
            {INSTALLED_GAMES.map(item => (
              <GameCard key={item.id} item={item} onPress={onInsertGame} />
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptySub}>Add games from the Storefront</Text>
        </View>
      )}

      {/* Explore More Button */}
      <TouchableOpacity style={styles.exploreBtn} onPress={onOpenStorefront} activeOpacity={0.8}>
        <Text style={styles.exploreBtnText}>🏪  Explore Storefront</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main KeyboardUI ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'active', label: 'Active', icon: '🟢', count: ACTIVE_SESSIONS.filter(s => !s.ended).length },
  { id: 'Games', label: 'Games', icon: '🎮' },
  { id: 'Study', label: 'Study', icon: '📚' },
  { id: 'Productivity', label: 'Productivity', icon: '⚡' },
  { id: 'library', label: 'Library', icon: '🏪' },
];

export default function KeyboardUI({ onOpenStorefront }) {
  const [activeTab, setActiveTab] = useState('active');

  const insertGameLink = (item) => {
    const mockUrl = `https://play.cvos.app/game/${item.id}/room-${Math.random().toString(36).slice(2, 7)}`;
    console.log(`Pasting to conversation: ${mockUrl}`);
    // In production: NativeModules.KeyboardModule.insertText(mockUrl)
  };

  const openStorefront = () => {
    if (onOpenStorefront) onOpenStorefront();
    else Linking.openURL('cvos://storefront');
  };

  const renderContent = () => {
    if (activeTab === 'active') return <ActivePanel />;
    if (activeTab === 'library') return <LibraryPanel onOpenStorefront={openStorefront} onInsertGame={insertGameLink} />;
    return <BrowsePanel category={activeTab} onInsertGame={insertGameLink} />;
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Panel */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height: 260,
    backgroundColor: '#F2F2F7',
    flexDirection: 'column',
  },

  // Tab Bar
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    height: 52,
  },
  tabScroll: {
    paddingHorizontal: 10,
    alignItems: 'center',
    height: 52,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 6,
    gap: 5,
    backgroundColor: '#F2F2F7',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C3C43',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Active Sessions
  activeList: {
    padding: 10,
    gap: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sessionRowYourTurn: {
    shadowOpacity: 0.08,
  },
  sessionRowEnded: {
    opacity: 0.6,
  },
  sessionAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  accentGreen: { backgroundColor: '#34C759' },
  accentAmber: { backgroundColor: '#FF9500' },
  accentGray: { backgroundColor: '#C6C6C8' },
  sessionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    flexShrink: 0,
  },
  sessionIcon: { fontSize: 20 },
  sessionInfo: { flex: 1, paddingVertical: 12 },
  sessionGameName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  sessionOpponent: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Turn Chips
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 12,
    gap: 5,
  },
  chipYourTurn: { backgroundColor: 'rgba(52,199,89,0.12)' },
  chipWaiting: { backgroundColor: 'rgba(255,149,0,0.1)' },
  chipEnded: { backgroundColor: '#F2F2F7' },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  chipTextYourTurn: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.3,
  },
  chipTextWaiting: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: 0.3,
  },
  chipTextEnded: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.3,
  },

  // Browse / Game Cards
  browseScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  gameCard: {
    width: 84,
    alignItems: 'center',
  },
  gameCardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
    position: 'relative',
  },
  gameCardIcon: { fontSize: 32 },
  gameCardName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3C3C43',
    textAlign: 'center',
    maxWidth: 80,
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },

  // Library
  libraryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  exploreBtn: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
  },
  emptyIcon: { fontSize: 28, marginBottom: 6 },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3C3C43',
    marginBottom: 3,
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
