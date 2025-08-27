import { Feed } from '@/components/feed/Feed';
import { QuickActions } from '@/components/feed/QuickActions';
import WeeklyStreak from '@/components/gamification/WeeklyStreak';
import { TrendingTopics } from '@/components/feed/TrendingTopics';
import { Suggestions } from '@/components/feed/Suggestions';

export default function FeedPage() {
  // Temporarily allow access without requiring authentication
  return (
    [
      <div key="left" className="space-y-6">
        <QuickActions />
        <WeeklyStreak />
        <TrendingTopics />
      </div>,
      <div key="main" className="space-y-6">
        <Feed />
      </div>,
      <div key="right" className="space-y-6">
        <Suggestions />
      </div>
    ]
  );
}
