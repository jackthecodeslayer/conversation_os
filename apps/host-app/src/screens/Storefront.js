import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Modal, StatusBar, Dimensions
} from 'react-native';
import { THEME } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = ['All', 'Games', 'Study', 'Productivity', 'Creative'];

const FEATURED = {
  id: 'featured-1',
  name: 'Uno Live',
  tagline: 'Classic card game meets instant chat multiplayer',
  category: 'Games',
  rating: '4.9',
  ratingCount: '34.2k',
  emoji: '🃏',
  description: 'Challenge anyone in your group chat to a real-time game of Uno. Zero account setup required. Spectators can watch live and cheer.',
  author: 'CVOS Originals',
  isHot: true,
};

const GAMES = [
  { id: '1', name: 'Uno Live', category: 'Games', author: 'CVOS Originals', rating: '4.9', count: '34.2k', emoji: '🃏', added: true, rank: 1 },
  { id: '2', name: 'Wordle Blitz', category: 'Games', author: 'Lexicon Labs', rating: '4.8', count: '18.4k', emoji: '🟩', added: true, rank: 2 },
  { id: '3', name: 'Connect 4', category: 'Games', author: 'Retro Arcade', rating: '4.7', count: '12.1k', emoji: '🔴', added: true, rank: 3 },
  { id: '4', name: 'Whiteboard', category: 'Productivity', author: 'Sketchy Dev', rating: '4.9', count: '9.3k', emoji: '✏️', added: true, rank: 4 },
  { id: '5', name: 'Tic-Tac-Toe', category: 'Games', author: 'CVOS Originals', rating: '4.6', count: '8.4k', emoji: '❌', added: true, rank: 5 },
  { id: '6', name: 'Trivia Blitz', category: 'Games', author: 'BrainWave', rating: '4.7', count: '7.8k', emoji: '🎯', added: true, rank: 6 },
  { id: '7', name: 'Receipt Splitter', category: 'Productivity', author: 'FinTech Mini', rating: '4.8', count: '5.2k', emoji: '🧾', added: false, rank: 7 },
  { id: '8', name: 'Meet Planner', category: 'Productivity', author: 'CalSync', rating: '4.6', count: '4.1k', emoji: '📅', added: false, rank: 8 },
  { id: '9', name: 'Drawing Jam', category: 'Creative', author: 'Artsy Labs', rating: '4.5', count: '3.7k', emoji: '🎨', added: false, rank: 9 },
];

