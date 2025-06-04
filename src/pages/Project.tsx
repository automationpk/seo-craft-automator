
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, TrendingUp, Search, Shield, Bot, Link, Play, Loader2, Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

interface ProjectTool {
  id: string;
  tool_id: string;
  selected_at: string;
}

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [projectTools, setProjectTools] = useState<ProjectTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const allTools = [
    {
      id: "before-after-generator",
      title: "Before-After Article Generator",
      description: "Generate engaging before/after comparison articles for your SEO blog",
      icon: <FileText className="h-6 w-6" />,
      popular: true
    },
    {
      id: "top-10-generator", 
      title: "TOP 10 Article Generator", 
      description: "Create viral listicle articles to boost website traffic",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      id: "page-optimizer",
      title: "Page Optimizer",
      description: "Optimize landing page titles, headers, and meta descriptions",
      icon: <Search className="h-6 w-6" />
    },
    {
      id: "privacy-policy-generator",
      title: "Privacy Policy Generator",
      description: "Generate custom privacy policies for your business",
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: "technical-seo-analyzer",
      title: "Technical SEO Analyzer",
      description: "Comprehensive on-site SEO analysis and recommendations",
      icon: <Bot className="h-6 w-6" />
    },
    {
      id: "link-building-tracker",
      title: "Link Building Tracker",
      description: "Track and discover new link-building opportunities",
      icon: <Link className="h-6 w-6" />
    }
  ];

  useEffect(() => {
    fetchProject();
    fetchProjectTools();
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

  const fetchProjectTools = async () => {
    try {
      const { data, error } = await supabase
        .from('project_tools')
        .select('*')
        .eq('project_id', id);

      if (error) throw error;
      setProjectTools(data || []);
      setSelectedTools((data || []).map(pt => pt.tool_id));
    } catch (error) {
      console.error('Error fetching project tools:', error);
    }
  };

  const handleToolSelection = async () => {
    try {
      // Remove deselected tools
      const toolsToRemove = projectTools.filter(pt => !selectedTools.includes(pt.tool_id));
      if (toolsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('project_tools')
          .delete()
          .in('id', toolsToRemove.map(t => t.id));
        
        if (deleteError) throw deleteError;
      }

      // Add newly selected tools
      const existingToolIds = projectTools.map(pt => pt.tool_id);
      const toolsToAdd = selectedTools.filter(toolId => !existingToolIds.includes(toolId));
      if (toolsToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('project_tools')
          .insert(toolsToAdd.map(toolId => ({
            project_id: id,
            tool_id: toolId
          })));
        
        if (insertError) throw insertError;
      }

      await fetchProjectTools();
      setShowToolSelector(false);
      toast({
        title: "Success",
        description: "Project tools updated successfully",
      });
    } catch (error) {
      console.error('Error updating project tools:', error);
      toast({
        title: "Error",
        description: "Failed to update project tools",
        variant: "destructive",
      });
    }
  };

  const handleToolClick = (tool: any) => {
    navigate(`/project/${id}/tool/${tool.id}`);
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

  const projectToolsData = allTools.filter(tool => 
    projectTools.some(pt => pt.tool_id === tool.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project?.name}</h1>
                <p className="text-sm text-gray-600">Created on {project && new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Dialog open={showToolSelector} onOpenChange={setShowToolSelector}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Tools
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select Tools for Project</DialogTitle>
                  <DialogDescription>
                    Choose which tools you want to use in this project
                  </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4 py-4">
                  {allTools.map((tool) => (
                    <div key={tool.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={tool.id}
                        checked={selectedTools.includes(tool.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTools([...selectedTools, tool.id]);
                          } else {
                            setSelectedTools(selectedTools.filter(id => id !== tool.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {tool.icon}
                          <label htmlFor={tool.id} className="text-sm font-medium cursor-pointer">
                            {tool.title}
                          </label>
                        </div>
                        <p className="text-xs text-gray-600">{tool.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowToolSelector(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleToolSelection}>
                    Update Tools
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projectToolsData.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Plus className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tools Selected</h2>
            <p className="text-gray-600 mb-6">
              Select tools to get started with your SEO automation project
            </p>
            <Button onClick={() => setShowToolSelector(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tools
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Tools</h2>
              <p className="text-gray-600">
                Your selected SEO automation tools for this project
              </p>
            </div>

            {/* Tools Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectToolsData.map((tool) => (
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
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Use Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Project;
