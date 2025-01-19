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
  aiSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
});

interface AnalysisPDFProps {
  analysis: Analysis;
}

export function AnalysisPDFDocument({ analysis }: AnalysisPDFProps) {
  const content = analysis.content as Record<string, string>;
  let aiContent = { initial_analysis: {}, deep_analysis: {}, recommendations: {} };

  try {
    if (analysis.ai_feedback) {
      aiContent = JSON.parse(analysis.ai_feedback);
    }
  } catch (error) {
    console.error("Failed to parse AI feedback:", error);
  }

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "";
    return new Date(date).toLocaleString('ja-JP');
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
              <Text style={{ ...styles.text, fontWeight: "bold" }}>
                {key}
              </Text>
              <Text style={styles.text}>{value}</Text>
            </View>
          ))}
        </View>

        {/* AI Analysis */}
        <View style={styles.aiSection}>
          <Text style={styles.subtitle}>AI分析結果</Text>

          {/* Initial Analysis */}
          <View style={styles.section}>
            <Text style={{ ...styles.text, fontWeight: "bold" }}>初期分析</Text>
            {Object.entries(aiContent.initial_analysis).map(([key, value]) => (
              <Text key={key} style={styles.text}>
                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
              </Text>
            ))}
          </View>

          {/* Deep Analysis */}
          <View style={styles.section}>
            <Text style={{ ...styles.text, fontWeight: "bold" }}>詳細分析</Text>
            {Object.entries(aiContent.deep_analysis).map(([key, value]) => (
              <Text key={key} style={styles.text}>
                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
              </Text>
            ))}
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={{ ...styles.text, fontWeight: "bold" }}>提案</Text>
            {Object.entries(aiContent.recommendations).map(([key, value]) => (
              <Text key={key} style={styles.text}>
                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
              </Text>
            ))}
          </View>
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
    <PDFViewer style={{ width: "100%", height: "800px" }}>
      <AnalysisPDFDocument analysis={analysis} />
    </PDFViewer>
  );
}