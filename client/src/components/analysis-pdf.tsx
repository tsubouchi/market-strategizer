import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import type { Analysis } from "@db/schema";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 8,
  },
});

interface AnalysisPDFProps {
  analysis: Analysis;
}

export function AnalysisPDFDocument({ analysis }: AnalysisPDFProps) {
  const content = analysis.content as Record<string, string>;

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('ja-JP');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.title}>
            {analysis.analysis_type}分析 レポート
          </Text>
          <Text style={styles.text}>
            作成日時: {formatDate(analysis.created_at)}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>分析内容</Text>
          {Object.entries(content).map(([key, value]) => (
            <View key={key} style={styles.section}>
              <Text style={styles.text}>
                {key}
              </Text>
              <Text style={styles.text}>{value}</Text>
            </View>
          ))}
        </View>

        {/* References */}
        {analysis.reference_url && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>参考資料</Text>
            <Text style={styles.text}>URL: {analysis.reference_url}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export function AnalysisPDFViewer({ analysis }: AnalysisPDFProps) {
  return (
    <div className="h-[500px] w-full">
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <AnalysisPDFDocument analysis={analysis} />
      </PDFViewer>
    </div>
  );
}