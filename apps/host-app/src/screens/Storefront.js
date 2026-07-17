import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ScrollView, Modal, StatusBar, Platform, Dimensions
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = ['All', 'Games', 'Study', 'Productivity', 'Creative', 'New'];

const FEATURED = {
  id: 'featured-1',
  name: 'Chess Masters',
  tagline: 'Classic strategy meets instant multiplayer',
  category: 'Games',
  rating: '4.9',
  ratingCount: '28.4k',
  emoji: '♟️',
  description: 'Challenge anyone in your contacts to a game of Chess. No account required — just tap the link in your conversation and play. Spectators can watch live. Rematches are one tap.',
  author: 'CVOS Originals',
  accent: ['#1a1a2e', '#16213e'],
};

const GAMES = [
  { id: '1', name: 'Tic-Tac-Toe', category: 'Games', author: 'CVOS Originals', rating: '4.9', count: '12.4k', emoji: '❌', added: true, rank: 1 },
  { id: '2', name: 'Word Battles', category: 'Games', author: 'Lexicon Labs', rating: '4.7', count: '8.1k', emoji: '📝', added: false, rank: 2 },
  { id: '3', name: 'Flashcards', category: 'Study', author: 'EduTech Inc.', rating: '4.8', count: '5.3k', emoji: '🧠', added: false, rank: 3 },
  { id: '4', name: 'Quick Poll', category: 'Productivity', author: 'CVOS Originals', rating: '5.0', count: '4.9k', emoji: '📊', added: true, rank: 4 },
  { id: '5', name: 'Whiteboard', category: 'Productivity', author: 'Sketchy Dev', rating: '4.5', count: '3.2k', emoji: '✏️', added: false, rank: 5 },
  { id: '6', name: 'Trivia Blitz', category: 'Games', author: 'BrainWave', rating: '4.6', count: '2.8k', emoji: '🎯', added: false, rank: 6 },
  { id: '7', name: 'Language Duel', category: 'Study', author: 'LinguaPlay', rating: '4.7', count: '2.1k', emoji: '🌍', added: false, rank: 7 },
  { id: '8', name: 'Drawing Jam', category: 'Creative', author: 'Artsy Labs', rating: '4.4', count: '1.7k', emoji: '🎨', added: false, rank: 8 },
];

