import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smile, Heart, Brain, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

export default function ParentEmotionTracker() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smile className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">My Child's Emotion Tracker</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your child's emotional well-being and behavioral patterns to support their success.
          </p>
          <Badge className="bg-gradient-to-r from-success to-success-light text-success-foreground">
            Family Wellness
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
                Behavior Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Add Note</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                View Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">See Trends</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                Share Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Generate</Button>
            </CardContent>
          </Card>
        </div>

        {/* Emotion Dashboard */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Today's Emotional Check-in
              </CardTitle>
              <CardDescription>
                How is your child feeling today?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center p-3 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-colors">
                    <div className="text-2xl mb-1">😊</div>
                    <p className="text-xs">Happy</p>
                  </div>
                  <div className="text-center p-3 bg-blue-100 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
                    <div className="text-2xl mb-1">😐</div>
                    <p className="text-xs">Okay</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 rounded-lg cursor-pointer hover:bg-yellow-200 transition-colors">
                    <div className="text-2xl mb-1">😟</div>
                    <p className="text-xs">Worried</p>
                  </div>
                  <div className="text-center p-3 bg-orange-100 rounded-lg cursor-pointer hover:bg-orange-200 transition-colors">
                    <div className="text-2xl mb-1">😠</div>
                    <p className="text-xs">Frustrated</p>
                  </div>
                  <div className="text-center p-3 bg-red-100 rounded-lg cursor-pointer hover:bg-red-200 transition-colors">
                    <div className="text-2xl mb-1">😢</div>
                    <p className="text-xs">Sad</p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Last recorded: This morning - "Excited about art class today!"
                  </p>
                  <Button className="w-full">Update How They're Feeling</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                This Week's Pattern
              </CardTitle>
              <CardDescription>
                Your child's emotional trends over the past week
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
                  <div className="h-8 bg-green-200 rounded" title="Happy day"></div>
                  <div className="h-8 bg-green-300 rounded" title="Great day"></div>
                  <div className="h-8 bg-yellow-200 rounded" title="Mixed emotions"></div>
                  <div className="h-8 bg-green-200 rounded" title="Good day"></div>
                  <div className="h-8 bg-green-400 rounded" title="Excellent day"></div>
                  <div className="h-8 bg-blue-200 rounded" title="Calm day"></div>
                  <div className="h-8 bg-green-200 rounded" title="Happy day"></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Mostly positive emotions this week! 🌟</p>
                  <p>• Wednesday had some challenges</p>
                  <p>• Weekend was peaceful and happy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Support Tools */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                Helpful Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Take deep breaths together</li>
                <li>• Use a calm-down corner</li>
                <li>• Practice gratitude sharing</li>
                <li>• Physical movement breaks</li>
              </ul>
              <Button size="sm" className="w-full mt-3">Learn More</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Watch For Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Changes in sleep patterns</li>
                <li>• Withdrawal from activities</li>
                <li>• Increased meltdowns</li>
                <li>• School avoidance</li>
              </ul>
              <Button size="sm" className="w-full mt-3" variant="outline">Get Guidance</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Daily Routine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Morning check-in (8:00 AM)</li>
                <li>• After-school chat (3:30 PM)</li>
                <li>• Dinner reflection (6:00 PM)</li>
                <li>• Bedtime gratitude (8:00 PM)</li>
              </ul>
              <Button size="sm" className="w-full mt-3" variant="outline">Customize</Button>
            </CardContent>
          </Card>
        </div>

        {/* Family Notes & Observations */}
        <Card>
          <CardHeader>
            <CardTitle>Family Notes & Observations</CardTitle>
            <CardDescription>
              Track important moments and patterns you notice at home
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Great Progress! 🌟</h4>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used the breathing technique we practiced when frustrated with homework. 
                  Calmed down much faster than usual!
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Pattern Notice</h4>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Seems more anxious on Sundays. Might be related to thinking about the school week ahead. 
                  Will try Sunday evening prep routine.
                </p>
              </div>
              
              <div className="pt-2">
                <Button className="w-full" variant="outline">Add New Observation</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}