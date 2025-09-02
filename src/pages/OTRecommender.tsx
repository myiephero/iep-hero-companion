import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Users, Clock, CheckCircle, BookOpen } from "lucide-react";

export default function OTRecommender() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">OT Activity Recommender</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional occupational therapy activity suggestions and adaptations for IEP implementation.
          </p>
          <Badge className="bg-gradient-to-r from-success to-success-light text-success-foreground">
            OT Professional Tool
          </Badge>
        </div>

        {/* Quick Activity Finder */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                Fine Motor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Find Activities</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Sensory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Browse</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-primary" />
                Cognitive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Explore</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                Daily Living
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Discover</Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Fine Motor Skills
              </CardTitle>
              <CardDescription>
                Hand strength, dexterity, and precision activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Pencil Grip Strengthening</h4>
                  <p className="text-xs text-muted-foreground">Therapy putty exercises, clothespin activities</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">Age 5-8</Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Scissor Skills Practice</h4>
                  <p className="text-xs text-muted-foreground">Progressive cutting activities with adaptations</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">Age 4-10</Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Sensory Processing
              </CardTitle>
              <CardDescription>
                Sensory integration and regulation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Proprioceptive Input</h4>
                  <p className="text-xs text-muted-foreground">Heavy work activities, joint compression</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">All Ages</Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Tactile Exploration</h4>
                  <p className="text-xs text-muted-foreground">Texture bins, sensory play activities</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">Age 3-12</Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Cognitive Skills
              </CardTitle>
              <CardDescription>
                Executive function and problem-solving activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Visual Processing</h4>
                  <p className="text-xs text-muted-foreground">Pattern recognition, visual discrimination</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">Age 6+</Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Executive Function</h4>
                  <p className="text-xs text-muted-foreground">Planning, organization, working memory</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">Age 8+</Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Resources */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Evidence-Based Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Research-supported interventions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Progress measurement tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Professional documentation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  IEP goal alignment
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Adaptive Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Assistive technology recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Environmental modifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Low-cost adaptations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Implementation strategies
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Activity Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Activity Templates</CardTitle>
            <CardDescription>
              Ready-to-use activity plans with professional documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium mb-2">Handwriting Readiness Program</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  6-week progressive program for pre-writing skills
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">Pre-K to 2nd</Badge>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium mb-2">Sensory Diet Builder</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Customizable sensory activities for regulation
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">All Ages</Badge>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium mb-2">Executive Function Training</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Structured program for planning and organization
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">Middle School+</Badge>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}