'use client'

import { useState, useEffect } from 'react'
import { supabase, goalHelpers, reminderHelpers, aiReviewHelpers } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Target, Bell, Brain, Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

const Dashboard = () => {
  const [goals, setGoals] = useState([])
  const [reminders, setReminders] = useState([])
  const [aiInsights, setAiInsights] = useState({})
  const [loading, setLoading] = useState(true)
  const [goalDialog, setGoalDialog] = useState(false)
  const [reminderDialog, setReminderDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [editingReminder, setEditingReminder] = useState(null)

  // Goal form state
  const [goalForm, setGoalForm] = useState({
    title: '',
    status: 'not_started',
    notes: '',
    targetDate: ''
  })

  // Reminder form state
  const [reminderForm, setReminderForm] = useState({
    title: 'IEP Meeting',
    meetingDate: '',
    notes: ''
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [goalsData, remindersData, insightsData] = await Promise.all([
        goalHelpers.getAll(),
        reminderHelpers.getAll(),
        aiReviewHelpers.getInsights()
      ])
      
      setGoals(goalsData)
      setReminders(remindersData)
      setAiInsights(insightsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleGoalSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingGoal) {
        await goalHelpers.update(editingGoal.id, goalForm)
        toast.success('Goal updated successfully')
      } else {
        await goalHelpers.create(goalForm)
        toast.success('Goal created successfully')
      }
      
      setGoalDialog(false)
      setEditingGoal(null)
      setGoalForm({ title: '', status: 'not_started', notes: '', targetDate: '' })
      await loadDashboardData()
    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error('Failed to save goal')
    }
  }

  const handleReminderSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingReminder) {
        await reminderHelpers.update(editingReminder.id, reminderForm)
        toast.success('Reminder updated successfully')
      } else {
        await reminderHelpers.create(reminderForm)
        toast.success('Reminder created successfully')
      }
      
      setReminderDialog(false)
      setEditingReminder(null)
      setReminderForm({ title: 'IEP Meeting', meetingDate: '', notes: '' })
      await loadDashboardData()
    } catch (error) {
      console.error('Error saving reminder:', error)
      toast.error('Failed to save reminder')
    }
  }

  const deleteGoal = async (id) => {
    try {
      await goalHelpers.delete(id)
      toast.success('Goal deleted successfully')
      await loadDashboardData()
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('Failed to delete goal')
    }
  }

  const editGoal = (goal) => {
    setEditingGoal(goal)
    setGoalForm({
      title: goal.title,
      status: goal.status,
      notes: goal.notes || '',
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : ''
    })
    setGoalDialog(true)
  }

  const editReminder = (reminder) => {
    setEditingReminder(reminder)
    setReminderForm({
      title: reminder.title,
      meetingDate: new Date(reminder.meetingDate).toISOString().slice(0, 16),
      notes: reminder.notes || ''
    })
    setReminderDialog(true)
  }

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || colors['not_started']
  }

  const getStatusIcon = (status) => {
    const icons = {
      'not_started': <Clock className="w-4 h-4" />,
      'in_progress': <Target className="w-4 h-4" />,
      'completed': <CheckCircle className="w-4 h-4" />,
      'on_hold': <AlertCircle className="w-4 h-4" />
    }
    return icons[status] || icons['not_started']
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntil = (dateString) => {
    const today = new Date()
    const targetDate = new Date(dateString)
    const diffTime = targetDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My IEP Hero Dashboard</h1>
              <p className="text-gray-600 mt-1">Parent Empowerment Tools</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Brain className="w-4 h-4 mr-1" />
                AI-Powered Insights
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Goals</p>
                  <p className="text-2xl font-bold">{goals.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed Goals</p>
                  <p className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Active Reminders</p>
                  <p className="text-2xl font-bold">{reminders.length}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">AI Reviews</p>
                  <p className="text-2xl font-bold">{aiInsights.totalReviews || 0}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goals Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-blue-700">
                      <Target className="w-5 h-5 mr-2" />
                      Goal Tracker
                    </CardTitle>
                    <CardDescription>Track your child's IEP goals and progress</CardDescription>
                  </div>
                  <Dialog open={goalDialog} onOpenChange={setGoalDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
                        <DialogDescription>
                          {editingGoal ? 'Update your goal details' : 'Create a new IEP goal to track progress'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleGoalSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Goal Title</Label>
                          <Input
                            id="title"
                            value={goalForm.title}
                            onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                            placeholder="Enter goal title"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={goalForm.status} onValueChange={(value) => setGoalForm({...goalForm, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Not Started</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="on_hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="targetDate">Target Date</Label>
                          <Input
                            id="targetDate"
                            type="date"
                            value={goalForm.targetDate}
                            onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={goalForm.notes}
                            onChange={(e) => setGoalForm({...goalForm, notes: e.target.value})}
                            placeholder="Add any notes or progress updates"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setGoalDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            {editingGoal ? 'Update Goal' : 'Add Goal'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No goals yet. Add your first IEP goal to get started!</p>
                    </div>
                  ) : (
                    goals.map((goal) => (
                      <div key={goal.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                              <Badge className={getStatusColor(goal.status)}>
                                {getStatusIcon(goal.status)}
                                <span className="ml-1">{goal.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                            {goal.notes && (
                              <p className="text-gray-600 text-sm mb-2">{goal.notes}</p>
                            )}
                            <div className="text-xs text-gray-500">
                              {goal.targetDate && (
                                <span>Target: {formatDate(goal.targetDate)} • </span>
                              )}
                              Created: {formatDate(goal.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editGoal(goal)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteGoal(goal.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reminders Section */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-orange-700">
                      <Bell className="w-5 h-5 mr-2" />
                      Meeting Reminders
                    </CardTitle>
                    <CardDescription>Schedule IEP meeting reminders</CardDescription>
                  </div>
                  <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add Meeting Reminder'}</DialogTitle>
                        <DialogDescription>
                          {editingReminder ? 'Update reminder details' : 'Schedule a new IEP meeting reminder'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleReminderSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="reminderTitle">Meeting Title</Label>
                          <Input
                            id="reminderTitle"
                            value={reminderForm.title}
                            onChange={(e) => setReminderForm({...reminderForm, title: e.target.value})}
                            placeholder="IEP Meeting"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="meetingDate">Meeting Date & Time</Label>
                          <Input
                            id="meetingDate"
                            type="datetime-local"
                            value={reminderForm.meetingDate}
                            onChange={(e) => setReminderForm({...reminderForm, meetingDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="reminderNotes">Notes</Label>
                          <Textarea
                            id="reminderNotes"
                            value={reminderForm.notes}
                            onChange={(e) => setReminderForm({...reminderForm, notes: e.target.value})}
                            placeholder="Preparation notes or agenda items"
                            rows={3}
                          />
                        </div>
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium mb-1">📧 Automatic Email Reminders:</p>
                          <ul className="text-xs space-y-1">
                            <li>• 7 days before meeting</li>
                            <li>• 3 days before meeting</li>
                            <li>• 1 day before meeting</li>
                          </ul>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setReminderDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                            {editingReminder ? 'Update Reminder' : 'Add Reminder'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reminders.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No reminders set</p>
                    </div>
                  ) : (
                    reminders.map((reminder) => {
                      const daysUntil = getDaysUntil(reminder.meetingDate)
                      const isUpcoming = daysUntil <= 7 && daysUntil >= 0
                      
                      return (
                        <div key={reminder.id} className={`p-3 rounded-lg border ${isUpcoming ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{reminder.title}</h4>
                              <p className="text-xs text-gray-600">{formatDate(reminder.meetingDate)}</p>
                              {daysUntil >= 0 ? (
                                <Badge variant="outline" className={`mt-1 text-xs ${isUpcoming ? 'bg-orange-100 text-orange-800' : ''}`}>
                                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="mt-1 text-xs bg-gray-100">
                                  Past
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editReminder(reminder)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Brain className="w-5 h-5 mr-2" />
                  Deeper AI Insights
                </CardTitle>
                <CardDescription>Key patterns from your IEP reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Top Concerns */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">🎯 Top Concerns</h4>
                    <div className="flex flex-wrap gap-1">
                      {aiInsights.topConcerns?.slice(0, 3).map((concern, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          {concern}
                        </Badge>
                      )) || <p className="text-xs text-gray-500">No concerns identified</p>}
                    </div>
                  </div>

                  {/* Upcoming Dates */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">📅 Key Dates</h4>
                    <div className="space-y-1">
                      {aiInsights.upcomingDates?.slice(0, 3).map((date, index) => (
                        <p key={index} className="text-xs text-gray-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(date)}
                        </p>
                      )) || <p className="text-xs text-gray-500">No key dates found</p>}
                    </div>
                  </div>

                  {/* Recent Trends */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">📈 Recent Trends</h4>
                    <div className="space-y-2">
                      {aiInsights.recentTrends?.slice(0, 2).map((trend, index) => (
                        <p key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {trend}
                        </p>
                      )) || <p className="text-xs text-gray-500">No trends available</p>}
                    </div>
                  </div>

                  {aiInsights.lastUpdated && (
                    <div className="text-xs text-gray-400 border-t pt-2">
                      Last updated: {formatDate(aiInsights.lastUpdated)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard