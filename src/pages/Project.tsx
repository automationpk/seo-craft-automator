
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, TrendingUp, Search, Shield, Bot, Link, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    {
      id: "before-after-generator",
      title: "Before-After Article Generator",
      description: "Generate engaging before/after comparison articles for your SEO blog",
      icon: <FileText className="h-6 w-6" />,
      status: "Available",
      popular: true
    },
    {
      id: "top-10-generator", 
      title: "TOP 10 Article Generator", 
      description: "Create viral listicle articles to boost website traffic",
      icon: <TrendingUp className="h-6 w-6" />,
      status: "Coming Soon"
    },
    {
      id: "page-optimizer",
      title: "Page Optimizer",
      description: "Optimize landing page titles, headers, and meta descriptions",
      icon: <Search className="h-6 w-6" />,
      status: "Coming Soon"
    },
    {
      id: "privacy-policy-generator",
      title: "Privacy Policy Generator",
      description: "Generate custom privacy policies for your business",
      icon: <Shield className="h-6 w-6" />,
      status: "Coming Soon"
    },
    {
      id: "technical-seo-analyzer",
      title: "Technical SEO Analyzer",
      description: "Comprehensive on-site SEO analysis and recommendations",
      icon: <Bot className="h-6 w-6" />,
      status: "Coming Soon"
    },
    {
      id: "link-building-tracker",
      title: "Link Building Tracker",
      description: "Track and discover new link-building opportunities",
      icon: <Link className="h-6 w-6" />,
      status: "Coming Soon"
    }
  ];

  const handleToolClick = (tool: any) => {
    if (tool.status === "Available") {
      navigate(`/project/${id}/tool/${tool.id}`);
    } else {
      toast({
        title: "Coming Soon",
        description: `${tool.title} will be available soon!`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Project Not Found</h2>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600">Created on {new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a Tool</h2>
          <p className="text-gray-600">
            Choose from our collection of SEO automation tools to enhance your project
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card 
              key={tool.id}
              className={`transition-all duration-300 cursor-pointer hover:shadow-xl border-2 hover:border-blue-200 ${
                tool.popular ? 'ring-2 ring-blue-100' : ''
              }`}
              onClick={() => handleToolClick(tool)}
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
                  <Badge 
                    variant={tool.status === "Available" ? "default" : "secondary"}
                    className={tool.status === "Available" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {tool.status}
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
                  variant={tool.status === "Available" ? "default" : "secondary"}
                  disabled={tool.status !== "Available"}
                >
                  {tool.status === "Available" ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Use Tool
                    </>
                  ) : (
                    "Coming Soon"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Project;
