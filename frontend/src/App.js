import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Bell, Users, UserPlus, Star, Clock, CheckCircle, XCircle, Calendar, Phone } from "lucide-react";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock user context (in real app, this would come from auth)
const mockUser = {
  id: "user-123",
  email: "parent@example.com", 
  name: "Sarah Johnson",
  role: "parent"
};

// Student Management Component
const StudentManagement = ({ students, onStudentCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    needs: "",
    languages: "en",
    timezone: "America/New_York",
    budget: "",
    narrative: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentData = {
        ...formData,
        grade: parseInt(formData.grade),
        needs: formData.needs.split(',').map(tag => tag.trim()).filter(Boolean),
        languages: [formData.languages],
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      const response = await axios.post(`${API}/students`, studentData);
      toast.success("Student profile created successfully!");
      setIsCreating(false);
      setFormData({
        name: "",
        grade: "",
        needs: "",
        languages: "en", 
        timezone: "America/New_York",
        budget: "",
        narrative: ""
      });
      onStudentCreated();
    } catch (error) {
      toast.error("Failed to create student profile");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">My Students</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Create a profile for your student to find matching advocates
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input
                type="number"
                placeholder="Grade Level"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                required
                min="1"
                max="12"
              />
              <Input
                placeholder="Needs (comma-separated: autism, speech, ot)"
                value={formData.needs}
                onChange={(e) => setFormData({...formData, needs: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Budget per hour ($)"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
              <Textarea
                placeholder="Tell us about your student's specific situation..."
                value={formData.narrative}
                onChange={(e) => setFormData({...formData, narrative: e.target.value})}
                rows={3}
              />
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Create Student Profile
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {students.map(student => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-slate-900">{student.name}</CardTitle>
                  <CardDescription>Grade {student.grade} • {student.timezone}</CardDescription>
                </div>
                <Link to={`/match/${student.id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Find Advocate
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.needs.map(need => (
                  <Badge key={need} variant="secondary" className="bg-blue-50 text-blue-700">
                    {need}
                  </Badge>
                ))}
              </div>
              {student.budget && (
                <p className="text-sm text-slate-600 mt-2">Budget: ${student.budget}/hour</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Advocate Card Component
const AdvocateCard = ({ advocate, score, reasons, onPropose, proposing }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-blue-500">
              <AvatarFallback className="text-white font-semibold">
                {advocate.id.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-slate-900">Advocate {advocate.id.slice(-4)}</CardTitle>
              <CardDescription>
                {advocate.experience_years} years • {advocate.timezone}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-lg font-bold text-slate-900">{score.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-slate-600">Match Score</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {advocate.tags.map(tag => (
            <Badge 
              key={tag} 
              variant={reasons.tag_overlap > 0 ? "default" : "secondary"}
              className={reasons.tag_overlap > 0 ? "bg-emerald-100 text-emerald-800" : ""}
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {advocate.hourly_rate && (
          <p className="text-sm text-slate-700">
            <span className="font-medium">${advocate.hourly_rate}/hour</span>
            {reasons.price_fit && <span className="text-emerald-600 ml-2">✓ Within budget</span>}
          </p>
        )}
        
        <div className="space-y-2 text-sm text-slate-600">
          {reasons.language_match && (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Language match</span>
            </div>
          )}
          {reasons.timezone_match && (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Same timezone</span>
            </div>
          )}
          {reasons.capacity_available && (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Available capacity</span>
            </div>
          )}
        </div>

        <Button 
          onClick={() => onPropose(advocate.id)}
          disabled={proposing}
          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
        >
          {proposing ? "Requesting..." : "Request Match"}
        </Button>
      </CardContent>
    </Card>
  );
};

// Match Finding Component
const MatchFinder = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      // Get student details
      const studentsResponse = await axios.get(`${API}/students`);
      const studentData = studentsResponse.data.find(s => s.id === studentId);
      setStudent(studentData);

      // Get suggestions
      const suggestionsResponse = await axios.post(`${API}/match/suggest`, {
        student_id: studentId,
        top_n: 8
      });
      setSuggestions(suggestionsResponse.data);
    } catch (error) {
      toast.error("Failed to load matching data");
    } finally {
      setLoading(false);
    }
  };

  const handlePropose = async (advocateId) => {
    setProposing(true);
    try {
      await axios.post(`${API}/match/propose`, {
        student_id: studentId,
        advocate_ids: [advocateId],
        reason: { source: "manual_selection", timestamp: new Date().toISOString() }
      });
      toast.success("Match request sent successfully!");
      navigate("/matches");
    } catch (error) {
      toast.error("Failed to send match request");
    } finally {
      setProposing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Finding the best advocates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Find Advocate for {student?.name}</h2>
          <p className="text-slate-600 mt-1">
            Grade {student?.grade} • Looking for: {student?.needs.join(", ")}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-slate-700 mb-2">No Matches Found</CardTitle>
            <p className="text-slate-600">
              We couldn't find any advocates matching your criteria right now. 
              Please check back later or contact support.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map(({ advocate, score, reasons }) => (
            <AdvocateCard
              key={advocate.id}
              advocate={advocate}
              score={score}
              reasons={reasons}
              onPropose={handlePropose}
              proposing={proposing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Proposal Card Component  
const ProposalCard = ({ enrichedProposal, userRole, onAction }) => {
  const { proposal, student, advocate } = enrichedProposal;
  const [actionLoading, setActionLoading] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      proposed: "bg-yellow-100 text-yellow-800",
      intro_requested: "bg-blue-100 text-blue-800",
      scheduled: "bg-purple-100 text-purple-800",
      accepted: "bg-emerald-100 text-emerald-800",
      declined: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  const handleAction = async (action, data = {}) => {
    setActionLoading(true);
    try {
      await onAction(proposal.id, action, data);
      toast.success(`Action ${action} completed successfully!`);
    } catch (error) {
      toast.error(`Failed to ${action} proposal`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-slate-900">
              {student?.name} {userRole === "advocate" && `(Grade ${student?.grade})`}
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 mt-1">
              <span>Score: {proposal.score.toFixed(0)}%</span>
              <span>•</span>
              <span className="text-xs">{new Date(proposal.created_at).toLocaleDateString()}</span>
            </CardDescription>
          </div>
          <Badge className={getStatusColor(proposal.status)}>
            {proposal.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {student && (
          <div className="flex flex-wrap gap-2">
            {student.needs.map(need => (
              <Badge key={need} variant="secondary" className="bg-blue-50 text-blue-700">
                {need}
              </Badge>
            ))}
          </div>
        )}

        {userRole === "advocate" && proposal.status === "proposed" && (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => handleAction("intro", { channel: "zoom" })}
              disabled={actionLoading}
              variant="outline"
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Request Intro
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleAction("accept")}
              disabled={actionLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleAction("decline")}
              disabled={actionLoading}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        )}

        {userRole === "parent" && proposal.status === "intro_requested" && (
          <div className="flex space-x-2">
            <Button 
              size="sm"
              onClick={() => handleAction("intro", { 
                when_ts: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                channel: "zoom",
                link: "https://zoom.us/j/example"
              })}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="w-4 h-4 mr-1" />
              Schedule Intro
            </Button>
          </div>
        )}

        {proposal.status === "scheduled" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800 font-medium">
              <Calendar className="w-4 h-4 inline mr-1" />
              Intro call scheduled
            </p>
          </div>
        )}

        {proposal.status === "accepted" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-sm text-emerald-800 font-medium">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Match accepted! You can now start working together.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Match Dashboard Component
const MatchDashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [proposalsResponse, notificationsResponse] = await Promise.all([
        axios.get(`${API}/match/my`),
        axios.get(`${API}/notifications`)
      ]);
      setProposals(proposalsResponse.data);
      setNotifications(notificationsResponse.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleProposalAction = async (proposalId, action, data = {}) => {
    if (action === "accept") {
      await axios.post(`${API}/match/${proposalId}/accept`);
    } else if (action === "decline") {
      await axios.post(`${API}/match/${proposalId}/decline`);
    } else if (action === "intro") {
      await axios.post(`${API}/match/${proposalId}/intro`, data);
    }
    
    // Reload data
    loadData();
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.post(`${API}/notifications/${notificationId}/read`);
      loadData();
    } catch (error) {
      console.error("Failed to mark notification as read");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">My Matches</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-slate-600" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {unreadNotifications.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unreadNotifications.slice(0, 3).map(notification => (
              <div 
                key={notification.id}
                className="flex justify-between items-start p-3 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-25"
                onClick={() => markNotificationRead(notification.id)}
              >
                <div>
                  <p className="font-medium text-slate-900">{notification.title}</p>
                  <p className="text-sm text-slate-600">{notification.message}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Match Proposals */}
      <div className="grid gap-4">
        {proposals.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <CardTitle className="text-xl text-slate-700 mb-2">No Matches Yet</CardTitle>
              <p className="text-slate-600">
                {mockUser.role === "parent" 
                  ? "Start by finding advocates for your students"
                  : "New matching opportunities will appear here"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          proposals.map(enrichedProposal => (
            <ProposalCard
              key={enrichedProposal.proposal.id}
              enrichedProposal={enrichedProposal}
              userRole={mockUser.role}
              onAction={handleProposalAction}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <BrowserRouter>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-3 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">IEP Hero</h1>
                  <p className="text-slate-600">Advocate Matching Platform</p>
                </div>
              </Link>
              <nav className="flex space-x-4">
                <Link to="/">
                  <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/matches">
                  <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                    My Matches
                  </Button>
                </Link>
              </nav>
            </div>
          </header>

          {/* Routes */}
          <Routes>
            <Route path="/" element={
              <StudentManagement 
                students={students} 
                onStudentCreated={loadStudents}
              />
            } />
            <Route path="/match/:studentId" element={
              <MatchFinderWrapper />
            } />
            <Route path="/matches" element={<MatchDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

// Wrapper component for MatchFinder to get studentId from URL
const MatchFinderWrapper = () => {
  const { studentId } = require("react-router-dom").useParams();
  return <MatchFinder studentId={studentId} />;
};

export default App;