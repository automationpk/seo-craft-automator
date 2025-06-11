
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, FolderOpen, Wrench, MessageSquare, Trash2, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminDashboard = () => {
  const { admin, signOut } = useAdminAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [toolsUsed, setToolsUsed] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch projects with user count
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch tools used with project info
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools_used')
        .select(`
          *,
          projects (name, user_id)
        `)
        .order('created_at', { ascending: false });

      // Fetch feedback with tool and project info
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          *,
          tools_used (
            tool_type,
            projects (name, user_id)
          )
        `)
        .order('submitted_at', { ascending: false });

      if (projectsError) throw projectsError;
      if (toolsError) throw toolsError;
      if (feedbackError) throw feedbackError;

      setProjects(projectsData || []);
      setToolsUsed(toolsData || []);
      setFeedback(feedbackData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const deleteTool = async (toolId: string) => {
    try {
      const { error } = await supabase
        .from('tools_used')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tool record deleted successfully',
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tool record',
        variant: 'destructive',
      });
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feedback deleted successfully',
      });
      fetchAllData();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feedback',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      processing: 'bg-yellow-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
    };
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}>
        {status}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {admin?.full_name}</p>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tools Used</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toolsUsed.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedback.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedback.length > 0 
                  ? (feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length).toFixed(1)
                  : '0'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tools">Tools Used</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>Manage all user projects</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project: any) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.user_id}</TableCell>
                        <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this project? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProject(project.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Tools Used</CardTitle>
                <CardDescription>All tool usage records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Type</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toolsUsed.map((tool: any) => (
                      <TableRow key={tool.id}>
                        <TableCell className="font-medium">{tool.tool_type}</TableCell>
                        <TableCell>{tool.projects?.name || 'Unknown'}</TableCell>
                        <TableCell>{getStatusBadge(tool.status)}</TableCell>
                        <TableCell>{new Date(tool.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tool Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this tool usage record?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTool(tool.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>User Feedback</CardTitle>
                <CardDescription>All feedback submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Type</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedback.map((fb: any) => (
                      <TableRow key={fb.id}>
                        <TableCell>{fb.tools_used?.tool_type || 'Unknown'}</TableCell>
                        <TableCell>
                          <span className="text-yellow-500">{getRatingStars(fb.rating)}</span>
                          <span className="ml-2">({fb.rating}/5)</span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {fb.text_comment || 'No comment'}
                        </TableCell>
                        <TableCell>{new Date(fb.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this feedback?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteFeedback(fb.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
