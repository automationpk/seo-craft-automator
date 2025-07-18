import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Loader2, Download, Star, TrendingUp, Search, Shield, Bot, Link, Clock, ChevronDown, ChevronUp, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const Tool = () => {
  const { id: projectId, toolId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setProjectId, targetedRegion, setTargetedRegion } = useProject();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toolSubmissionId, setToolSubmissionId] = useState<string | null>(null);
  const [toolSubmission, setToolSubmission] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ""
  });
  const [previousSubmissions, setPreviousSubmissions] = useState<any[]>([]);
  const [expandedHistory, setExpandedHistory] = useState(false);

  const toolsConfig = {
    "before-after-generator": {
      title: "Before-After Article Generator",
      description: "Generate weekly SEO blog content based on product/service",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "businessModel", label: "Business Model", type: "textarea", placeholder: "Describe your business model", required: true },
        { id: "productService", label: "Product/Service", type: "textarea", placeholder: "Describe your product or service", required: true },
        { id: "targetedRegion", label: "Targeted Region", type: "input", placeholder: "e.g., United States, Europe, Global", required: true },
        { id: "businessType", label: "B2B or B2C", type: "select", options: [
          { value: "b2b", label: "B2B (Business to Business)" },
          { value: "b2c", label: "B2C (Business to Consumer)" }
        ], required: true },
        { id: "targetedAudience", label: "Targeted Audience", type: "textarea", placeholder: "Describe your target audience in detail", required: true },
        { id: "keywords", label: "Keywords", type: "textarea", placeholder: "Enter your target keywords (comma-separated)", required: true },
        { id: "websiteName", label: "Website Name", type: "input", placeholder: "Your website name", required: true }
      ],
      resultTitle: "Before-After Article Generated Successfully!",
      resultDescription: "Your before-after comparison article is ready for download",
      resultPreview: "Before vs After: How {websiteName} Transformed {targetedAudience}"
    },
    "top-10-generator": {
      title: "TOP 10 Article Generator",
      description: "Create listicle articles for increasing website traffic",
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "businessModel", label: "Business Model", type: "textarea", placeholder: "Describe your business model", required: true },
        { id: "productService", label: "Product/Service", type: "textarea", placeholder: "Describe your product or service", required: true },
        { id: "targetedRegion", label: "Targeted Region", type: "input", placeholder: "e.g., United States, Europe, Global", required: true },
        { id: "businessType", label: "B2B or B2C", type: "select", options: [
          { value: "b2b", label: "B2B (Business to Business)" },
          { value: "b2c", label: "B2C (Business to Consumer)" }
        ], required: true },
        { id: "targetedAudience", label: "Targeted Audience", type: "textarea", placeholder: "Describe your target audience in detail", required: true },
        { id: "keywords", label: "Keywords", type: "textarea", placeholder: "Enter your target keywords (comma-separated)", required: true },
        { id: "websiteName", label: "Website Name", type: "input", placeholder: "Your website name", required: true }
      ],
      resultTitle: "TOP 10 Article Generated Successfully!",
      resultDescription: "Your listicle article is ready for download",
      resultPreview: "TOP 10 {productService} for {targetedAudience} in {targetedRegion}"
    },
    "page-optimizer": {
      title: "Page on Page Optimizer",
      description: "Create landing page content like title, headers, and meta",
      icon: <Search className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "keywords", label: "Keywords", type: "textarea", placeholder: "Enter your target keywords (comma-separated)", required: true },
        { id: "searchVolume", label: "Search Volume", type: "input", placeholder: "Monthly search volume for main keyword", required: true },
        { id: "userIntentions", label: "User Intentions", type: "textarea", placeholder: "Describe what users are looking for when searching", required: true },
        { id: "landingPageUrl", label: "Landing Page URL", type: "input", placeholder: "https://example.com/landing-page", required: true },
        { id: "targetedRegion", label: "Targeted Region", type: "input", placeholder: "e.g., United States, Europe, Global", required: true }
      ],
      resultTitle: "Page Optimization Complete!",
      resultDescription: "Your optimized page elements are ready",
      resultPreview: "Optimized content for {landingPageUrl} targeting '{keywords}' in {targetedRegion}"
    },
    "privacy-policy-generator": {
      title: "Privacy Policy Generator",
      description: "Generate custom privacy policy content",
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "businessName", label: "Business Name", type: "input", placeholder: "Your business name", required: true },
        { id: "businessType", label: "Business Type", type: "select", options: [
          { value: "ecommerce", label: "E-commerce" },
          { value: "saas", label: "SaaS/Software" },
          { value: "blog", label: "Blog/Content Site" },
          { value: "service", label: "Service Business" },
          { value: "nonprofit", label: "Non-profit" },
          { value: "other", label: "Other" }
        ], required: true },
        { id: "website", label: "Website", type: "input", placeholder: "https://yourwebsite.com", required: true },
        { id: "servicesOffered", label: "Services Offered", type: "textarea", placeholder: "Describe the services you offer", required: true },
        { id: "judiciaryLocation", label: "Targeted Region", type: "input", placeholder: "e.g., United States, European Union, United Kingdom, Canada", required: true }
      ],
      resultTitle: "Privacy Policy Generated Successfully!",
      resultDescription: "Your custom privacy policy is ready for download",
      resultPreview: "Complete privacy policy for {businessName} compliant with {judiciaryLocation} regulations"
    },
    "technical-seo-analyzer": {
      title: "Technical SEO Analyzer",
      description: "Analyze on-site SEO factors",
      icon: <Bot className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "businessName", label: "Business Name", type: "input", placeholder: "Your business name", required: true },
        { id: "businessAddress", label: "Business Address", type: "textarea", placeholder: "Your business address", required: true },
        { id: "businessPhone", label: "Business Phone Number", type: "input", placeholder: "Your business phone number", required: true },
        { id: "businessWebsite", label: "Business Website URL", type: "input", placeholder: "https://yourwebsite.com", required: true },
        { id: "targetedRegion", label: "Targeted Region", type: "input", placeholder: "e.g., United States, Europe, Global", required: true },
        { id: "relevantKeywords", label: "Relevant Keywords", type: "textarea", placeholder: "Keywords relevant to your business", required: true },
        { id: "otherDomains", label: "Other Domains", type: "textarea", placeholder: "Other domains you own (optional)", required: false },
        { id: "imageUrl", label: "Image URL", type: "input", placeholder: "URL of your business logo/image (optional)", required: false },
        { id: "title", label: "Title", type: "input", placeholder: "Current page title", required: false },
        { id: "description", label: "Description", type: "textarea", placeholder: "Current meta description", required: false },
        { id: "currentUrl", label: "Current URL", type: "input", placeholder: "Current page URL", required: false },
        { id: "changeUrl", label: "Change URL", type: "input", placeholder: "New URL if changing (optional)", required: false }
      ],
      resultTitle: "Technical SEO Analysis Complete!",
      resultDescription: "Your comprehensive SEO report is ready",
      resultPreview: "Technical SEO analysis and recommendations for {businessName} in {targetedRegion}"
    },
    "landing-page-optimizer": {
      title: "Landing Page Optimization Tool",
      description: "Optimize SEO for key landing pages",
      icon: <Search className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "businessName", label: "Business Name", type: "input", placeholder: "Your business name", required: true },
        { id: "targetedRegion", label: "Targeted Region", type: "input", placeholder: "e.g., United States, Europe, Global", required: true },
        { id: "website", label: "Website", type: "input", placeholder: "https://yourwebsite.com", required: true },
        { id: "landingPage", label: "Landing Page", type: "input", placeholder: "https://yourwebsite.com/landing-page", required: true },
        { id: "targetedKeywords", label: "Targeted Keywords", type: "textarea", placeholder: "Keywords to optimize for (comma-separated)", required: true }
      ],
      resultTitle: "Landing Page Optimization Complete!",
      resultDescription: "Your optimized landing page content is ready",
      resultPreview: "Optimized content for {landingPage} targeting {targetedKeywords}"
    },
    "link-building-tracker": {
      title: "Link Building Tracker",
      description: "Track link-building campaigns",
      icon: <Link className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "businessName", label: "Business Name", type: "input", placeholder: "Your business name", required: true },
        { id: "targetedLocation", label: "Targeted Region", type: "input", placeholder: "e.g., United States, Europe, Global", required: true },
        { id: "websiteUrl", label: "Website URL", type: "input", placeholder: "https://yourwebsite.com", required: true },
        { id: "category", label: "Category", type: "input", placeholder: "Your business category", required: true },
        { id: "goal", label: "Goal", type: "textarea", placeholder: "Describe your link building goals", required: true },
        { id: "keywords", label: "Keywords", type: "textarea", placeholder: "Enter your target keywords (comma-separated)", required: true }
      ],
      resultTitle: "Link Building Report Generated!",
      resultDescription: "Your link building opportunities are ready",
      resultPreview: "Link building opportunities and tracking for {businessName} in {targetedLocation}"
    }
  };

  const currentTool = toolsConfig[toolId as keyof typeof toolsConfig];

  useEffect(() => {
    // Set project context when component mounts
    if (projectId) {
      setProjectId(projectId);
    }
  }, [projectId, setProjectId]);

  useEffect(() => {
    if (currentTool) {
      const initialFormData: Record<string, string> = {};
      currentTool.fields.forEach(field => {
        initialFormData[field.id] = "";
      });
      
      // Auto-populate targeted region fields if available
      if (targetedRegion) {
        const targetedRegionFields = currentTool.fields.filter(field => 
          field.id.includes('targetedRegion') || 
          field.id.includes('judiciaryLocation') || 
          field.id.includes('targetedLocation')
        );
        
        targetedRegionFields.forEach(field => {
          initialFormData[field.id] = targetedRegion;
        });
      }
      
      setFormData(initialFormData);
    }
    fetchPreviousSubmissions();
  }, [toolId, targetedRegion]);

  const fetchPreviousSubmissions = async () => {
    if (!projectId || !toolId || !user) return;

    try {
      const { data, error } = await supabase
        .from('tools_used')
        .select(`
          *,
          feedback (
            id,
            rating,
            text_comment,
            submitted_at
          )
        `)
        .eq('project_id', projectId)
        .eq('tool_type', toolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching previous submissions:', error);
        return;
      }
      
      console.log('Fetched submissions:', data);
      setPreviousSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching previous submissions:', error);
    }
  };

  useEffect(() => {
    if (toolSubmissionId && isProcessing) {
      const interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('tools_used')
            .select('*')
            .eq('id', toolSubmissionId)
            .single();

          if (error) {
            console.error('Error checking tool status:', error);
            return;
          }

          console.log('Tool status check:', data);

          if (data.status === 'completed' || data.status === 'failed') {
            setIsProcessing(false);
            setToolSubmission(data);
            setShowResults(true);
            clearInterval(interval);

            if (data.status === 'completed') {
              toast({
                title: "Content Generated!",
                description: `Your ${currentTool.title.toLowerCase()} has been created successfully.`,
              });
            } else {
              toast({
                title: "Generation Failed",
                description: "There was an issue generating your content. Please try again.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error polling tool status:', error);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [toolSubmissionId, isProcessing, currentTool]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Save targeted region to project context if this is a targeted region field
    if ((field.includes('targetedRegion') || field.includes('judiciaryLocation') || field.includes('targetedLocation')) && value.trim()) {
      setTargetedRegion(value);
    }
  };

  const loadPreviousSubmission = (submission: any) => {
    if (submission.inputs) {
      setFormData(submission.inputs);
      toast({
        title: "Data Loaded",
        description: "Previous submission data has been loaded into the form.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to use this tool",
        variant: "destructive",
      });
      return;
    }

    if (!currentTool) {
      toast({
        title: "Error",
        description: "Tool configuration not found",
        variant: "destructive",
      });
      return;
    }

    const missingFields = currentTool.fields
      .filter(field => field.required && !formData[field.id]?.trim())
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Error", 
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Submitting tool with data:', formData);

      const { data, error } = await supabase
        .from('tools_used')
        .insert([{
          project_id: projectId,
          tool_type: toolId,
          inputs: formData,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setToolSubmissionId(data.id);
      console.log('Tool submission created:', data.id);

      const { error: makeError } = await supabase.functions.invoke('send-to-make', {
        body: { toolSubmissionId: data.id }
      });

      if (makeError) {
        console.error('Error sending to Make.com:', makeError);
        
        await supabase
          .from('tools_used')
          .update({ status: 'failed' })
          .eq('id', data.id);

        throw new Error('Failed to send data to processing service');
      }

      toast({
        title: "Processing Started",
        description: "Your content is being generated. This may take a few minutes.",
      });
      
    } catch (error) {
      console.error('Error submitting tool:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleDownload = (url: string, format: string) => {
    window.open(url, '_blank');
    toast({
      title: "Download Started",
      description: `Your ${format} file is being downloaded.`,
    });
  };

  const handleFeedbackSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback",
        variant: "destructive",
      });
      return;
    }

    if (feedback.rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!toolSubmissionId) {
      toast({
        title: "Error",
        description: "No tool submission found",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          tool_id: toolSubmissionId,
          rating: feedback.rating,
          text_comment: feedback.comment.trim() || null
        }]);

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      setFeedback({ rating: 0, comment: "" });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderFormField = (field: any) => {
    switch (field.type) {
      case "input":
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={3}
          />
        );
      case "select":
        return (
          <Select onValueChange={(value) => handleInputChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete submissions",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to delete submission:', submissionId);
      
      // Delete feedback first (due to foreign key constraints)
      const { error: feedbackError } = await supabase
        .from('feedback')
        .delete()
        .eq('tool_id', submissionId);
      
      if (feedbackError) {
        console.error('Error deleting feedback:', feedbackError);
        // Continue with deletion even if feedback deletion fails
      }

      // Delete the submission
      const { error: submissionError } = await supabase
        .from('tools_used')
        .delete()
        .eq('id', submissionId)
        .eq('project_id', projectId); // Extra security check
      
      if (submissionError) {
        console.error('Error deleting submission:', submissionError);
        throw submissionError;
      }

      console.log('Successfully deleted submission from database');

      // Update the frontend state immediately
      setPreviousSubmissions(prev => {
        const updated = prev.filter(submission => submission.id !== submissionId);
        console.log('Updated submissions list:', updated);
        return updated;
      });
      
      toast({
        title: "Submission Deleted",
        description: "The submission has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Error",
        description: "Failed to delete submission. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!currentTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Tool Not Available</h2>
            <p className="text-gray-600 mb-4">This tool is not selected for this project.</p>
            <Button onClick={() => navigate(`/project/${projectId}`)}>
              Back to Project
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
              onClick={() => navigate(`/project/${projectId}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            <div className="flex items-center space-x-3">
              {currentTool.icon}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentTool.title}</h1>
                <p className="text-sm text-gray-600">{currentTool.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Previous Submissions History */}
        {previousSubmissions.length > 0 && (
          <Card className="mb-6">
            <Collapsible open={expandedHistory} onOpenChange={setExpandedHistory}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Previous Submissions ({previousSubmissions.length})</CardTitle>
                    </div>
                    {expandedHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <CardDescription>
                    View and reuse your previous tool submissions
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {previousSubmissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {new Date(submission.created_at).toLocaleDateString()} at {new Date(submission.created_at).toLocaleTimeString()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                            submission.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => loadPreviousSubmission(submission)}
                          >
                            Load Data
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this submission? This action cannot be undone and will also delete any associated feedback.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteSubmission(submission.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {/* Show key inputs */}
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(submission.inputs || {}).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-2 rounded">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                            <span className="text-gray-700">{String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}</span>
                          </div>
                        ))}
                      </div>

                      {/* Download link if available */}
                      {submission.output_url && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => handleDownload(submission.output_url, 'Google Sheet')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Result
                          </Button>
                        </div>
                      )}

                      {/* Show feedback if exists */}
                      {submission.feedback && submission.feedback.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Previous Feedback:</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= submission.feedback[0].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-blue-700">({submission.feedback[0].rating}/5)</span>
                          </div>
                          {submission.feedback[0].text_comment && (
                            <p className="text-sm text-blue-700 bg-white p-2 rounded border border-blue-200">
                              "{submission.feedback[0].text_comment}"
                            </p>
                          )}
                          <p className="text-xs text-blue-600 mt-1">
                            Submitted on {new Date(submission.feedback[0].submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {!showResults ? (
          <Card>
            <CardHeader>
              <CardTitle>Tool Configuration</CardTitle>
              <CardDescription>
                Fill out the details below to generate your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {currentTool.fields.map((field) => (
                    <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                      <div className="space-y-2">
                        <Label htmlFor={field.id}>
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {renderFormField(field)}
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    "Generate Content"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  {currentTool.icon}
                  <span className="ml-2">{currentTool.resultTitle}</span>
                </CardTitle>
                <CardDescription>
                  {currentTool.resultDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Content Preview:</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    {currentTool.resultPreview.replace(/\{(\w+)\}/g, (match, key) => {
                      return formData[key] || match;
                    })}
                  </p>
                  <p className="text-gray-600 text-sm">
                    This content has been generated and optimized based on your specifications.
                  </p>
                </div>
                
                {toolSubmission?.output_url && (
                  <div className="flex gap-4">
                    <Button 
                      className="flex-1"
                      onClick={() => handleDownload(toolSubmission.output_url, 'Google Sheet')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Google Sheet
                    </Button>
                  </div>
                )}

                {!toolSubmission?.output_url && toolSubmission?.status === 'completed' && (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Content generated successfully but download link is not yet available.</p>
                  </div>
                )}

                {toolSubmission?.status === 'failed' && (
                  <div className="text-center py-4">
                    <p className="text-red-600">Content generation failed. Please try again.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowResults(false);
                        setToolSubmission(null);
                        setToolSubmissionId(null);
                        fetchPreviousSubmissions();
                      }}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Card */}
            {toolSubmission?.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate This Tool</CardTitle>
                  <CardDescription>
                    Help us improve by sharing your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Rating *</Label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                          className={`p-1 transition-colors ${
                            star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comments (Optional)</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your thoughts about this tool..."
                      value={feedback.comment}
                      onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={handleFeedbackSubmit} 
                    disabled={feedback.rating === 0}
                    className="w-full"
                  >
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tool;
