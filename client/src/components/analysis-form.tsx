import { useState } from "react";
import { useCreateAnalysis } from "@/hooks/use-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const analysisFields = {
  "3C": [
    { key: "company", label: "Company Analysis", type: "textarea" },
    { key: "customer", label: "Customer Analysis", type: "textarea" },
    { key: "competitors", label: "Competitor Analysis", type: "textarea" },
  ],
  "4P": [
    { key: "product", label: "Product", type: "textarea" },
    { key: "price", label: "Price", type: "textarea" },
    { key: "place", label: "Place", type: "textarea" },
    { key: "promotion", label: "Promotion", type: "textarea" },
  ],
  "PEST": [
    { key: "political", label: "Political Factors", type: "textarea" },
    { key: "economic", label: "Economic Factors", type: "textarea" },
    { key: "social", label: "Social Factors", type: "textarea" },
    { key: "technological", label: "Technological Factors", type: "textarea" },
  ],
};

interface AnalysisFormProps {
  type: keyof typeof analysisFields;
  onComplete?: () => void;
}

export default function AnalysisForm({ type, onComplete }: AnalysisFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const createAnalysis = useCreateAnalysis();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAnalysis.mutateAsync({
        analysis_type: type,
        content: formData,
      });
      
      toast({
        title: "Success",
        description: "Analysis created successfully",
      });
      
      onComplete?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type} Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {analysisFields[type].map(({ key, label, type: fieldType }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              {fieldType === "textarea" ? (
                <Textarea
                  id={key}
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  required
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  id={key}
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  required
                />
              )}
            </div>
          ))}
          <Button
            type="submit"
            className="w-full"
            disabled={createAnalysis.isPending}
          >
            {createAnalysis.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Analysis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
