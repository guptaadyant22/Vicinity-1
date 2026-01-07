// lib/userAccountUtils.ts
// Utility functions for User Account page operations with your existing schema

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// ============= USER PROFILE OPERATIONS =============

/**
 * Get current user profile from conversations table
 * Maps conversation data to user profile display
 */
export async function getCurrentUserProfile() {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;

    // Get user data from conversations table (auth_users reference)
    const { data: profileData, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    return {
      id: profileData?.id,
      user_id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || 'User',
      phone: profileData?.phone,
      avatar_url: authUser.user_metadata?.avatar_url,
      bio: profileData?.bio,
      created_at: profileData?.created_at,
      updated_at: profileData?.updated_at,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile in conversations table
 */
export async function updateUserProfile(userId: string, updates: {
  phone?: string;
  bio?: string;
  name?: string;
}) {
  try {
    // Update in conversations table
    const { data, error } = await supabase
      .from('conversations')
      .update({
        phone: updates.phone || null,
        bio: updates.bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update auth user metadata for name and avatar
    if (updates.name) {
      await supabase.auth.updateUser({
        data: { name: updates.name }
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  try {
    // Count favorites
    const { count: favCount, error: favError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count reviews
    const { count: reviewCount, error: reviewError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count conversations
    const { count: convCount, error: convError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (favError || reviewError || convError) {
      throw new Error('Error fetching stats');
    }

    return {
      favorites_count: favCount || 0,
      reviews_count: reviewCount || 0,
      conversations_count: convCount || 0,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      favorites_count: 0,
      reviews_count: 0,
      conversations_count: 0,
    };
  }
}

// ============= USER REVIEWS =============

/**
 * Get all user reviews
 */
export async function getUserReviews(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return { success: false, data: [], error };
  }
}

/**
 * Create a new review
 */
export async function createReview(
  userId: string,
  businessId: string,
  rating: number,
  comment: string
) {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: userId,
          business_id: businessId,
          rating,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error };
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  rating: number,
  comment: string
) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error };
  }
}

// ============= USER FAVORITES =============

/**
 * Get all user favorites
 */
export async function getUserFavorites(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { success: false, data: [], error };
  }
}

/**
 * Add to favorites
 */
export async function addToFavorites(userId: string, businessId: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: userId,
          business_id: businessId,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, error };
  }
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(userId: string, businessId: string) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('business_id', businessId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, error };
  }
}

/**
 * Check if business is in favorites
 */
export async function isFavorite(userId: string, businessId: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { isFavorite: !!data };
  } catch (error) {
    console.error('Error checking favorite:', error);
    return { isFavorite: false };
  }
}

// ============= USER MESSAGES/CONVERSATIONS =============

/**
 * Get user conversations
 */
export async function getUserConversations(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, data: [], error };
  }
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(conversationId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, data: [], error };
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          created_at: new Date().toISOString(),
          is_read: false,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error };
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return { success: false, error };
  }
}

// ============= AUTHENTICATION =============

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
}

/**
 * Get current auth user
 */
export async function getCurrentAuthUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate days since date
 */
export function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string): string {
  const days = daysSince(dateString);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * Average rating calculation
 */
export function calculateAverageRating(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
}

/**
 * Get rating distribution
 */
export function getRatingDistribution(reviews: any[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++;
    }
  });
  
  return distribution;
}