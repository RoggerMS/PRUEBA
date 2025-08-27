import { Feed } from '@/components/feed/Feed';
import { QuickActions } from '@/components/feed/QuickActions';
import WeeklyStreak from '@/components/gamification/WeeklyStreak';
import { TrendingTopics } from '@/components/feed/TrendingTopics';
import { Suggestions } from '@/components/feed/Suggestions';

export default function HomePage() {
  // Temporarily disable authentication requirement
  return (
    [
      /* Left Sidebar Content */
      <div key="left" className="space-y-6">
        <QuickActions />
        <WeeklyStreak />
        <TrendingTopics />
      </div>,

      /* Main Feed */
      <div key="main" className="space-y-6">
        <Feed />
      </div>,

      /* Right Sidebar Content */
      <div key="right" className="space-y-6">
        <Suggestions />
      </div>
    ]
  );
}