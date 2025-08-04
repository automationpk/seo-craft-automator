import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";

interface ProjectSetupDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectSetupDialog = ({ open, onClose, projectId }: ProjectSetupDialogProps) => {
  const [websiteName, setWebsiteName] = useState("");
  const [targetedRegion, setTargetedRegion] = useState("");
  const { setWebsiteName: setProjectWebsiteName, setTargetedRegion: setProjectTargetedRegion, setProjectId } = useProject();
  const { toast } = useToast();

  const regions = [
    "United States",
    "Canada", 
    "United Kingdom",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Australia",
    "Japan",
    "Brazil",
    "India",
    "Other"
  ];

  const handleSave = () => {
    if (!websiteName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website name",
        variant: "destructive",
      });
      return;
    }

    if (!targetedRegion) {
      toast({
        title: "Error", 
        description: "Please select a targeted region",
        variant: "destructive",
      });
      return;
    }

    // Set project ID first, then set the data
    setProjectId(projectId);
    setProjectWebsiteName(websiteName.trim());
    setProjectTargetedRegion(targetedRegion);

    toast({
      title: "Project Setup Complete",
      description: "Your project information has been saved and will be auto-filled in tools.",
    });

    onClose();
  };

  const handleSkip = () => {
    setProjectId(projectId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Setup Your Project</DialogTitle>
          <DialogDescription>
            Provide some basic information about your project. This will be automatically filled in relevant tools to save you time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="websiteName">Website Name</Label>
            <Input
              id="websiteName"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              placeholder="e.g., example.com or My Business"
            />
            <p className="text-sm text-muted-foreground">
              This will be auto-filled in tools that require a website name
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="targetedRegion">Targeted Region</Label>
            <Select value={targetedRegion} onValueChange={setTargetedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select your target region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This will be auto-filled in tools that require regional targeting
            </p>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={handleSave}>
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSetupDialog;