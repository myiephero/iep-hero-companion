import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, UserSearch, ArrowRight } from 'lucide-react';
import { useAuth, supabase } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  grade: number;
  needs: string[];
  languages: string[];
  timezone: string;
  budget?: number;
  narrative?: string;
}

export default function Home() {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    needs: '',
    languages: 'en',
    timezone: 'America/New_York',
    budget: '',
    narrative: '',
  });

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.grade) return;

    try {
      setIsCreating(true);
      
      const studentData = {
        name: formData.name,
        grade: parseInt(formData.grade),
        needs: formData.needs.split(',').map(tag => tag.trim()).filter(Boolean),
        languages: [formData.languages],
        timezone: formData.timezone,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        narrative: formData.narrative || null,
        parent_id: user.id,
      };

      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();

      if (error) throw error;

      setStudents([data, ...students]);
      setFormData({
        name: '',
        grade: '',
        needs: '',
        languages: 'en',
        timezone: 'America/New_York',
        budget: '',
        narrative: '',
      });
      
      toast.success('Student profile created successfully!');
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Failed to create student profile');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">
          Welcome to My IEP Hero
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Connect with specialized advocates who understand your child's unique needs
        </p>
      </div>

      {/* Quick Actions */}
      {profile?.role === 'parent' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-emerald-800">
                <Plus className="w-5 h-5" />
                <span>Add Student Profile</span>
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Create a profile for your child to start finding advocates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Create Student Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Create a profile for your student to find matching advocates
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Student Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade Level *</Label>
                      <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                            <SelectItem key={grade} value={grade.toString()}>
                              Grade {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="needs">Needs (comma-separated)</Label>
                      <Input
                        id="needs"
                        placeholder="autism, speech, ot, behavioral"
                        value={formData.needs}
                        onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget per Hour ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="100"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="narrative">Tell us about your child</Label>
                      <Textarea
                        id="narrative"
                        placeholder="Describe your child's specific situation, strengths, and challenges..."
                        value={formData.narrative}
                        onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <Button type="submit" disabled={isCreating} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {isCreating ? 'Creating...' : 'Create Student Profile'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <UserSearch className="w-5 h-5" />
                <span>Find Advocates</span>
              </CardTitle>
              <CardDescription className="text-blue-700">
                Browse and connect with qualified advocates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/matching">
                <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                  View Matching Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students List */}
      {profile?.role === 'parent' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">My Students</h2>
            <span className="text-sm text-slate-600">{students.length} student{students.length !== 1 ? 's' : ''}</span>
          </div>

          {students.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">No students yet</h3>
                  <p className="text-slate-600">Create your first student profile to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {students.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-slate-900">{student.name}</CardTitle>
                        <CardDescription>
                          Grade {student.grade} • {student.timezone}
                        </CardDescription>
                      </div>
                      <Link to={`/matching?student=${student.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <UserSearch className="w-4 h-4 mr-2" />
                          Find Advocates
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {student.needs.map((need) => (
                        <Badge key={need} variant="secondary" className="bg-emerald-50 text-emerald-700">
                          {need}
                        </Badge>
                      ))}
                    </div>
                    
                    {student.budget && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Budget:</span> ${student.budget}/hour
                      </p>
                    )}
                    
                    {student.narrative && (
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {student.narrative}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}