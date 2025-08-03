import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample user ID for development - replace with actual auth later
export const SAMPLE_USER_ID = 'user_123'

// Database initialization function
export const initializeDatabase = async () => {
  try {
    // Check if data exists
    const { data: existingGoals } = await supabase
      .from('goals')
      .select('id')
      .limit(1)
    
    console.log('Database connection verified')
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

// Helper functions for data operations
export const goalHelpers = {
  async getAll(userId = SAMPLE_USER_ID) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(goalData, userId = SAMPLE_USER_ID) {
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goalData, userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

export const reminderHelpers = {
  async getAll(userId = SAMPLE_USER_ID) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('userId', userId)
      .eq('isActive', true)
      .order('meetingDate', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async create(reminderData, userId = SAMPLE_USER_ID) {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ ...reminderData, userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getPendingReminders() {
    const { data, error } = await supabase
      .rpc('get_pending_reminders')
    
    if (error) throw error
    return data || []
  }
}

export const aiReviewHelpers = {
  async getAll(userId = SAMPLE_USER_ID) {
    const { data, error } = await supabase
      .from('ai_reviews')
      .select('*')
      .eq('userId', userId)
      .order('reviewDate', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getInsights(userId = SAMPLE_USER_ID) {
    const reviews = await this.getAll(userId)
    
    // Extract insights from reviews
    const allKeyDates = reviews.flatMap(r => r.keyDates || [])
    const allConcerns = reviews.flatMap(r => r.topConcerns || [])
    const recentTrends = reviews.slice(0, 3).map(r => r.summaryTrends).filter(Boolean)
    
    // Get unique values and sort by frequency
    const topConcerns = [...new Set(allConcerns)].slice(0, 5)
    const upcomingDates = [...new Set(allKeyDates)]
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(0, 3)
    
    return {
      topConcerns,
      upcomingDates,
      recentTrends: recentTrends.slice(0, 3),
      totalReviews: reviews.length,
      lastUpdated: reviews[0]?.reviewDate || null
    }
  }
}