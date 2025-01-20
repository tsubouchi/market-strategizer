import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from "@react-pdf/renderer";
import type { Analysis } from "@db/schema";

// Register default font family
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: 'Helvetica'
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  contentSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentText: {
    fontSize: 11,
    lineHeight: 1.4,
  }
});

interface AnalysisPDFProps {
  analysis: Analysis;
}

export function AnalysisPDFDocument({ analysis }: AnalysisPDFProps) {
  const content = analysis.content as Record<string, any>;

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('ja-JP');
  };

  // 分析タイプに基づいてセクションタイトルを設定
  const getSectionTitle = (key: string) => {
    switch (key) {
      case 'initial_analysis':
        return '初期分析';
      case 'deep_analysis':
        return '詳細分析';
      case 'final_recommendations':
        return '最終提案';
      default:
        return key;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.section}>
          <Text style={styles.title}>
            {analysis.analysis_type}分析 レポート
          </Text>
          <Text style={styles.text}>
            作成日時: {formatDate(analysis.created_at)}
          </Text>
        </View>

        {/* 分析コンテンツ */}
        {Object.entries(content).map(([sectionKey, sectionData]) => (
          <View key={sectionKey} style={styles.section}>
            <Text style={styles.subtitle}>{getSectionTitle(sectionKey)}</Text>
            {Object.entries(sectionData).map(([key, value]) => (
              <View key={key} style={styles.contentSection}>
                <Text style={styles.contentTitle}>{key.replace(/_/g, ' ')}</Text>
                {Array.isArray(value) ? (
                  value.map((item, index) => (
                    <Text key={index} style={styles.contentText}>
                      • {item}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.contentText}>{String(value)}</Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* 参考資料 */}
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