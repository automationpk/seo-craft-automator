
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreateProjectDialogProps {
  onProjectCreated: (project: any) => void;
  onProjectSetupNeeded?: (projectId: string) => void;
  className?: string;
}

const CreateProjectDialog = ({ onProjectCreated, onProjectSetupNeeded, className }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          name: projectName.trim(),
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newProject = {
        ...data,
        tools_used: 0,
        status: 'active'
      };

      onProjectCreated(newProject);
      toast({
        title: "Project Created",
        description: `${projectName} has been created successfully.`,
      });
      
      setOpen(false);
      setProjectName("");
      
      // Trigger project setup dialog
      if (onProjectSetupNeeded) {
        onProjectSetupNeeded(data.id);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter a name for your new SEO project. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., My Website SEO"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCreating) {
                  handleCreate();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleCreate}
            disabled={isCreating || !projectName.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
