import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session,   setSession]   = useState(undefined); // undefined = loading
    const [developer, setDeveloper] = useState(null);

    useEffect(() => {
        // Restore session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchDeveloper(session.user.id);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchDeveloper(session.user.id);
            else setDeveloper(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchDeveloper(userId) {
        const { data } = await supabase
            .from('developers')
            .select('*')
            .eq('id', userId)
            .single();
        setDeveloper(data);
    }

    async function signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
    }

    async function signInWithGithub() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
    }

    async function signInWithEmail(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    }

    async function signUpWithEmail(email, password, companyName) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Create developer profile
        if (data.user) {
            await supabase.from('developers').insert({
                id: data.user.id,
                company_name: companyName,
                contact_email: email,
            });
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{ session, developer, signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
