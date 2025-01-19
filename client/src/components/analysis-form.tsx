import { useState } from "react";
import { useCreateAnalysis } from "@/hooks/use-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link as LinkIcon, Paperclip } from "lucide-react";

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
  const [referenceUrl, setReferenceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const createAnalysis = useCreateAnalysis();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("analysis_type", type);
      formDataToSend.append("content", JSON.stringify(formData));
      formDataToSend.append("reference_url", referenceUrl);
      if (file) {
        formDataToSend.append("attachment", file);
      }

      await createAnalysis.mutateAsync(formDataToSend);

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
          <div className="space-y-2">
            <Label htmlFor="reference_url" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Reference URL
            </Label>
            <Input
              id="reference_url"
              type="url"
              placeholder="https://..."
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment" className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachment
            </Label>
            <Input
              id="attachment"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>

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