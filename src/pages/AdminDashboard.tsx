import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, FolderOpen, Wrench, MessageSquare, Trash2, Plus, RefreshCw } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminDashboard = () => {
  const { admin, signOut } = useAdminAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [toolsUsed, setToolsUsed] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState('');
  const [newItem, setNewItem] = useState({
    projectName: '',
    projectUserId: '',
    toolType: '',
    toolProjectId: '',
    toolStatus: 'processing',
    feedbackRating: 1,
    feedbackComment: '',
    feedbackToolId: ''
  });

  useEffect(() => {
    if (admin) {
      fetchAllData();
    }
  }, [admin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('=== STARTING DATA FETCH ===');
      console.log('Admin user:', admin);

      // Fetch projects with simple query first
      console.log('Fetching projects...');
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Projects result:', { data: projectsData, error: projectsError });

      // Fetch tools used with simple query
      console.log('Fetching tools used...');
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools_used')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Tools result:', { data: toolsData, error: toolsError });

      // Fetch feedback with simple query
      console.log('Fetching feedback...');
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('submitted_at', { ascending: false });

      console.log('Feedback result:', { data: feedbackData, error: feedbackError });

      // Set data regardless of errors
      setProjects(projectsData || []);
      setToolsUsed(toolsData || []);
      setFeedback(feedbackData || []);

      console.log('=== FINAL COUNTS ===');
      console.log('Projects:', (projectsData || []).length);
      console.log('Tools:', (toolsData || []).length);
      console.log('Feedback:', (feedbackData || []).length);

      if (projectsError || toolsError || feedbackError) {
        console.error('Errors occurred:', { projectsError, toolsError, feedbackError });
        toast({
          title: 'Partial Error',
          description: 'Some data could not be fetched. Check console for details.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Dashboard data loaded successfully',
        });
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch data: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    try {
      console.log('Creating test data...');
      
      // Create a test project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: 'Test Project ' + Date.now(),
          user_id: 'test-user-' + Date.now()
        }])
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw projectError;
      }

      console.log('Created project:', projectData);

      // Create a test tool
      const { data: toolData, error: toolError } = await supabase
        .from('tools_used')
        .insert([{
          tool_type: 'test_tool',
          project_id: projectData.id,
          status: 'completed',
          inputs: { test: 'data' }
        }])
        .select()
        .single();

      if (toolError) {
        console.error('Tool creation error:', toolError);
        throw toolError;
      }

      console.log('Created tool:', toolData);

      // Create test feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .insert([{
          tool_id: toolData.id,
          rating: 5,
          text_comment: 'Test feedback'
        }])
        .select()
        .single();

      if (feedbackError) {
        console.error('Feedback creation error:', feedbackError);
        throw feedbackError;
      }

      console.log('Created feedback:', feedbackData);

      toast({
        title: 'Success',
        description: 'Test data created successfully',
      });

      // Refresh data
      fetchAllData();
    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: 'Error',
        description: `Failed to create test data: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const createProject = async () => {
    try {
      if (!newItem.projectName || !newItem.projectUserId) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newItem.projectName,
          user_id: newItem.projectUserId
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      setCreateDialogOpen('');
      setNewItem({ ...newItem, projectName: '', projectUserId: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: `Failed to create project: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const createTool = async () => {
    try {
      if (!newItem.toolType || !newItem.toolProjectId) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('tools_used')
        .insert([{
          tool_type: newItem.toolType,
          project_id: newItem.toolProjectId,
          status: newItem.toolStatus,
          inputs: {}
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tool record created successfully',
      });
      setCreateDialogOpen('');
      setNewItem({ ...newItem, toolType: '', toolProjectId: '', toolStatus: 'processing' });
      fetchAllData();
    } catch (error) {
      console.error('Error creating tool:', error);
      toast({
        title: 'Error',
        description: `Failed to create tool record: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const createFeedback = async () => {
    try {
      if (!newItem.feedbackToolId || !newItem.feedbackRating) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          tool_id: newItem.feedbackToolId,
          rating: newItem.feedbackRating,
          text_comment: newItem.feedbackComment || null
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feedback created successfully',
      });
      setCreateDialogOpen('');
      setNewItem({ ...newItem, feedbackToolId: '', feedbackComment: '', feedbackRating: 1 });
      fetchAllData();
    } catch (error) {
      console.error('Error creating feedback:', error);
      toast({
        title: 'Error',
        description: `Failed to create feedback: ${error.message}`,
        variant: 'destructive',
      });
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
          <div className="flex gap-2">
            <Button onClick={createTestData} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Test Data
            </Button>
            <Button onClick={fetchAllData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Projects in state:</strong> {projects.length}
                <br />
                <strong>Raw data:</strong> {JSON.stringify(projects.slice(0, 1), null, 2)}
              </div>
              <div>
                <strong>Tools in state:</strong> {toolsUsed.length}
                <br />
                <strong>Raw data:</strong> {JSON.stringify(toolsUsed.slice(0, 1), null, 2)}
              </div>
              <div>
                <strong>Feedback in state:</strong> {feedback.length}
                <br />
                <strong>Raw data:</strong> {JSON.stringify(feedback.slice(0, 1), null, 2)}
              </div>
            </div>
            <p className="mt-4 text-yellow-700">
              If all counts are 0 and you see empty arrays above, the database tables are empty. 
              Click "Create Test Data" to add sample data for testing.
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                Active projects in system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tools Used</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toolsUsed.length}</div>
              <p className="text-xs text-muted-foreground">
                Total tool executions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedback.length}</div>
              <p className="text-xs text-muted-foreground">
                User feedback entries
              </p>
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
              <p className="text-xs text-muted-foreground">
                Average user rating
              </p>
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>Manage all user projects</CardDescription>
                  </div>
                  <Dialog open={createDialogOpen === 'project'} onOpenChange={(open) => setCreateDialogOpen(open ? 'project' : '')}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>Add a new project to the system</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="projectName">Project Name</Label>
                          <Input
                            id="projectName"
                            value={newItem.projectName}
                            onChange={(e) => setNewItem({ ...newItem, projectName: e.target.value })}
                            placeholder="Enter project name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="projectUserId">User ID</Label>
                          <Input
                            id="projectUserId"
                            value={newItem.projectUserId}
                            onChange={(e) => setNewItem({ ...newItem, projectUserId: e.target.value })}
                            placeholder="Enter user UUID (e.g., demo-user-123)"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen('')}>Cancel</Button>
                        <Button onClick={createProject}>Create Project</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
                    {projects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No projects found. Click "Create Test Data" or "Create Project" to add data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project: any) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell className="font-mono text-sm">{project.user_id}</TableCell>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tools Used</CardTitle>
                    <CardDescription>All tool usage records</CardDescription>
                  </div>
                  <Dialog open={createDialogOpen === 'tool'} onOpenChange={(open) => setCreateDialogOpen(open ? 'tool' : '')}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Tool Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Tool Record</DialogTitle>
                        <DialogDescription>Add a new tool usage record</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="toolType">Tool Type</Label>
                          <Input
                            id="toolType"
                            value={newItem.toolType}
                            onChange={(e) => setNewItem({ ...newItem, toolType: e.target.value })}
                            placeholder="e.g., keyword_research, competitor_analysis"
                          />
                        </div>
                        <div>
                          <Label htmlFor="toolProjectId">Project</Label>
                          <Select value={newItem.toolProjectId} onValueChange={(value) => setNewItem({ ...newItem, toolProjectId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map((project: any) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="toolStatus">Status</Label>
                          <Select value={newItem.toolStatus} onValueChange={(value) => setNewItem({ ...newItem, toolStatus: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen('')}>Cancel</Button>
                        <Button onClick={createTool}>Create Tool Record</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Type</TableHead>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toolsUsed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No tool usage records found. Click "Create Test Data" or "Create Tool Record" to add data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      toolsUsed.map((tool: any) => (
                        <TableRow key={tool.id}>
                          <TableCell className="font-medium">{tool.tool_type}</TableCell>
                          <TableCell className="font-mono text-sm">{tool.project_id}</TableCell>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Feedback</CardTitle>
                    <CardDescription>All feedback submissions</CardDescription>
                  </div>
                  <Dialog open={createDialogOpen === 'feedback'} onOpenChange={(open) => setCreateDialogOpen(open ? 'feedback' : '')}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Feedback</DialogTitle>
                        <DialogDescription>Add feedback for a tool</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="feedbackToolId">Tool</Label>
                          <Select value={newItem.feedbackToolId} onValueChange={(value) => setNewItem({ ...newItem, feedbackToolId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tool" />
                            </SelectTrigger>
                            <SelectContent>
                              {toolsUsed.map((tool: any) => (
                                <SelectItem key={tool.id} value={tool.id}>
                                  {tool.tool_type} - {tool.project_id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="feedbackRating">Rating</Label>
                          <Select value={newItem.feedbackRating.toString()} onValueChange={(value) => setNewItem({ ...newItem, feedbackRating: parseInt(value) })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(rating => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  {rating} Star{rating > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="feedbackComment">Comment (Optional)</Label>
                          <Textarea
                            id="feedbackComment"
                            value={newItem.feedbackComment}
                            onChange={(e) => setNewItem({ ...newItem, feedbackComment: e.target.value })}
                            placeholder="Enter feedback comment"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen('')}>Cancel</Button>
                        <Button onClick={createFeedback}>Create Feedback</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool ID</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedback.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No feedback found. Click "Create Test Data" or "Create Feedback" to add data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      feedback.map((fb: any) => (
                        <TableRow key={fb.id}>
                          <TableCell className="font-mono text-sm">{fb.tool_id}</TableCell>
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
                      ))
                    )}
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
