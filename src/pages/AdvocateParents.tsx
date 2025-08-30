import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Users, Mail, Phone, Plus, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  status: string;
  students_count?: number;
}

export default function AdvocateParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchParents();
    }
  }, [user]);

  const fetchParents = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/parents');
      if (response.ok) {
        const data = await response.json();
        setParents(data || []);
      } else {
        // If API doesn't exist yet, show empty state
        setParents([]);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      // For now, just set empty array - API might not be implemented yet
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "invited": return "bg-warning text-warning-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (!user) {
    return <div>Please log in to view your clients.</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Parent Clients</h1>
            <p className="text-muted-foreground">
              Manage your client relationships and view parent accounts you've created
            </p>
          </div>
          <Button asChild className="button-premium">
            <Link to="/advocate/create-parent">
              <Plus className="h-4 w-4 mr-2" />
              Create New Parent
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading parent clients...</p>
          </div>
        ) : parents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Parent Clients Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any parent accounts yet. Get started by inviting your first client.
              </p>
              <Button asChild className="button-premium">
                <Link to="/advocate/create-parent">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Create Your First Parent Client
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parents.map((parent) => (
              <Card key={parent.id} className="premium-card hover-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{parent.full_name}</CardTitle>
                    <Badge className={getStatusColor(parent.status)}>
                      {parent.status || 'Invited'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created {formatDate(parent.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{parent.email}</span>
                    </div>
                    {parent.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{parent.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      {parent.students_count || 0} student{parent.students_count !== 1 ? 's' : ''}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/advocate/students?parent=${parent.id}`}>
                        View Students
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {parents.length > 0 && (
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{parents.length}</div>
                  <div className="text-sm text-muted-foreground">Total Parents</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {parents.filter(p => p.status?.toLowerCase() === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Clients</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-warning">
                    {parents.filter(p => p.status?.toLowerCase() === 'invited').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Invitations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}