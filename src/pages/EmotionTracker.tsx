import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smile, Heart, Brain, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

export default function EmotionTracker() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smile className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Emotion Tracker</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Student well-being monitoring tools with professional behavioral analysis and intervention planning.
          </p>
          <Badge className="bg-gradient-to-r from-success to-success-light text-success-foreground">
            Wellness Monitoring
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Smile className="h-4 w-4 text-primary" />
                Daily Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Record Mood</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-primary" />
                Behavior Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Add Entry</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                View Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Analyze</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Intervention Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Create</Button>
            </CardContent>
          </Card>
        </div>

        {/* Emotion Dashboard */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Today's Emotional Status
              </CardTitle>
              <CardDescription>
                Current emotional well-being assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center p-3 bg-green-100 rounded-lg">
                    <div className="text-2xl mb-1">😊</div>
                    <p className="text-xs">Happy</p>
                  </div>
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <div className="text-2xl mb-1">😐</div>
                    <p className="text-xs">Neutral</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                    <div className="text-2xl mb-1">😟</div>
                    <p className="text-xs">Worried</p>
                  </div>
                  <div className="text-center p-3 bg-orange-100 rounded-lg">
                    <div className="text-2xl mb-1">😠</div>
                    <p className="text-xs">Angry</p>
                  </div>
                  <div className="text-center p-3 bg-red-100 rounded-lg">
                    <div className="text-2xl mb-1">😢</div>
                    <p className="text-xs">Sad</p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Last recorded: 2 hours ago - "Feeling good after math success"
                  </p>
                  <Button className="w-full">Update Status</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Weekly Patterns
              </CardTitle>
              <CardDescription>
                Emotional trends and behavioral patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  <div className="h-8 bg-green-200 rounded"></div>
                  <div className="h-8 bg-green-300 rounded"></div>
                  <div className="h-8 bg-yellow-200 rounded"></div>
                  <div className="h-8 bg-green-200 rounded"></div>
                  <div className="h-8 bg-green-400 rounded"></div>
                  <div className="h-8 bg-blue-200 rounded"></div>
                  <div className="h-8 bg-green-200 rounded"></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Green: Positive emotions (5 days)</p>
                  <p>• Yellow: Neutral/Mixed (1 day)</p>
                  <p>• Blue: Calm/Relaxed (1 day)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intervention Tools */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                Coping Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Deep breathing exercises</li>
                <li>• Mindfulness techniques</li>
                <li>• Physical movement breaks</li>
                <li>• Positive self-talk</li>
              </ul>
              <Button size="sm" className="w-full mt-3">View All</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Increased irritability</li>
                <li>• Social withdrawal</li>
                <li>• Academic regression</li>
                <li>• Sleep disruption</li>
              </ul>
              <Button size="sm" className="w-full mt-3" variant="outline">Monitor</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Support Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Morning check-in (9:00 AM)</li>
                <li>• Mid-day assessment (12:00 PM)</li>
                <li>• Afternoon support (3:00 PM)</li>
                <li>• Evening reflection (6:00 PM)</li>
              </ul>
              <Button size="sm" className="w-full mt-3" variant="outline">Adjust</Button>
            </CardContent>
          </Card>
        </div>

        {/* Professional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Analysis & Notes</CardTitle>
            <CardDescription>
              Behavioral observations and intervention recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Positive Progress Note</h4>
                  <span className="text-xs text-muted-foreground">Jan 15, 2024</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Student showed significant improvement in emotional regulation during math activities. 
                  Recommend continuing current coping strategies and increasing positive reinforcement.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Intervention Adjustment</h4>
                  <span className="text-xs text-muted-foreground">Jan 14, 2024</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Increased anxiety noted during transitions. Implementing visual schedule and 
                  advance warnings. Monitor for 2 weeks before next adjustment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}