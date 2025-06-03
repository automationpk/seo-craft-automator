
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Loader2, Download, Star, TrendingUp, Search, Shield, Bot, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Tool = () => {
  const { id: projectId, toolId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toolSubmissionId, setToolSubmissionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ""
  });

  const toolsConfig = {
    "before-after-generator": {
      title: "Before-After Article Generator",
      description: "Generate engaging before/after comparison articles for your SEO blog",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "businessModel", label: "Business Model", type: "input", placeholder: "e.g., SaaS, E-commerce, Service", required: true },
        { id: "productService", label: "Product/Service", type: "input", placeholder: "Describe your main offering", required: true },
        { id: "targetedRegion", label: "Targeted Region", type: "input", placeholder: "e.g., India, USA, Europe", required: true },
        { id: "businessType", label: "Business Type", type: "select", options: [
          { value: "b2b", label: "B2B" },
          { value: "b2c", label: "B2C" },
          { value: "both", label: "Both B2B & B2C" }
        ], required: true },
        { id: "websiteName", label: "Website Name", type: "input", placeholder: "Your website name", required: true },
        { id: "targetedAudience", label: "Targeted Audience", type: "textarea", placeholder: "Describe your target audience in detail", required: true },
        { id: "keywords", label: "Keywords", type: "textarea", placeholder: "Enter your target keywords (comma-separated)", required: true }
      ],
      resultTitle: "Article Generated Successfully!",
      resultDescription: "Your before-after comparison article is ready for download",
      resultPreview: "Before vs After: How {productService} Transformed {targetedAudience} in {targetedRegion}"
    },
    "top-10-generator": {
      title: "TOP 10 Article Generator",
      description: "Create viral listicle articles to boost website traffic",
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "topic", label: "Article Topic", type: "input", placeholder: "e.g., Best SEO Tools", required: true },
        { id: "targetAudience", label: "Target Audience", type: "input", placeholder: "e.g., Digital Marketers", required: true },
        { id: "keywords", label: "Target Keywords", type: "textarea", placeholder: "Enter your target keywords (comma-separated)", required: true },
        { id: "tone", label: "Tone of Voice", type: "select", options: [
          { value: "professional", label: "Professional" },
          { value: "casual", label: "Casual" },
          { value: "friendly", label: "Friendly" },
          { value: "authoritative", label: "Authoritative" }
        ], required: true }
      ],
      resultTitle: "TOP 10 Article Generated Successfully!",
      resultDescription: "Your viral listicle article is ready for download",
      resultPreview: "TOP 10 {topic} for {targetAudience}"
    },
    "page-optimizer": {
      title: "Page Optimizer",
      description: "Optimize landing page titles, headers, and meta descriptions",
      icon: <Search className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "pageUrl", label: "Page URL", type: "input", placeholder: "https://example.com/page", required: true },
        { id: "targetKeywords", label: "Target Keywords", type: "textarea", placeholder: "Enter your target keywords", required: true },
        { id: "currentTitle", label: "Current Page Title", type: "input", placeholder: "Current title of your page", required: false },
        { id: "currentDescription", label: "Current Meta Description", type: "textarea", placeholder: "Current meta description", required: false }
      ],
      resultTitle: "Page Optimization Complete!",
      resultDescription: "Your optimized page elements are ready",
      resultPreview: "Optimized title, headers, and meta description for {pageUrl}"
    },
    "privacy-policy-generator": {
      title: "Privacy Policy Generator",
      description: "Generate custom privacy policies for your business",
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "companyName", label: "Company Name", type: "input", placeholder: "Your company name", required: true },
        { id: "websiteUrl", label: "Website URL", type: "input", placeholder: "https://yourwebsite.com", required: true },
        { id: "contactEmail", label: "Contact Email", type: "input", placeholder: "privacy@yourcompany.com", required: true },
        { id: "dataCollection", label: "Types of Data Collected", type: "textarea", placeholder: "Describe what data you collect", required: true },
        { id: "jurisdiction", label: "Legal Jurisdiction", type: "input", placeholder: "e.g., United States, European Union", required: true }
      ],
      resultTitle: "Privacy Policy Generated Successfully!",
      resultDescription: "Your custom privacy policy is ready for download",
      resultPreview: "Complete privacy policy for {companyName}"
    },
    "technical-seo-analyzer": {
      title: "Technical SEO Analyzer",
      description: "Comprehensive on-site SEO analysis and recommendations",
      icon: <Bot className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "websiteUrl", label: "Website URL", type: "input", placeholder: "https://yourwebsite.com", required: true },
        { id: "focusPages", label: "Focus Pages", type: "textarea", placeholder: "List specific pages to analyze (one per line)", required: false },
        { id: "competitors", label: "Competitor URLs", type: "textarea", placeholder: "List competitor websites (one per line)", required: false }
      ],
      resultTitle: "Technical SEO Analysis Complete!",
      resultDescription: "Your comprehensive SEO report is ready",
      resultPreview: "Technical SEO analysis and recommendations for {websiteUrl}"
    },
    "link-building-tracker": {
      title: "Link Building Tracker",
      description: "Track and discover new link-building opportunities",
      icon: <Link className="h-6 w-6 text-blue-600" />,
      fields: [
        { id: "targetDomain", label: "Target Domain", type: "input", placeholder: "yourwebsite.com", required: true },
        { id: "niche", label: "Industry/Niche", type: "input", placeholder: "e.g., Digital Marketing", required: true },
        { id: "competitorDomains", label: "Competitor Domains", type: "textarea", placeholder: "List competitor domains (one per line)", required: false },
        { id: "linkTypes", label: "Link Types to Track", type: "select", options: [
          { value: "guest-posts", label: "Guest Posts" },
          { value: "resource-pages", label: "Resource Pages" },
          { value: "broken-links", label: "Broken Link Building" },
          { value: "all", label: "All Types" }
        ], required: true }
      ],
      resultTitle: "Link Building Report Generated!",
      resultDescription: "Your link building opportunities are ready",
      resultPreview: "Link building opportunities and tracking setup for {targetDomain}"
    }
  };

  const currentTool = toolsConfig[toolId as keyof typeof toolsConfig];

  useEffect(() => {
    if (currentTool) {
      const initialFormData: Record<string, string> = {};
      currentTool.fields.forEach(field => {
        initialFormData[field.id] = "";
      });
      setFormData(initialFormData);
    }
  }, [toolId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    // Validate required fields
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
      // Save tool submission to database
      const { data, error } = await supabase
        .from('tools_used')
        .insert([{
          project_id: projectId,
          tool_type: toolId,
          inputs: formData,
          status: 'processing'
        }])
        .select()
        .single();

      if (error) throw error;

      setToolSubmissionId(data.id);
      
      // Simulate processing for now (replace with Make.com webhook later)
      setTimeout(async () => {
        // Update the tool submission status to completed
        const { error: updateError } = await supabase
          .from('tools_used')
          .update({ 
            status: 'completed',
            output_url: `https://example.com/generated-${toolId}.pdf` // Placeholder URL
          })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error updating tool status:', updateError);
        }

        setIsProcessing(false);
        setShowResults(true);
        toast({
          title: "Content Generated!",
          description: `Your ${currentTool.title.toLowerCase()} has been created successfully.`,
        });
      }, 3000);
      
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

  if (!currentTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Tool Not Available</h2>
            <p className="text-gray-600 mb-4">This tool is coming soon!</p>
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
                <div className="flex gap-4">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download (DOC)
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Card */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Tool;
