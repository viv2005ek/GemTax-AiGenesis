import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultsDisplayProps {
  results: {
    extraction: any;
    tax_optimization: any;
    compliance_review: any;
    summary: string;
    confidence_scores: {
      extraction: number;
      compliance: number;
    };
  };
}

export const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const getSeverityColor = (severity: string): "destructive" | "secondary" | "outline" => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="extraction">Extraction</TabsTrigger>
        <TabsTrigger value="optimization">Optimization</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Confidence Scores */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Extraction Confidence</span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">
                {Math.round(results.confidence_scores.extraction * 100)}%
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Compliance Score</span>
              <Shield className="w-4 h-4 text-success" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-success">
                {Math.round(results.confidence_scores.compliance * 100)}%
              </span>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        {results.tax_optimization?.actions && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Tax Optimization Opportunities
            </h3>
            <div className="text-2xl font-bold text-success mb-2">
              {results.tax_optimization.actions.length} Actions Available
            </div>
            <p className="text-sm text-muted-foreground">
              Review the Optimization tab for detailed recommendations
            </p>
          </Card>
        )}

        {/* Compliance Overview */}
        {results.compliance_review?.issues && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-warning" />
              Compliance Issues Found
            </h3>
            <div className="text-2xl font-bold text-warning mb-2">
              {results.compliance_review.issues.length} Issue{results.compliance_review.issues.length !== 1 ? 's' : ''}
            </div>
            <p className="text-sm text-muted-foreground">
              Review the Compliance tab for details and remediation steps
            </p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="extraction" className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Extracted Financial Data
          </h3>
          <pre className="text-sm bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[600px]">
            {JSON.stringify(results.extraction, null, 2)}
          </pre>
        </Card>
      </TabsContent>

      <TabsContent value="optimization" className="space-y-4">
        {results.tax_optimization?.actions?.length > 0 ? (
          results.tax_optimization.actions.map((action: any, index: number) => (
            <Card key={index} className="p-6 border-l-4 border-l-success">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg">{action.action}</h4>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Save AED {action.tax_saved?.toLocaleString() || 'TBD'}
                </Badge>
              </div>
              
              {action.amount && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Amount: </span>
                  <span className="text-sm">AED {action.amount.toLocaleString()}</span>
                </div>
              )}
              
              {action.expected_3yr_return_pct && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-muted-foreground">3-Year Expected Return: </span>
                  <span className="text-sm font-semibold text-success">{action.expected_3yr_return_pct}%</span>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">{action.rationale}</p>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="text-muted-foreground">No optimization actions identified</p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="compliance" className="space-y-4">
        {results.compliance_review?.issues?.length > 0 ? (
          results.compliance_review.issues.map((issue: any, index: number) => (
            <Card key={index} className={`p-6 border-l-4 ${
              issue.severity === 'high' || issue.severity === 'critical' 
                ? 'border-l-destructive' 
                : issue.severity === 'medium'
                ? 'border-l-warning'
                : 'border-l-secondary'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-1 ${
                    issue.severity === 'high' || issue.severity === 'critical'
                      ? 'text-destructive'
                      : issue.severity === 'medium'
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{issue.type}</h4>
                    <Badge 
                      variant={getSeverityColor(issue.severity)}
                      className={issue.severity === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : ''}
                    >
                      {issue.severity} Severity
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-8">{issue.details}</p>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="font-semibold text-lg mb-2">All Clear!</p>
            <p className="text-muted-foreground">No compliance issues detected</p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};
