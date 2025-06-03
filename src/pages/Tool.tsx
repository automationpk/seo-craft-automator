
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Loader2, Download, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Tool = () => {
  const { id: projectId, toolId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    businessModel: "",
    productService: "",
    targetedRegion: "",
    businessType: "",
    targetedAudience: "",
    keywords: "",
    websiteName: ""
  });
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
      toast({
        title: "Content Generated!",
        description: "Your before-after article has been created successfully.",
      });
    }, 3000);
  };

  const handleFeedbackSubmit = () => {
    if (feedback.rating > 0) {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
      });
      setFeedback({ rating: 0, comment: "" });
    }
  };

  if (toolId !== "before-after-generator") {
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
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Before-After Article Generator</h1>
                <p className="text-sm text-gray-600">Generate engaging comparison articles</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          <Card>
            <CardHeader>
              <CardTitle>Article Generation Form</CardTitle>
              <CardDescription>
                Fill out the details below to generate your before-after comparison article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessModel">Business Model</Label>
                    <Input
                      id="businessModel"
                      placeholder="e.g., SaaS, E-commerce, Service"
                      value={formData.businessModel}
                      onChange={(e) => handleInputChange("businessModel", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productService">Product/Service</Label>
                    <Input
                      id="productService"
                      placeholder="Describe your main offering"
                      value={formData.productService}
                      onChange={(e) => handleInputChange("productService", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetedRegion">Targeted Region</Label>
                    <Input
                      id="targetedRegion"
                      placeholder="e.g., India, USA, Europe"
                      value={formData.targetedRegion}
                      onChange={(e) => handleInputChange("targetedRegion", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select onValueChange={(value) => handleInputChange("businessType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="b2b">B2B</SelectItem>
                        <SelectItem value="b2c">B2C</SelectItem>
                        <SelectItem value="both">Both B2B & B2C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteName">Website Name</Label>
                    <Input
                      id="websiteName"
                      placeholder="Your website name"
                      value={formData.websiteName}
                      onChange={(e) => handleInputChange("websiteName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetedAudience">Targeted Audience</Label>
                  <Textarea
                    id="targetedAudience"
                    placeholder="Describe your target audience in detail"
                    value={formData.targetedAudience}
                    onChange={(e) => handleInputChange("targetedAudience", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Textarea
                    id="keywords"
                    placeholder="Enter your target keywords (comma-separated)"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange("keywords", e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Article...
                    </>
                  ) : (
                    "Generate Article"
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
                  <FileText className="h-5 w-5 mr-2" />
                  Article Generated Successfully!
                </CardTitle>
                <CardDescription>
                  Your before-after comparison article is ready for download
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Article Preview:</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    "Before vs After: How {formData.productService} Transformed {formData.targetedAudience} in {formData.targetedRegion}"
                  </p>
                  <p className="text-gray-600 text-sm">
                    This comprehensive article covers the transformation journey, includes targeted keywords, 
                    and is optimized for SEO performance in your target market.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Article (DOC)
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
                  <Label className="mb-2 block">Rating</Label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                        className={`p-1 ${
                          star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
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
                <Button onClick={handleFeedbackSubmit} disabled={feedback.rating === 0}>
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