function StarRating({ rating }) {
  const full = Math.floor(parseFloat(rating));
  return (
    <Text style={{ color: '#FF9500', fontSize: 12, letterSpacing: 1 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </Text>
  );
}

function GameDetailModal({ game, visible, onClose, onAdd }) {
  if (!game) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.detailHeader}>
            <View style={styles.detailIconWrap}>
              <Text style={styles.detailEmoji}>{game.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{game.name}</Text>
              <Text style={styles.detailAuthor}>{game.author}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <StarRating rating={game.rating} />
                <Text style={styles.detailRating}>{game.rating} ({game.count} ratings)</Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              { label: 'CATEGORY', value: game.category },
              { label: 'RATING', value: game.rating + ' / 5' },
              { label: 'PLAYERS', value: game.count + '+' },
            ].map((s, i) => (
              <View key={s.label} style={[styles.statCell, i < 2 && styles.statBorder]}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.detailDescription}>
            Challenge anyone in your conversation to a quick, satisfying match. No account needed — players join instantly from the link. Perfect for group chats with spectator mode built in.
          </Text>

          {/* CTAs */}
          <View style={styles.detailCtas}>
            <TouchableOpacity
              style={[styles.ctaAdd, game.added && styles.ctaAdded]}
              onPress={() => { onAdd(game.id); onClose(); }}
            >
              <Text style={[styles.ctaAddText, game.added && styles.ctaAddedText]}>
                {game.added ? 'Remove from Keyboard' : 'Add to Keyboard'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaOpen}>
              <Text style={styles.ctaOpenText}>Quick Play →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function Storefront() {
  const [category, setCategory] = useState('All');
  const [games, setGames] = useState(GAMES);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleAdd = (id) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, added: !g.added } : g));
  };

  const openDetail = (game) => {
    setSelected(game);
    setModalVisible(true);
  };

  const filtered = category === 'All' ? games
    : category === 'New' ? games.slice(0, 3)
    : games.filter(g => g.category === category);

  const topCharts = filtered.slice(0, 4);
  const newNoteworthy = filtered.slice(4);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>TUESDAY, JULY 15</Text>
            <Text style={styles.headerTitle}>Apps & Games</Text>
            <Text style={styles.headerSub}>Expand your keyboard</Text>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillBar} contentContainerStyle={styles.pillContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.pill, category === cat && styles.pillActive]}
            >
              <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Card */}
        <TouchableOpacity onPress={() => openDetail({ ...FEATURED, added: false })} activeOpacity={0.92} style={styles.featuredWrap}>
          <View style={styles.featuredCard}>
            <View style={styles.featuredBadgeRow}>
              <Text style={styles.featuredBadge}>FEATURED TODAY</Text>
            </View>
            <Text style={styles.featuredEmoji}>{FEATURED.emoji}</Text>
            <Text style={styles.featuredName}>{FEATURED.name}</Text>
            <Text style={styles.featuredTagline}>{FEATURED.tagline}</Text>
            <View style={styles.featuredFooter}>
              <StarRating rating={FEATURED.rating} />
              <TouchableOpacity style={styles.featuredGetBtn}>
                <Text style={styles.featuredGetText}>GET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Top Charts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Charts</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          {topCharts.map((game, index) => (
            <TouchableOpacity key={game.id} onPress={() => openDetail(game)} activeOpacity={0.7}>
              <View style={[styles.chartRow, index < topCharts.length - 1 && styles.chartBorder]}>
                <Text style={styles.chartRank}>{game.rank}</Text>
                <View style={styles.chartIcon}>
                  <Text style={styles.chartEmoji}>{game.emoji}</Text>
                </View>
                <View style={styles.chartInfo}>
                  <Text style={styles.chartName}>{game.name}</Text>
                  <Text style={styles.chartMeta}>{game.category} · {game.rating} ★</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleAdd(game.id)}
                  style={[styles.getBtn, game.added && styles.getBtnAdded]}
                >
                  <Text style={[styles.getBtnText, game.added && styles.getBtnTextAdded]}>
                    {game.added ? 'ADDED' : 'GET'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* New & Noteworthy */}
        {newNoteworthy.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New & Noteworthy</Text>
              <Text style={styles.seeAll}>See All</Text>
            </View>
            <View style={styles.gridWrap}>
              {newNoteworthy.map((game, index) => (
                <TouchableOpacity key={game.id} style={styles.gridCard} onPress={() => openDetail(game)} activeOpacity={0.8}>
                  <View style={styles.gridIcon}>
                    <Text style={styles.gridEmoji}>{game.emoji}</Text>
                  </View>
                  <Text style={styles.gridName} numberOfLines={1}>{game.name}</Text>
                  <Text style={styles.gridCategory} numberOfLines={1}>{game.category}</Text>
                  <StarRating rating={game.rating} />
                  <TouchableOpacity
                    onPress={() => toggleAdd(game.id)}
                    style={[styles.getBtn, game.added && styles.getBtnAdded, { marginTop: 8, alignSelf: 'flex-start' }]}
                  >
                    <Text style={[styles.getBtnText, game.added && styles.getBtnTextAdded]}>
                      {game.added ? 'ADDED' : 'GET'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <GameDetailModal
        game={selected}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={toggleAdd}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F2F2F7',
  },
  headerLabel: {
    fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 2,
  },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  headerSub: { fontSize: 17, color: '#8E8E93', fontWeight: '400', marginTop: 2 },

  // Category Pills
  pillBar: { backgroundColor: '#F2F2F7' },
  pillContent: { paddingHorizontal: 20, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  pill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#E5E5EA',
  },
  pillActive: { backgroundColor: '#000' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#3C3C43' },
  pillTextActive: { color: '#FFF' },

  // Featured
  featuredWrap: { paddingHorizontal: 20, marginBottom: 6 },
  featuredCard: {
    borderRadius: 18, padding: 20, backgroundColor: '#1C1C1E',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },
  featuredBadgeRow: { marginBottom: 12 },
  featuredBadge: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 },
  featuredEmoji: { fontSize: 52, marginBottom: 12 },
  featuredName: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: -0.3, marginBottom: 4 },
  featuredTagline: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 21 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredGetBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 24, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  featuredGetText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Section
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#000', letterSpacing: -0.3 },
  seeAll: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginHorizontal: 20, marginTop: 20 },

  // Top Charts
  chartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, marginBottom: 10 },
  chartBorder: { /* each row is its own card */ },
  chartRank: { width: 24, fontSize: 17, fontWeight: '600', color: '#8E8E93', textAlign: 'center', marginRight: 12 },
  chartIcon: {
    width: 52, height: 52, borderRadius: 12, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E5EA',
  },
  chartEmoji: { fontSize: 26 },
  chartInfo: { flex: 1 },
  chartName: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 3 },
  chartMeta: { fontSize: 13, color: '#8E8E93' },

  // GET Button
  getBtn: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#007AFF',
  },
  getBtnAdded: { backgroundColor: '#F2F2F7', borderColor: '#C6C6C8' },
  getBtnText: { fontSize: 13, fontWeight: '700', color: '#007AFF' },
  getBtnTextAdded: { color: '#8E8E93' },

  // Grid
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: {
    width: (SCREEN_WIDTH - 52) / 2, backgroundColor: '#FFF', borderRadius: 14,
    padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  gridIcon: {
    width: 56, height: 56, borderRadius: 13, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E5EA',
  },
  gridEmoji: { fontSize: 28 },
  gridName: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 2 },
  gridCategory: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 24, paddingTop: 12,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#C6C6C8',
    alignSelf: 'center', marginBottom: 20,
  },
  detailHeader: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  detailIconWrap: {
    width: 72, height: 72, borderRadius: 18, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E5EA',
  },
  detailEmoji: { fontSize: 38 },
  detailName: { fontSize: 20, fontWeight: '800', color: '#000', letterSpacing: -0.3 },
  detailAuthor: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  detailRating: { fontSize: 12, color: '#8E8E93', marginLeft: 2 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 14,
    padding: 14, marginBottom: 20,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#C6C6C8' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#000' },
  detailDescription: { fontSize: 15, color: '#3C3C43', lineHeight: 22, marginBottom: 24 },
  detailCtas: { gap: 10 },
  ctaAdd: {
    backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  ctaAdded: { backgroundColor: '#F2F2F7' },
  ctaAddText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  ctaAddedText: { color: '#8E8E93' },
  ctaOpen: {
    borderWidth: 1.5, borderColor: '#C6C6C8', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  ctaOpenText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
});
