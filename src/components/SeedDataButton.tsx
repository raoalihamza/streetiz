import { useState } from 'react';
import { Database } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seedData = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(`${supabaseUrl}/functions/v1/seed-community-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ Successfully created:
• ${data.usersCreated} users
• ${data.postsCreated} social posts
• ${data.friendshipsCreated} friendships
• ${data.followsCreated} follows
• ${data.forumTopicsCreated} forum topics
• ${data.profileMediaCreated} profile media
• ${data.announcementsCreated} announcements
• ${data.marketplaceItemsCreated} marketplace items

Refresh the page to see the data!`);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="bg-[#111] border-2 border-streetiz-red rounded-2xl p-6 max-w-sm shadow-2xl shadow-streetiz-red/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-streetiz-red/20 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-streetiz-red" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">Seed Data</h3>
            <p className="text-[#666] text-xs">Populate test data</p>
          </div>
        </div>

        {!result && !error && (
          <p className="text-[#a0a0a0] text-sm mb-4">
            Click to create test data: profiles, posts, follows, friendships, forum topics, media galleries, announcements, and marketplace items.
          </p>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
            <pre className="text-green-400 text-xs whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={seedData}
          disabled={loading}
          className="w-full bg-streetiz-red hover:bg-red-600 disabled:bg-[#333] disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Seeding...</span>
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              <span>Seed Community Data</span>
            </>
          )}
        </button>

        <p className="text-[#666] text-xs mt-3 text-center">
          Run this once. Reload page after completion.
        </p>
      </div>
    </div>
  );
}
