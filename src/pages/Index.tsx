import { useState } from "react";
import { Upload, FileText, TrendingUp, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FileUploadZone } from "@/components/FileUploadZone";
import { ProcessingSteps } from "@/components/ProcessingSteps";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  extraction: any;
  tax_optimization: any;
  compliance_review: any;
  summary: string;
  confidence_scores: {
    extraction: number;
    compliance: number;
  };
}

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setResults(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setProcessing(true);
    setCurrentStep(0);
    setResults(null);

    try {
      // Convert files to base64
      const filePromises = files.map(file => {
        return new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve({
              name: file.name,
              type: file.type,
              data: base64.split(',')[1] // Remove data URL prefix
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const filesData = await Promise.all(filePromises);

      // Call orchestrator edge function
      const { data, error } = await supabase.functions.invoke('gemtax-orchestrator', {
        body: { files: filesData }
      });

      if (error) throw error;

      setResults(data);
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze documents");
    } finally {
      setProcessing(false);
      setCurrentStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GemTax Orchestrator
              </h1>
              <p className="text-sm text-muted-foreground">UAE Tax Intelligence Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {!results ? (
          <div className="grid gap-8">
            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Data Extraction</h3>
                    <p className="text-sm text-muted-foreground">
                      AI extracts structured financial data from your documents
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-success shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-success/10">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Tax Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover UAE-specific tax savings and financial strategies
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-warning shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-warning/10">
                    <Shield className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Compliance Review</h3>
                    <p className="text-sm text-muted-foreground">
                      Evaluate VAT & Corporate Tax compliance status
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Upload Section */}
            <Card className="p-8 shadow-xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Upload Your Documents</h2>
                <p className="text-muted-foreground">
                  Upload PDFs, images, receipts, salary slips, bank CSVs, VAT invoices, or P&L documents
                </p>
              </div>
              
              <FileUploadZone onFilesSelected={handleFilesSelected} />

              {files.length > 0 && (
                <div className="mt-6">
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={processing}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Analyze {files.length} Document{files.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>

            {processing && <ProcessingSteps currentStep={currentStep} />}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Analysis Complete</h3>
                  <p className="text-muted-foreground">{results.summary}</p>
                </div>
              </div>
            </Card>

            <ResultsDisplay results={results} />

            <Button 
              onClick={() => {
                setResults(null);
                setFiles([]);
              }}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Analyze New Documents
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
