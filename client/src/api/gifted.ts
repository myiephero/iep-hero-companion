// API client for Gifted Snapshot endpoints
import axios from 'axios';
import {
  GiftedProfile,
  GiftedGoal,
  GiftedResource,
  GiftedComment,
  Student,
  ProfileInput,
  GoalInput,
  ResourceInput,
  CommentInput
} from '../types/gifted';

const API_BASE = '/api/gifted';

// Configure axios with auth header helper
const getAuthHeaders = () => {
  // In a real app, this would get from context/localStorage/etc
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const giftedApi = {
  // Profiles
  async getProfiles(studentId: string): Promise<GiftedProfile[]> {
    const response = await axios.get(`${API_BASE}/profiles`, {
      params: { studentId },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async createProfile(profile: ProfileInput): Promise<GiftedProfile> {
    const response = await axios.post(`${API_BASE}/profiles`, profile, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Goals
  async getGoals(studentId: string): Promise<GiftedGoal[]> {
    const response = await axios.get(`${API_BASE}/goals`, {
      params: { studentId },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async createGoal(goal: GoalInput): Promise<GiftedGoal> {
    const response = await axios.post(`${API_BASE}/goals`, goal, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async updateGoal(id: string, updates: Partial<GoalInput>): Promise<GiftedGoal> {
    const response = await axios.patch(`${API_BASE}/goals/${id}`, updates, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Resources
  async getResources(studentId: string): Promise<GiftedResource[]> {
    const response = await axios.get(`${API_BASE}/resources`, {
      params: { studentId },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async createResource(resource: ResourceInput): Promise<GiftedResource> {
    const response = await axios.post(`${API_BASE}/resources`, resource, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Comments
  async getComments(goalId: string): Promise<GiftedComment[]> {
    const response = await axios.get(`${API_BASE}/comments`, {
      params: { goalId },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async createComment(comment: CommentInput): Promise<GiftedComment> {
    const response = await axios.post(`${API_BASE}/comments`, comment, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Students
  async getStudents(): Promise<Student[]> {
    const response = await axios.get(`${API_BASE}/students`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};