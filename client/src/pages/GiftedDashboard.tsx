import React, { useState, useEffect } from 'react';
import { giftedApi } from '../api/gifted';
import {
  Student,
  GiftedProfile,
  GiftedGoal,
  GiftedResource,
  GiftedComment,
  ProfileInput,
  GoalInput,
  ResourceInput,
  CommentInput,
  Strength
} from '../types/gifted';

const GiftedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'goals' | 'resources' | 'comments'>('profiles');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Data states
  const [profiles, setProfiles] = useState<GiftedProfile[]>([]);
  const [goals, setGoals] = useState<GiftedGoal[]>([]);
  const [resources, setResources] = useState<GiftedResource[]>([]);
  const [comments, setComments] = useState<GiftedComment[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  // Form states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Load data when student changes
  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData();
    }
  }, [selectedStudentId]);

  // Load comments when goal changes
  useEffect(() => {
    if (selectedGoalId) {
      loadComments();
    }
  }, [selectedGoalId]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await giftedApi.getStudents();
      setStudents(data);
      if (data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      showMessage('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async () => {
    if (!selectedStudentId) return;

    try {
      setLoading(true);
      const [profilesData, goalsData, resourcesData] = await Promise.all([
        giftedApi.getProfiles(selectedStudentId),
        giftedApi.getGoals(selectedStudentId),
        giftedApi.getResources(selectedStudentId)
      ]);
      
      setProfiles(profilesData);
      setGoals(goalsData);
      setResources(resourcesData);
      
      // Set first goal as selected for comments if none selected
      if (goalsData.length > 0 && !selectedGoalId) {
        setSelectedGoalId(goalsData[0].id);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      showMessage('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!selectedGoalId) return;

    try {
      const data = await giftedApi.getComments(selectedGoalId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      showMessage('Failed to load comments');
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Gifted Snapshot</h1>
          <p className="text-gray-600 mb-6">Capture strengths, set goals, and track enrichment for gifted & 2e learners</p>
          
          {/* Student Selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-700">Student:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="">Select a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900">Selected Student: {selectedStudent.name}</h3>
              <p className="text-sm text-blue-700">ID: {selectedStudent.id}</p>
            </div>
          )}
        </div>

        {/* Message Toast */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profiles', label: 'Strength Profiles' },
              { id: 'goals', label: 'Enrichment Goals' },
              { id: 'resources', label: 'Resources' },
              { id: 'comments', label: 'Comments' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {selectedStudentId ? (
            <>
              {activeTab === 'profiles' && (
                <ProfilesTab
                  profiles={profiles}
                  onAddProfile={() => setShowProfileForm(true)}
                  loading={loading}
                />
              )}
              {activeTab === 'goals' && (
                <GoalsTab
                  goals={goals}
                  onAddGoal={() => setShowGoalForm(true)}
                  onUpdateGoal={async (id, updates) => {
                    try {
                      await giftedApi.updateGoal(id, updates);
                      await loadStudentData();
                      showMessage('Goal updated');
                    } catch (error) {
                      showMessage('Failed to update goal');
                    }
                  }}
                  loading={loading}
                />
              )}
              {activeTab === 'resources' && (
                <ResourcesTab
                  resources={resources}
                  onAddResource={() => setShowResourceForm(true)}
                  loading={loading}
                />
              )}
              {activeTab === 'comments' && (
                <CommentsTab
                  goals={goals}
                  comments={comments}
                  selectedGoalId={selectedGoalId}
                  onGoalSelect={setSelectedGoalId}
                  onAddComment={async (comment) => {
                    try {
                      await giftedApi.createComment(comment);
                      await loadComments();
                      showMessage('Comment added');
                    } catch (error) {
                      showMessage('Failed to add comment');
                    }
                  }}
                  loading={loading}
                />
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Please select a student to continue</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showProfileForm && (
          <ProfileFormModal
            studentId={selectedStudentId}
            onClose={() => setShowProfileForm(false)}
            onSave={async (profile) => {
              try {
                await giftedApi.createProfile(profile);
                await loadStudentData();
                setShowProfileForm(false);
                showMessage('Profile saved');
              } catch (error) {
                showMessage('Failed to save profile');
              }
            }}
          />
        )}

        {showGoalForm && (
          <GoalFormModal
            studentId={selectedStudentId}
            onClose={() => setShowGoalForm(false)}
            onSave={async (goal) => {
              try {
                await giftedApi.createGoal(goal);
                await loadStudentData();
                setShowGoalForm(false);
                showMessage('Goal saved');
              } catch (error) {
                showMessage('Failed to save goal');
              }
            }}
          />
        )}

        {showResourceForm && (
          <ResourceFormModal
            studentId={selectedStudentId}
            onClose={() => setShowResourceForm(false)}
            onSave={async (resource) => {
              try {
                await giftedApi.createResource(resource);
                await loadStudentData();
                setShowResourceForm(false);
                showMessage('Resource saved');
              } catch (error) {
                showMessage('Failed to save resource');
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

// Profiles Tab Component
const ProfilesTab: React.FC<{
  profiles: GiftedProfile[];
  onAddProfile: () => void;
  loading: boolean;
}> = ({ profiles, onAddProfile, loading }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Strength Profiles</h2>
      <button
        onClick={onAddProfile}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Strengths
      </button>
    </div>

    {loading ? (
      <div className="text-center py-4">Loading...</div>
    ) : profiles.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No strength profiles yet.</p>
        <p className="text-sm">Click "Add Strengths" to create the first profile.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {profiles.map(profile => (
          <div key={profile.id} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{profile.domain}</h3>
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Strengths:</h4>
              <div className="flex flex-wrap gap-2">
                {profile.strengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {strength.label}
                    {strength.level && ` (${strength.level})`}
                  </span>
                ))}
              </div>
            </div>
            {profile.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                <p className="text-sm text-gray-600">{profile.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// Goals Tab Component
const GoalsTab: React.FC<{
  goals: GiftedGoal[];
  onAddGoal: () => void;
  onUpdateGoal: (id: string, updates: Partial<GoalInput>) => void;
  loading: boolean;
}> = ({ goals, onAddGoal, onUpdateGoal, loading }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Enrichment Goals</h2>
      <button
        onClick={onAddGoal}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        New Goal
      </button>
    </div>

    {loading ? (
      <div className="text-center py-4">Loading...</div>
    ) : goals.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No enrichment goals yet.</p>
        <p className="text-sm">Click "New Goal" to create the first goal.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{goal.title}</h3>
              <select
                value={goal.status}
                onChange={(e) => onUpdateGoal(goal.id, { status: e.target.value as any })}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {goal.target_date && (
                <div>
                  <span className="font-medium text-gray-700">Target Date:</span>
                  <span className="ml-2 text-gray-600">{goal.target_date}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  goal.status === 'active' ? 'bg-green-100 text-green-800' :
                  goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </span>
              </div>
            </div>

            {goal.resources_hint && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Resource Hints:</h4>
                <p className="text-sm text-gray-600">{goal.resources_hint}</p>
              </div>
            )}

            {goal.progress_note && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Progress Notes:</h4>
                <p className="text-sm text-gray-600">{goal.progress_note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// Resources Tab Component
const ResourcesTab: React.FC<{
  resources: GiftedResource[];
  onAddResource: () => void;
  loading: boolean;
}> = ({ resources, onAddResource, loading }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Resources</h2>
      <button
        onClick={onAddResource}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Add Resource
      </button>
    </div>

    {loading ? (
      <div className="text-center py-4">Loading...</div>
    ) : resources.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No resources yet.</p>
        <p className="text-sm">Click "Add Resource" to add the first resource.</p>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 gap-4">
        {resources.map(resource => (
          <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900">{resource.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                resource.kind === 'link' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {resource.kind}
              </span>
            </div>

            {resource.kind === 'link' && resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                {resource.url}
              </a>
            )}

            {resource.kind === 'file' && resource.storage_path && (
              <p className="text-sm text-gray-600">
                File: {resource.storage_path}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// Comments Tab Component
const CommentsTab: React.FC<{
  goals: GiftedGoal[];
  comments: GiftedComment[];
  selectedGoalId: string;
  onGoalSelect: (goalId: string) => void;
  onAddComment: (comment: CommentInput) => void;
  loading: boolean;
}> = ({ goals, comments, selectedGoalId, onGoalSelect, onAddComment, loading }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedGoalId) return;

    onAddComment({
      goal_id: selectedGoalId,
      text: newComment.trim()
    });
    setNewComment('');
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Comments</h2>

      {goals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Create some goals first to add comments.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Goal Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Goal:
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => onGoalSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Choose a goal...</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>

          {selectedGoalId && (
            <>
              {/* Add Comment Form */}
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Comment:
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter your comment..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Add Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet.</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {comment.profiles?.email || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-900">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Profile Form Modal
const ProfileFormModal: React.FC<{
  studentId: string;
  onClose: () => void;
  onSave: (profile: ProfileInput) => void;
}> = ({ studentId, onClose, onSave }) => {
  const [domain, setDomain] = useState('');
  const [strengths, setStrengths] = useState<Strength[]>([{ label: '', evidence: '', level: '' }]);
  const [notes, setNotes] = useState('');

  const addStrength = () => {
    setStrengths([...strengths, { label: '', evidence: '', level: '' }]);
  };

  const updateStrength = (index: number, field: keyof Strength, value: string) => {
    const updated = [...strengths];
    updated[index] = { ...updated[index], [field]: value };
    setStrengths(updated);
  };

  const removeStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || strengths.some(s => !s.label)) return;

    onSave({
      student_id: studentId,
      domain,
      strengths: strengths.filter(s => s.label.trim()),
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Strength Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain *
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Math, Language Arts, STEM, Leadership"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Strengths *
              </label>
              <button
                type="button"
                onClick={addStrength}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Strength
              </button>
            </div>
            
            {strengths.map((strength, index) => (
              <div key={index} className="border border-gray-200 rounded p-3 mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Strength #{index + 1}</span>
                  {strengths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStrength(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={strength.label}
                    onChange={(e) => updateStrength(index, 'label', e.target.value)}
                    placeholder="Strength label *"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={strength.level || ''}
                    onChange={(e) => updateStrength(index, 'level', e.target.value)}
                    placeholder="Level (optional)"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={strength.evidence || ''}
                    onChange={(e) => updateStrength(index, 'evidence', e.target.value)}
                    placeholder="Evidence (optional)"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Goal Form Modal
const GoalFormModal: React.FC<{
  studentId: string;
  onClose: () => void;
  onSave: (goal: GoalInput) => void;
}> = ({ studentId, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'paused' | 'cancelled'>('active');
  const [targetDate, setTargetDate] = useState('');
  const [resourcesHint, setResourcesHint] = useState('');
  const [progressNote, setProgressNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSave({
      student_id: studentId,
      title,
      status,
      target_date: targetDate || undefined,
      resources_hint: resourcesHint.trim() || undefined,
      progress_note: progressNote.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">New Enrichment Goal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Math Olympiad Path, Advanced Reading Program"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Hints
            </label>
            <textarea
              value={resourcesHint}
              onChange={(e) => setResourcesHint(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Recommended materials, programs, or resources"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress Notes
            </label>
            <textarea
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Current progress or implementation notes"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Resource Form Modal
const ResourceFormModal: React.FC<{
  studentId: string;
  onClose: () => void;
  onSave: (resource: ResourceInput) => void;
}> = ({ studentId, onClose, onSave }) => {
  const [kind, setKind] = useState<'link' | 'file'>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [storagePath, setStoragePath] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (kind === 'link' && !url) || (kind === 'file' && !storagePath)) return;

    onSave({
      student_id: studentId,
      kind,
      title,
      url: kind === 'link' ? url : undefined,
      storage_path: kind === 'file' ? storagePath : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Resource</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Type
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as 'link' | 'file')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="link">Link</option>
              <option value="file">File</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Resource title or description"
              required
            />
          </div>

          {kind === 'link' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Path *
              </label>
              <input
                type="text"
                value={storagePath}
                onChange={(e) => setStoragePath(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="path/to/file.pdf"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the storage path for the uploaded file
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GiftedDashboard;