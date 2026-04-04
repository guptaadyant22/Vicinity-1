// Utility functions for user account operations including profile, reviews, favorites, and messaging.
// All functions interact with Supabase and return standardized { success, data?, error? } responses.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch the current user's profile from auth + conversations table
export async function getCurrentUserProfile() {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;

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

// Update user profile fields in conversations table and auth metadata
export async function updateUserProfile(userId: string, updates: {
  phone?: string;
  bio?: string;
  name?: string;
}) {
  try {
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

// Get aggregate stats: favorites count, reviews count, conversations count
export async function getUserStats(userId: string) {
  try {
    const { count: favCount, error: favError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: reviewCount, error: reviewError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

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

// Fetch a user's reviews, newest first
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

// Create a new review (rating must be 1–5)
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

// Update an existing review's rating and comment
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

// Delete a review by ID
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

// Fetch a user's saved favorites, newest first
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

// Add a business to the user's favorites
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

// Remove a business from the user's favorites
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

// Check whether a business is in the user's favorites
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

// Fetch the user's conversations, newest first
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

// Fetch messages within a conversation, oldest first
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

// Send a message within a conversation
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

// Mark a single message as read
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

// Sign out the current user
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

// Get the currently authenticated Supabase user
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

// Format a date string as "Jan 1, 2025"
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format a date string with time as "Jan 1, 2025, 02:30 PM"
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

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

// Truncate text to a max length with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Extract up to 2 initials from a full name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Calculate number of days since a given date
export function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Return a human-readable relative time string (e.g. "2 days ago")
export function getRelativeTime(dateString: string): string {
  const days = daysSince(dateString);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// Calculate the average rating from an array of review objects
export function calculateAverageRating(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
}

// Get a 1–5 star distribution count from review objects
export function getRatingDistribution(reviews: any[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++;
    }
  });
  
  return distribution;
}