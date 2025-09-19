import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Users, BookOpen, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            My IEP Hero
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empowering parents with AI-powered IEP analysis, expert advocates, and comprehensive support tools for special education success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/auth')}
              data-testid="button-get-started"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <FileText className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">AI IEP Analysis</h3>
            <p className="text-gray-600 text-sm">Upload IEPs and get instant, expert-level insights.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Advocate Matching</h3>
            <p className="text-gray-600 text-sm">Connect with certified special education advocates.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BookOpen className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Meeting Preparation</h3>
            <p className="text-gray-600 text-sm">Comprehensive tools for IEP meeting preparation.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Heart className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Special Needs Resources</h3>
            <p className="text-gray-600 text-sm">Specialized tools for autism, ADHD, gifted/2e.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your IEP Experience?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of parents who have found success with My IEP Hero.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/auth')}
            data-testid="button-start-journey"
          >
            Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;