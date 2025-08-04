
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, LogOut, Settings, FolderOpen, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import ProjectSetupDialog from "@/components/ProjectSetupDialog";

interface Project {
  id: string;
  name: string;
  created_at: string;
  tools_used?: number;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupProjectId, setSetupProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          created_at,
          tools_used:tools_used(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithCounts = data?.map(project => ({
        ...project,
        tools_used: project.tools_used?.[0]?.count || 0,
        status: 'active'
      })) || [];

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  const handleProjectSetupNeeded = (projectId: string) => {
    setSetupProjectId(projectId);
  };

  const handleSetupComplete = () => {
    setSetupProjectId(null);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
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
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your SEO Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your SEO projects and access powerful automation tools
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{projects.length}</div>
              <p className="text-gray-600 text-sm">Active SEO projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Tools Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {projects.reduce((acc, project) => acc + (project.tools_used || 0), 0)}
              </div>
              <p className="text-gray-600 text-sm">Total tool executions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {projects.filter(p => 
                  new Date(p.created_at).getMonth() === new Date().getMonth()
                ).length}
              </div>
              <p className="text-gray-600 text-sm">Projects created</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
          <CreateProjectDialog 
            onProjectCreated={handleProjectCreated}
            onProjectSetupNeeded={handleProjectSetupNeeded}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          />
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first SEO project to get started with our automation tools
              </p>
              <CreateProjectDialog 
                onProjectCreated={handleProjectCreated}
                onProjectSetupNeeded={handleProjectSetupNeeded}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <CardDescription className="mt-2">
                        Created on {new Date(project.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={project.status === "active" ? "default" : "secondary"}
                        className={project.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{project.tools_used} tools used</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Open Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Project Setup Dialog */}
      {setupProjectId && (
        <ProjectSetupDialog
          open={true}
          onClose={handleSetupComplete}
          projectId={setupProjectId}
        />
      )}
    </div>
  );
};

export default Dashboard;
