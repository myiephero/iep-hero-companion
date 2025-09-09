import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentSelector } from "@/components/StudentSelector";
import { useState } from "react";
import { Target, Play, Clock, Star, CheckCircle, RefreshCw, Users, Home, School } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  ageRange: string;
  duration: string;
  materials: string[];
  instructions: string[];
  modifications: string[];
  goals: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  setting: 'home' | 'school' | 'both';
}

const skillAreas = [
  "Fine Motor Skills",
  "Gross Motor Skills", 
  "Visual Motor Integration",
  "Handwriting",
  "Sensory Processing",
  "Executive Function",
  "Self-Care Skills",
  "Social Skills",
  "Attention & Focus",
  "Bilateral Coordination"
];

const ageGroups = [
  "3-5 years",
  "6-8 years", 
  "9-12 years",
  "13-15 years",
  "16+ years"
];

const sampleActivities: Activity[] = [
  {
    id: "1",
    title: "Playdough Finger Exercises",
    description: "Strengthen finger muscles and improve dexterity through targeted playdough activities",
    category: "Fine Motor Skills",
    ageRange: "3-8 years",
    duration: "10-15 minutes",
    materials: ["Playdough", "Small objects (buttons, beads)", "Cookie cutters", "Rolling pin"],
    instructions: [
      "Roll playdough into small balls using fingertips",
      "Pinch and pull playdough to make shapes",
      "Hide small objects in playdough for child to find",
      "Use cookie cutters to make shapes",
      "Practice rolling out flat sheets"
    ],
    modifications: [
      "Use therapy putty for increased resistance",
      "Start with larger objects for easier grasping",
      "Break into shorter 5-minute sessions for attention difficulties"
    ],
    goals: [
      "Improve finger strength",
      "Develop pincer grasp",
      "Enhance bilateral coordination",
      "Increase hand endurance"
    ],
    difficulty: "easy",
    setting: "both"
  },
  {
    id: "2", 
    title: "Letter Formation Practice",
    description: "Multi-sensory approach to learning letter formation and handwriting skills",
    category: "Handwriting",
    ageRange: "5-10 years",
    duration: "15-20 minutes",
    materials: ["Sand tray", "Finger paints", "Large paper", "Chalk", "Textured materials"],
    instructions: [
      "Practice letters in sand tray using index finger",
      "Paint letters with finger paints on large paper",
      "Trace letters in the air with big arm movements",
      "Draw letters on textured surfaces",
      "Practice on chalkboard with chalk"
    ],
    modifications: [
      "Start with larger letter sizes",
      "Use guided hand-over-hand support",
      "Focus on one letter at a time",
      "Add verbal cues while tracing"
    ],
    goals: [
      "Improve letter formation",
      "Develop muscle memory for writing",
      "Enhance visual-motor coordination",
      "Build handwriting confidence"
    ],
    difficulty: "medium",
    setting: "both"
  },
  {
    id: "3",
    title: "Sensory Obstacle Course",
    description: "Movement-based activity to address sensory processing and gross motor skills",
    category: "Sensory Processing",
    ageRange: "4-12 years", 
    duration: "20-30 minutes",
    materials: ["Cushions", "Textured mats", "Tunnel or blankets", "Balance beam or tape line", "Weighted items"],
    instructions: [
      "Crawl through tunnel for proprioceptive input",
      "Walk on different textured surfaces",
      "Balance walk on beam or tape line",
      "Carry weighted items from point A to B",
      "Jump on cushions for vestibular input"
    ],
    modifications: [
      "Reduce stations for shorter attention spans",
      "Add music for auditory processing",
      "Use visual schedules to show sequence",
      "Allow breaks between stations"
    ],
    goals: [
      "Improve sensory regulation",
      "Develop gross motor coordination",
      "Enhance body awareness",
      "Build motor planning skills"
    ],
    difficulty: "medium",
    setting: "both"
  }
];

