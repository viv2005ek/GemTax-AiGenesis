import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileData {
  name: string;
  type: string;
  data: string; // base64
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files } = await req.json() as { files: FileData[] };
    
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Processing ${files.length} files through GemTax orchestrator`);

    // STEP 1: Run v1_extractor agent
    console.log('Step 1: Running extraction agent...');
    const extractorPrompt = buildExtractorPrompt(files);
    const extractionResult = await callGeminiAgent(LOVABLE_API_KEY, extractorPrompt);
    console.log('Extraction complete');

    // STEP 2: Run v1_optimizer agent
    console.log('Step 2: Running optimization agent...');
    const optimizerPrompt = buildOptimizerPrompt(extractionResult);
    const optimizationResult = await callGeminiAgent(LOVABLE_API_KEY, optimizerPrompt);
    console.log('Optimization complete');

    // STEP 3: Run v1_compliance_UAE agent
    console.log('Step 3: Running compliance agent...');
    const compliancePrompt = buildCompliancePrompt(extractionResult, files);
    const complianceResult = await callGeminiAgent(LOVABLE_API_KEY, compliancePrompt);
    console.log('Compliance review complete');

    // Assemble final output
    const finalResult = {
      extraction: extractionResult,
      tax_optimization: optimizationResult,
      compliance_review: complianceResult,
      summary: generateSummary(extractionResult, optimizationResult, complianceResult),
      confidence_scores: {
        extraction: extractionResult.confidence || 0.85,
        compliance: calculateComplianceScore(complianceResult)
      }
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('GemTax orchestrator error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Analysis failed' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function callGeminiAgent(apiKey: string, prompt: string): Promise<any> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in AI response');
  }

  // Try to parse JSON from the response
  try {
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error('Failed to parse JSON:', content);
    throw new Error('Agent returned invalid JSON format');
  }
}

function buildExtractorPrompt(files: FileData[]): string {
  return `You are v1_extractor - an expert financial data extraction agent for UAE documents.

TASK: Extract structured financial data from the provided documents.

FILES PROVIDED: ${files.length} document(s)
File types: ${files.map(f => `${f.name} (${f.type})`).join(', ')}

EXTRACTION RULES:
- Extract person/company details, salary, deductions, revenue, expenses
- Identify UAE-specific fields: TRN (Tax Registration Number), VAT amounts, Corporate Tax data
- Extract vendor information from invoices
- Be conservative - mark unclear data as null
- Provide confidence score (0.0-1.0)

OUTPUT FORMAT (STRICT JSON):
{
  "person": { "name": "string or null", "position": "string or null" },
  "company": { "name": "string or null", "trn": "string or null" },
  "salary": { "basic": number or null, "allowances": number or null, "total": number or null },
  "deductions": { "total": number or null, "breakdown": {} },
  "vat": { "total_vat": number or null, "vat_rate": 0.05 },
  "revenue": number or null,
  "expenses": { "total": number or null, "categories": {} },
  "vendors": [],
  "confidence": number
}

Analyze the documents and return ONLY the JSON output, no additional text.`;
}

function buildOptimizerPrompt(extractionData: any): string {
  return `You are v1_optimizer - a UAE tax optimization specialist.

TASK: Generate UAE-specific tax-saving and financial optimization actions.

EXTRACTED DATA:
${JSON.stringify(extractionData, null, 2)}

UAE TAX RULES:
- VAT: 5% standard rate
- Corporate Tax: 9% on profits above AED 375,000
- Free zones: 0% tax for qualifying activities
- Personal income tax: None

OPTIMIZATION RULES:
- Suggest legitimate tax-saving strategies
- Consider free-zone opportunities
- Recommend expense optimization
- Calculate 3-year expected returns when applicable
- Be conservative with estimates

OUTPUT FORMAT (STRICT JSON):
{
  "actions": [
    {
      "action": "Clear action description",
      "amount": number or null,
      "tax_saved": number or null,
      "expected_3yr_return_pct": number or null,
      "rationale": "Why this works for UAE"
    }
  ]
}

Generate optimization recommendations and return ONLY the JSON output.`;
}

function buildCompliancePrompt(extractionData: any, files: FileData[]): string {
  return `You are v1_compliance_UAE - a UAE tax compliance reviewer.

TASK: Evaluate UAE VAT and Corporate Tax compliance.

EXTRACTED DATA:
${JSON.stringify(extractionData, null, 2)}

UAE COMPLIANCE REQUIREMENTS:
- VAT Registration: Mandatory if turnover > AED 375,000
- Corporate Tax Registration: Required for all businesses
- VAT Invoices: Must show TRN, VAT amount, total
- Filing: VAT quarterly, Corporate Tax annually
- TRN Format: 15 digits

REVIEW CHECKLIST:
- Valid TRN presence
- Correct VAT calculations (5%)
- Proper invoice formatting
- Corporate tax threshold compliance
- Filing requirement adherence

OUTPUT FORMAT (STRICT JSON):
{
  "issues": [
    {
      "type": "Issue category",
      "details": "Specific problem description",
      "severity": "low|medium|high|critical"
    }
  ]
}

If no issues found, return: {"issues": []}

Analyze compliance and return ONLY the JSON output.`;
}

function generateSummary(extraction: any, optimization: any, compliance: any): string {
  const parts: string[] = [];
  
  // Financial summary
  if (extraction.revenue) {
    parts.push(`Revenue identified: AED ${extraction.revenue.toLocaleString()}`);
  }
  if (extraction.salary?.total) {
    parts.push(`Total salary: AED ${extraction.salary.total.toLocaleString()}`);
  }
  
  // Optimization summary
  const actionCount = optimization.actions?.length || 0;
  if (actionCount > 0) {
    const totalSavings = optimization.actions.reduce((sum: number, a: any) => sum + (a.tax_saved || 0), 0);
    parts.push(`${actionCount} tax optimization action${actionCount > 1 ? 's' : ''} identified with potential savings of AED ${totalSavings.toLocaleString()}`);
  }
  
  // Compliance summary
  const issueCount = compliance.issues?.length || 0;
  if (issueCount > 0) {
    const critical = compliance.issues.filter((i: any) => i.severity === 'high' || i.severity === 'critical').length;
    parts.push(`${issueCount} compliance issue${issueCount > 1 ? 's' : ''} found${critical > 0 ? ` (${critical} high priority)` : ''}`);
  } else {
    parts.push('No compliance issues detected');
  }
  
  return parts.join('. ') + '.';
}

function calculateComplianceScore(complianceData: any): number {
  const issues = complianceData.issues || [];
  if (issues.length === 0) return 1.0;
  
  const severityWeights: Record<string, number> = {
    low: 0.05,
    medium: 0.15,
    high: 0.30,
    critical: 0.50
  };
  
  const totalDeduction = issues.reduce((sum: number, issue: any) => {
    return sum + (severityWeights[issue.severity] || 0.1);
  }, 0);
  
  return Math.max(0, 1 - totalDeduction);
}
