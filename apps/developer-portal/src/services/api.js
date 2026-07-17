// Central API client for the CVOS Developer Portal.
// All calls inject the Supabase session token for authentication.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_BASE         = import.meta.env.VITE_API_URL || 'https://cvos-backend.onrender.com';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getAuthHeader() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    return { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
}

async function apiFetch(path, options = {}) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json();
}

// ── Developer ──────────────────────────────────────────────────────────────────

export async function getDeveloperAnalytics(developerId) {
    return apiFetch(`/api/developer/${developerId}/analytics`);
}

export async function getDeveloperPayouts(developerId) {
    return apiFetch(`/api/developer/${developerId}/payouts`);
}

export async function startStripeOnboarding(developerId, email) {
    const returnUrl  = `${window.location.origin}/settings?stripe=success`;
    const refreshUrl = `${window.location.origin}/settings?stripe=refresh`;
    return apiFetch('/api/developer/connect', {
        method: 'POST',
        body: JSON.stringify({ developerId, email, returnUrl, refreshUrl }),
    });
}

// ── Games ──────────────────────────────────────────────────────────────────────

export async function getGames(developerId) {
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function createGame(developerId, gameData) {
    const { data, error } = await supabase
        .from('games')
        .insert({ developer_id: developerId, ...gameData })
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateGame(gameId, updates) {
    const { data, error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', gameId)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function uploadGameAsset(file, path) {
    const { data, error } = await supabase.storage
        .from('game-assets')
        .upload(path, file, { upsert: true });
    
    if (error) throw new Error(`Asset upload failed: ${error.message}`);
    
    const { data: publicData } = supabase.storage
        .from('game-assets')
        .getPublicUrl(path);
        
    return publicData.publicUrl;
}

// ── Products / Entitlements ────────────────────────────────────────────────────

export async function getProducts(gameId) {
    return apiFetch(`/api/games/${gameId}/products`);
}

export async function createProduct(developerId, gameId, productData) {
    return apiFetch(`/api/games/${gameId}/products`, {
        method: 'POST',
        body: JSON.stringify({ developerId, ...productData }),
    });
}

export async function deactivateProduct(entitlementId, developerId) {
    return apiFetch(`/api/products/${entitlementId}`, {
        method: 'DELETE',
        body: JSON.stringify({ developerId }),
    });
}

// ── API Keys ───────────────────────────────────────────────────────────────────

export async function getApiKeys(developerId) {
    const { data, error } = await supabase
        .from('api_keys')
        .select('id, key_prefix, environment, last_used_at, created_at')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

// ── Team ───────────────────────────────────────────────────────────────────────

export async function getTeamMembers(developerId) {
    const { data, error } = await supabase
        .from('team_members')
        .select('id, email, role, status, joined_at')
        .eq('developer_id', developerId);
    if (error) throw new Error(error.message);
    return data || [];
}