function StarRating({ rating }) {
  const full = Math.floor(parseFloat(rating));
  return (
    <Text style={styles.starText}>
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
          <View style={styles.sheetHandle} />

          {/* Header Info */}
          <View style={styles.detailHeader}>
            <View style={styles.detailIconWrap}>
              <Text style={styles.detailEmoji}>{game.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{game.name}</Text>
              <Text style={styles.detailAuthor}>{game.author}</Text>
              <View style={styles.ratingRow}>
                <StarRating rating={game.rating} />
                <Text style={styles.detailRating}>{game.rating} ({game.count} ratings)</Text>
              </View>
            </View>
          </View>

          {/* Key Metric Stats Row */}
          <View style={styles.statsRow}>
            {[
              { label: 'CATEGORY', value: game.category },
              { label: 'RATING', value: game.rating + ' ★' },
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
            {game.description || 'Challenge anyone in your group conversation to an instant session. No account needed — players join directly from the message bubble link.'}
          </Text>

          {/* Actions */}
          <View style={styles.detailCtas}>
            <TouchableOpacity
              style={[styles.ctaAdd, game.added && styles.ctaAdded]}
              onPress={() => { onAdd(game.id); onClose(); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.ctaAddText, game.added && styles.ctaAddedText]}>
                {game.added ? '✓ Added to Play Dock' : '+ Add to Play Dock'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaOpen} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.ctaOpenText}>Done</Text>
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

  const filtered = category === 'All' ? games : games.filter(g => g.category === category);
  const topCharts = filtered.slice(0, 4);
  const moreExperiences = filtered.slice(4);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>DISCOVERY ARCADE</Text>
          <Text style={styles.headerTitle}>Apps & Games</Text>
          <Text style={styles.headerSub}>Pin your favourite mini-experiences directly to your keyboard.</Text>
        </View>

        {/* Category Pills Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillBar} contentContainerStyle={styles.pillContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.pill, category === cat && styles.pillActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hero Featured Card */}
        <TouchableOpacity onPress={() => openDetail(FEATURED)} activeOpacity={0.92} style={styles.featuredWrap}>
          <View style={styles.featuredCard}>
            <View style={styles.featuredBadgeRow}>
              <Text style={styles.featuredBadge}>FEATURED SPOTLIGHT</Text>
            </View>
            <View style={styles.featuredContentRow}>
              <View style={styles.featuredIconBox}>
                <Text style={styles.featuredEmoji}>{FEATURED.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredName}>{FEATURED.name}</Text>
                <Text style={styles.featuredTagline} numberOfLines={2}>{FEATURED.tagline}</Text>
              </View>
            </View>
            <View style={styles.featuredFooter}>
              <StarRating rating={FEATURED.rating} />
              <View style={styles.featuredGetBtn}>
                <Text style={styles.featuredGetText}>DETAILS</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Top Charts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Charts</Text>
            <Text style={styles.sectionSubtitle}>Most played in chats</Text>
          </View>
          {topCharts.map((game, index) => (
            <TouchableOpacity key={game.id} onPress={() => openDetail(game)} activeOpacity={0.75}>
              <View style={styles.chartRow}>
                <Text style={styles.chartRank}>0{game.rank}</Text>
                <View style={styles.chartIcon}>
                  <Text style={styles.chartEmoji}>{game.emoji}</Text>
                </View>
                <View style={styles.chartInfo}>
                  <Text style={styles.chartName}>{game.name}</Text>
                  <Text style={styles.chartMeta}>{game.category} • {game.count} players</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleAdd(game.id)}
                  style={[styles.getBtn, game.added && styles.getBtnAdded]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.getBtnText, game.added && styles.getBtnTextAdded]}>
                    {game.added ? 'ADDED' : '+ ADD'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* More Experiences Bento Grid */}
        {moreExperiences.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More Experiences</Text>
              <Text style={styles.sectionSubtitle}>Games, study tools & planners</Text>
            </View>
            <View style={styles.gridWrap}>
              {moreExperiences.map((game) => (
                <TouchableOpacity key={game.id} style={styles.gridCard} onPress={() => openDetail(game)} activeOpacity={0.8}>
                  <View style={styles.gridIcon}>
                    <Text style={styles.gridEmoji}>{game.emoji}</Text>
                  </View>
                  <Text style={styles.gridName} numberOfLines={1}>{game.name}</Text>
                  <Text style={styles.gridCategory} numberOfLines={1}>{game.category}</Text>
                  <View style={styles.gridBottomRow}>
                    <StarRating rating={game.rating} />
                    <TouchableOpacity
                      onPress={() => toggleAdd(game.id)}
                      style={[styles.smallGetBtn, game.added && styles.smallGetBtnAdded]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.smallGetBtnText, game.added && styles.smallGetBtnTextAdded]}>
                        {game.added ? '✓' : '+'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 36 }} />
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
    backgroundColor: THEME.colors.bgApp,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header
  header: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerLabel: {
    fontSize: 11, 
    fontWeight: '800', 
    color: THEME.colors.brandPrimary, 
    letterSpacing: 0.8, 
    marginBottom: 4,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: THEME.colors.textPrimary, 
    letterSpacing: -0.5 
  },
  headerSub: { 
    fontSize: 13, 
    color: THEME.colors.textSecondary, 
    marginTop: 4,
    lineHeight: 18,
  },

  // Category Pills
  pillBar: { 
    marginVertical: 8,
  },
  pillContent: { 
    paddingHorizontal: THEME.spacing.lg, 
    gap: 8, 
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 16, 
    paddingVertical: 7, 
    borderRadius: THEME.radii.pill,
    backgroundColor: THEME.colors.surfaceCard,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    ...THEME.shadows.soft,
  },
  pillActive: { 
    backgroundColor: THEME.colors.brandDark,
    borderColor: THEME.colors.brandDark,
  },
  pillText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: THEME.colors.textSecondary 
  },
  pillTextActive: { 
    color: '#FFFFFF' 
  },

  // Featured Spotlight
  featuredWrap: { 
    paddingHorizontal: THEME.spacing.lg, 
    marginTop: 10,
    marginBottom: 6,
  },
  featuredCard: {
    borderRadius: THEME.radii.card, 
    padding: 18, 
    backgroundColor: THEME.colors.brandDark,
    ...THEME.shadows.card,
  },
  featuredBadgeRow: { 
    marginBottom: 10 
  },
  featuredBadge: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: THEME.colors.brandSecondary, 
    letterSpacing: 0.8 
  },
  featuredContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  featuredIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featuredEmoji: { 
    fontSize: 30, 
  },
  featuredName: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#FFFFFF', 
    letterSpacing: -0.3 
  },
  featuredTagline: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.7)', 
    marginTop: 2, 
    lineHeight: 18 
  },
  featuredFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  featuredGetBtn: {
    backgroundColor: THEME.colors.brandPrimary, 
    paddingHorizontal: 16, 
    paddingVertical: 6,
    borderRadius: THEME.radii.pill,
  },
  featuredGetText: { 
    color: '#FFFFFF', 
    fontWeight: '800', 
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Sections
  section: { 
    paddingHorizontal: THEME.spacing.lg, 
    paddingTop: 20 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'baseline', 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: THEME.colors.textPrimary, 
    letterSpacing: -0.3 
  },
  sectionSubtitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: THEME.colors.textMuted 
  },

  // Chart List Rows
  chartRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    backgroundColor: THEME.colors.surfaceCard, 
    borderRadius: THEME.radii.card, 
    paddingHorizontal: 14, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    ...THEME.shadows.soft,
  },
  chartRank: { 
    width: 22, 
    fontSize: 13, 
    fontWeight: '800', 
    color: THEME.colors.textMuted, 
    marginRight: 8 
  },
  chartIcon: {
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
    borderWidth: 1, 
    borderColor: '#DBEAFE',
  },
  chartEmoji: { 
    fontSize: 22 
  },
  chartInfo: { 
    flex: 1 
  },
  chartName: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: THEME.colors.textPrimary, 
    marginBottom: 2 
  },
  chartMeta: { 
    fontSize: 12, 
    color: THEME.colors.textSecondary 
  },
  getBtn: {
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 14, 
    paddingVertical: 6,
    borderRadius: THEME.radii.pill, 
    borderWidth: 1, 
    borderColor: '#BFDBFE',
  },
  getBtnAdded: { 
    backgroundColor: THEME.colors.surfaceMuted, 
    borderColor: THEME.colors.borderSubtle 
  },
  getBtnText: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: THEME.colors.brandPrimary 
  },
  getBtnTextAdded: { 
    color: THEME.colors.textMuted 
  },

  // Bento Grid
  gridWrap: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  gridCard: {
    width: (SCREEN_WIDTH - 52) / 2, 
    backgroundColor: THEME.colors.surfaceCard, 
    borderRadius: THEME.radii.card,
    padding: 14, 
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    ...THEME.shadows.soft,
  },
  gridIcon: {
    width: 46, 
    height: 46, 
    borderRadius: 14, 
    backgroundColor: '#F8FAFC',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8,
    borderWidth: 1, 
    borderColor: THEME.colors.borderSubtle,
  },
  gridEmoji: { 
    fontSize: 24 
  },
  gridName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: THEME.colors.textPrimary, 
    marginBottom: 2 
  },
  gridCategory: { 
    fontSize: 11, 
    color: THEME.colors.textSecondary, 
    marginBottom: 6 
  },
  gridBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  smallGetBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  smallGetBtnAdded: {
    backgroundColor: THEME.colors.surfaceMuted,
    borderColor: THEME.colors.borderSubtle,
  },
  smallGetBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.brandPrimary,
  },
  smallGetBtnTextAdded: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },

  starText: { 
    color: '#F59E0B', 
    fontSize: 11, 
    letterSpacing: 1 
  },

  // Detail Modal
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalBackdrop: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(15,23,42,0.4)' 
  },
  modalSheet: {
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: THEME.radii.xxl, 
    borderTopRightRadius: THEME.radii.xxl,
    padding: 24, 
    paddingTop: 12,
    ...THEME.shadows.sheet,
  },
  sheetHandle: {
    width: 38, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: THEME.colors.borderProminent,
    alignSelf: 'center', 
    marginBottom: 18,
  },
  detailHeader: { 
    flexDirection: 'row', 
    gap: 14, 
    marginBottom: 18 
  },
  detailIconWrap: {
    width: 64, 
    height: 64, 
    borderRadius: 18, 
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#DBEAFE',
  },
  detailEmoji: { 
    fontSize: 34 
  },
  detailName: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: THEME.colors.textPrimary, 
    letterSpacing: -0.3 
  },
  detailAuthor: { 
    fontSize: 13, 
    color: THEME.colors.textSecondary, 
    marginTop: 2 
  },
  ratingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginTop: 4 
  },
  detailRating: { 
    fontSize: 12, 
    color: THEME.colors.textMuted 
  },
  statsRow: {
    flexDirection: 'row', 
    backgroundColor: THEME.colors.surfaceMuted, 
    borderRadius: THEME.radii.card,
    padding: 12, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  statCell: { 
    flex: 1, 
    alignItems: 'center' 
  },
  statBorder: { 
    borderRightWidth: StyleSheet.hairlineWidth, 
    borderRightColor: THEME.colors.borderProminent 
  },
  statLabel: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: THEME.colors.textSecondary, 
    letterSpacing: 0.5, 
    marginBottom: 2 
  },
  statValue: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: THEME.colors.textPrimary 
  },
  detailDescription: { 
    fontSize: 14, 
    color: THEME.colors.textSecondary, 
    lineHeight: 20, 
    marginBottom: 20 
  },
  detailCtas: { 
    gap: 10 
  },
  ctaAdd: {
    backgroundColor: THEME.colors.brandPrimary, 
    paddingVertical: 14, 
    borderRadius: THEME.radii.pill, 
    alignItems: 'center',
  },
  ctaAdded: { 
    backgroundColor: THEME.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: THEME.colors.borderProminent,
  },
  ctaAddText: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#FFFFFF' 
  },
  ctaAddedText: { 
    color: THEME.colors.textSecondary 
  },
  ctaOpen: {
    borderWidth: 1, 
    borderColor: THEME.colors.borderProminent, 
    paddingVertical: 12, 
    borderRadius: THEME.radii.pill, 
    alignItems: 'center',
  },
  ctaOpenText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: THEME.colors.textPrimary 
  },
});