export default function OTActivityRecommender() {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedSetting, setSelectedSetting] = useState<string>("both");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [recommendations, setRecommendations] = useState<Activity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const generateRecommendations = () => {
    setIsGenerating(true);
    
    // Simulate AI generation (in real app, this would call the AI service)
    setTimeout(() => {
      let filtered = sampleActivities;
      
      if (selectedSkills.length > 0) {
        filtered = filtered.filter(activity => 
          selectedSkills.some(skill => activity.category.includes(skill))
        );
      }
      
      if (selectedAge) {
        // Simple age matching logic
        filtered = filtered.filter(activity => 
          activity.ageRange.includes(selectedAge.split('-')[0])
        );
      }
      
      if (selectedSetting !== "both") {
        filtered = filtered.filter(activity => 
          activity.setting === selectedSetting || activity.setting === "both"
        );
      }
      
      if (difficulty) {
        filtered = filtered.filter(activity => activity.difficulty === difficulty);
      }
      
      setRecommendations(filtered);
      setIsGenerating(false);
    }, 2000);
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSettingIcon = (setting: string) => {
    switch(setting) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'school': return <School className="h-4 w-4" />;
      case 'both': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-lime-100 dark:bg-lime-900">
            <Target className="h-8 w-8 text-lime-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">OT Activity Recommender</h1>
            <p className="text-muted-foreground">Get personalized occupational therapy activities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Preferences</CardTitle>
                <CardDescription>Customize activities for your child's needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Selection */}
                <div className="space-y-2">
                  <Label>Select Student</Label>
                  <StudentSelector 
                    selectedStudent={selectedStudent} 
                    onStudentSelect={setSelectedStudent}
                  />
                </div>

                {/* Skill Areas */}
                <div className="space-y-3">
                  <Label>Target Skill Areas</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {skillAreas.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox 
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label htmlFor={skill} className="text-sm font-normal cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Select value={selectedAge} onValueChange={setSelectedAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map((age) => (
                        <SelectItem key={age} value={age}>{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Setting */}
                <div className="space-y-2">
                  <Label>Activity Setting</Label>
                  <Select value={selectedSetting} onValueChange={setSelectedSetting}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Home & School</SelectItem>
                      <SelectItem value="home">Home Only</SelectItem>
                      <SelectItem value="school">School Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateRecommendations}
                  disabled={!selectedStudent || selectedSkills.length === 0 || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Activities Panel */}
          <div className="lg:col-span-2">
            {recommendations.length === 0 && !isGenerating ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Get Started</h3>
                  <p className="text-gray-500 mb-4">
                    Select your preferences and click "Get Recommendations" to see personalized OT activities
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Evidence-based</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Age-appropriate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Goal-focused</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {isGenerating && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">Generating Personalized Activities</h3>
                      <p className="text-gray-600">Analyzing your child's needs...</p>
                    </CardContent>
                  </Card>
                )}

                {recommendations.map((activity) => (
                  <Card key={activity.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{activity.title}</CardTitle>
                          <CardDescription className="mt-1">{activity.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getDifficultyColor(activity.difficulty)}>
                            {activity.difficulty}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getSettingIcon(activity.setting)}
                            {activity.setting}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {activity.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {activity.ageRange}
                        </div>
                        <Badge variant="secondary">{activity.category}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Materials */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Materials Needed
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.materials.map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Instructions
                        </h4>
                        <ol className="space-y-1 text-sm">
                          {activity.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center mt-0.5">
                                {index + 1}
                              </span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Goals */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Therapeutic Goals
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activity.goals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span>{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Modifications */}
                      {activity.modifications.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Modifications & Adaptations
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {activity.modifications.map((mod, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{mod}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {recommendations.length > 0 && (
                  <Card className="bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold mb-2">Need More Activities?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Adjust your preferences and generate new recommendations
                      </p>
                      <Button onClick={generateRecommendations} disabled={isGenerating}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate More Activities
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}