import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, FileText, Search, Shield, Link, TrendingUp, Users, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);

  const tools = [
    {
      title: "Before-After Article Generator",
      description: "Generate engaging before/after comparison articles for your SEO blog",
      icon: <FileText className="h-6 w-6" />,
      status: "Available",
      popular: true
    },
    {
      title: "TOP 10 Article Generator", 
      description: "Create viral listicle articles to boost website traffic",
      icon: <TrendingUp className="h-6 w-6" />,
      status: "Available"
    },
    {
      title: "Page Optimizer",
      description: "Optimize landing page titles, headers, and meta descriptions",
      icon: <Search className="h-6 w-6" />,
      status: "Available"
    },
    {
      title: "Privacy Policy Generator",
      description: "Generate custom privacy policies for your business",
      icon: <Shield className="h-6 w-6" />,
      status: "Available"
    },
    {
      title: "Technical SEO Analyzer",
      description: "Comprehensive on-site SEO analysis and recommendations",
      icon: <Bot className="h-6 w-6" />,
      status: "Available"
    },
    {
      title: "Link Building Tracker",
      description: "Track and discover new link-building opportunities",
      icon: <Link className="h-6 w-6" />,
      status: "Available"
    }
  ];

  const features = [
    "No-code SEO automation",
    "Multiple project management", 
    "AI-powered content generation",
    "Downloadable results",
    "Technical SEO analysis",
    "Link building tools"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SEO Toolkit
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Star className="h-3 w-3 mr-1" />
            Trusted by 1000+ marketers
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Automate Your 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> SEO Tasks</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A no-code platform designed for marketers and startups to automate SEO workflows, 
            generate content, and optimize websites without technical expertise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              View Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful SEO Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to automate your SEO workflow and grow your organic traffic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Card 
                key={index}
                className={`transition-all duration-300 cursor-pointer hover:shadow-xl border-2 ${
                  hoveredTool === index ? 'border-blue-200 shadow-lg' : 'border-gray-100'
                } ${tool.popular ? 'ring-2 ring-blue-100' : ''}`}
                onMouseEnter={() => setHoveredTool(index)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                        {tool.icon}
                      </div>
                      {tool.popular && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Available
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/signup')}
                  >
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Automate Your SEO?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of marketers who are already using our platform to scale their SEO efforts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/signup')}
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2 text-blue-100">
                <Users className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SEO Toolkit</span>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering marketers and startups with automated SEO solutions
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
