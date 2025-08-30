'use client';

import React from 'react';
import { MessageCircle, Heart, Share, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Composer } from '@/components/feed/Composer';
import { useSession } from 'next-auth/react';

interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
}

interface ProfileFeedProps {
  posts?: Post[];
  isOwnProfile?: boolean;
  username?: string;
}

export function ProfileFeed({ posts = [], isOwnProfile = false, username }: ProfileFeedProps) {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Post Composer - Solo para perfil propio autenticado */}
      {isOwnProfile && session && (
        <Card>
          <CardContent className="p-0">
            <Composer />
          </CardContent>
        </Card>
      )}

      {/* Posts Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Publicaciones</h2>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No hay publicaciones aún</p>
              {isOwnProfile ? (
                <p className="text-sm">¡Comparte tu primera publicación!</p>
              ) : (
                <p className="text-sm">{username} no ha publicado nada todavía</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{post.author.name}</h3>
                        <p className="text-gray-500 text-xs">@{post.author.username} · {post.createdAt}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-900 leading-relaxed">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 text-gray-500">
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-2 hover:text-red-500">
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-xs">{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-2 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-2 hover:text-green-500">
                      <Share className="h-4 w-4" />
                      <span className="text-xs">{post.shares}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}