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

  // 準備中のメッセージを含むエントリーを除外
  const validContent = Object.entries(content).filter(
    ([_, value]) => !value.message?.includes("準備中")
  );

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('ja-JP');
  };

  // 有効なコンテンツがない場合はnullを返す
  if (validContent.length === 0) return null;

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

        {/* Content - 準備中ではないコンテンツのみ表示 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>分析内容</Text>
          {validContent.map(([key, value]) => (
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
  // 準備中のメッセージを含むコンテンツがある場合は何も表示しない
  const hasPreparingContent = Object.values(analysis.content as Record<string, string>)
    .some(value => value.message?.includes("準備中"));

  if (hasPreparingContent) return null;

  return (
    <div className="h-[500px] w-full">
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <AnalysisPDFDocument analysis={analysis} />
      </PDFViewer>
    </div>
  );
}