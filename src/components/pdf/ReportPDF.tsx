import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { marginBottom: 20, borderBottom: 3, borderColor: '#d4af37', paddingBottom: 15 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  crown: { fontSize: 24, marginRight: 8, color: '#d4af37' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', letterSpacing: 2 },
  headerSubtitle: { fontSize: 10, color: '#666666', textAlign: 'center', marginTop: 3 },
  cnpjText: { fontSize: 9, color: '#666666', textAlign: 'center', marginTop: 2 },
  locationText: { fontSize: 8, color: '#999999', textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#d4af37', marginBottom: 8, paddingBottom: 4, borderBottom: 1, borderColor: '#e5e5e5', letterSpacing: 1 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  summaryItem: { width: '32%', backgroundColor: '#f8f6f0', border: 1, borderColor: '#d4af37', borderRadius: 4, padding: 8 },
  summaryLabel: { fontSize: 7, color: '#999999', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  summaryValue: { fontSize: 10, color: '#333333', fontWeight: 'bold' },
  summaryValueGold: { fontSize: 10, color: '#d4af37', fontWeight: 'bold' },
  table: { marginBottom: 15 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#d4af37', padding: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  tableHeaderCell: { fontSize: 7, color: '#ffffff', fontWeight: 'bold', textTransform: 'uppercase', flex: 1 },
  tableRow: { flexDirection: 'row', padding: 5, borderBottom: 0.5, borderBottomColor: '#e5e5e5' },
  tableRowAlt: { backgroundColor: '#f9f9f9' },
  tableCell: { fontSize: 7, color: '#333333', flex: 1 },
  tableCellCode: { fontSize: 7, color: '#d4af37', fontWeight: 'bold', flex: 1 },
  statusBadge: { padding: 2, borderRadius: 2, textAlign: 'center' },
  statusText: { fontSize: 6, fontWeight: 'bold', textTransform: 'uppercase' },
  categoryHeader: { flexDirection: 'row', backgroundColor: '#f8f6f0', padding: 4, marginTop: 8, marginBottom: 2 },
  categoryTitle: { fontSize: 8, color: '#d4af37', fontWeight: 'bold' },
  categoryTotal: { fontSize: 7, color: '#666666', marginLeft: 'auto' },
  totalBox: { backgroundColor: '#d4af37', padding: 10, borderRadius: 4, marginTop: 15, marginBottom: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { fontSize: 9, color: '#ffffff', fontWeight: 'bold' },
  totalValue: { fontSize: 10, color: '#ffffff', fontWeight: 'bold' },
  committeeSection: { marginTop: 30, borderTop: 2, borderColor: '#d4af37', paddingTop: 15 },
  committeeTitle: { fontSize: 10, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', marginBottom: 10 },
  committeeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  committeeMember: { width: '48%', marginBottom: 15, textAlign: 'center' },
  memberRole: { fontSize: 6, color: '#999999', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  memberName: { fontSize: 8, color: '#333333', fontWeight: 'bold' },
  signatureLine: { borderTop: 1, borderColor: '#cccccc', marginTop: 20, paddingTop: 3 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', borderTop: 1, borderColor: '#e5e5e5', paddingTop: 8 },
  footerText: { fontSize: 6, color: '#999999' },
});

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE: { bg: '#d4edda', color: '#155724', label: 'Ativo' },
  IN_USE: { bg: '#cce5ff', color: '#004085', label: 'Em Uso' },
  MAINTENANCE: { bg: '#fff3cd', color: '#856404', label: 'Manut.' },
  RETIRED: { bg: '#e2e3e5', color: '#383d41', label: 'Baixado' },
  MISSING: { bg: '#f8d7da', color: '#721c24', label: 'Extrav.' },
  RESERVE: { bg: '#d1ecf1', color: '#0c5460', label: 'Reserva' },
};

const formatCurrency = (value: number | null) => {
  if (!value) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const ReportPDF = ({ assets, committee, filters }: { assets: any[]; committee: any; filters: { category?: string; search?: string } }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const totalAssets = assets.length;
  const totalAcquisition = assets.reduce((sum, a) => sum + (Number(a.acquisitionValue) || 0), 0);
  const totalCurrent = assets.reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);

  const categoryStats: Record<string, { count: number; value: number }> = {};
  assets.forEach(a => {
    const cat = a.category || 'Sem Categoria';
    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, value: 0 };
    categoryStats[cat].count++;
    categoryStats[cat].value += Number(a.acquisitionValue) || 0;
  });

  const statusStats: Record<string, number> = {};
  assets.forEach(a => {
    const status = a.status || 'ACTIVE';
    statusStats[status] = (statusStats[status] || 0) + 1;
  });

  const filterText: string[] = [];
  if (filters.category) filterText.push(`Categoria: ${filters.category}`);
  if (filters.search) filterText.push(`Busca: ${filters.search}`);

  const itemsPerPage = 25;
  const totalPages = Math.ceil(totalAssets / itemsPerPage);

  const renderPage = (pageAssets: any[], pageIndex: number) => (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.headerTitle}>PATRIMÔNIO DO REI</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Relatório Geral de Bens Patrimoniais
        </Text>
        <Text style={styles.cnpjText}>
          {committee?.organization || 'Núcleo REI RABINO'} • CNPJ: {committee?.cnpj || '09.621.597/0001-66'}
        </Text>
        <Text style={styles.locationText}>
          {committee?.location || 'PERDIGÃO/MG'} • {currentDate}
          {filterText.length > 0 && ` • ${filterText.join(' | ')}`}
        </Text>
      </View>

      {pageIndex === 0 && (
        <>
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total de Bens</Text>
              <Text style={styles.summaryValue}>{totalAssets}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valor Aquisição</Text>
              <Text style={styles.summaryValueGold}>{formatCurrency(totalAcquisition)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valor Atual</Text>
              <Text style={styles.summaryValueGold}>{formatCurrency(totalCurrent)}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Por Categoria</Text>
          <View style={{ marginBottom: 10 }}>
            {Object.entries(categoryStats).map(([cat, stats]) => (
              <View key={cat} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 3, borderBottom: 0.5, borderColor: '#e5e5e5' }}>
                <Text style={{ fontSize: 7, color: '#333333' }}>{cat}</Text>
                <Text style={{ fontSize: 7, color: '#666666' }}>{stats.count} itens • {formatCurrency(stats.value)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Por Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 15 }}>
            {Object.entries(statusStats).map(([status, count]) => {
              const config = statusConfig[status] || { bg: '#e2e3e5', color: '#383d41', label: status };
              return (
                <View key={status} style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}: {count}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Lista de Bens</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Código</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Nome</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Categoria</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Local</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Valor</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Status</Text>
        </View>
        {pageAssets.map((asset, idx) => {
          const status = statusConfig[asset.status] || { bg: '#e2e3e5', color: '#383d41', label: asset.status };
          return (
            <View key={asset.id} style={idx % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <Text style={styles.tableCellCode}>{asset.tagNumber}</Text>
              <Text style={styles.tableCell}>{asset.name}</Text>
              <Text style={styles.tableCell}>{asset.category || '-'}</Text>
              <Text style={styles.tableCell}>{asset.physicalLocation || '-'}</Text>
              <Text style={styles.tableCell}>{formatCurrency(asset.acquisitionValue)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.bg, width: 'auto', textAlign: 'center' }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {pageIndex === totalPages - 1 && (
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VALOR TOTAL DE AQUISIÇÃO</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAcquisition)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VALOR TOTAL ATUAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCurrent)}</Text>
          </View>
        </View>
      )}

      {pageIndex === totalPages - 1 && (
        <View style={styles.committeeSection}>
          <Text style={styles.committeeTitle}>Comissão de Patrimônio</Text>
          <View style={styles.committeeGrid}>
            <View style={styles.committeeMember}>
              <Text style={styles.memberRole}>Presidente</Text>
              <Text style={styles.memberName}>{committee?.president}</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.committeeMember}>
              <Text style={styles.memberRole}>Vice-Presidente</Text>
              <Text style={styles.memberName}>{committee?.vicePresident}</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.committeeMember}>
              <Text style={styles.memberRole}>Presidente Conselho Fiscal</Text>
              <Text style={styles.memberName}>{committee?.fiscalPresident}</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.committeeMember}>
              <Text style={styles.memberRole}>1º Membro</Text>
              <Text style={styles.memberName}>{committee?.member1}</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={[styles.committeeMember, { width: '100%' }]}>
              <Text style={styles.memberRole}>2º Membro</Text>
              <Text style={styles.memberName}>{committee?.member2}</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Patrimônio do Rei • Relatório gerado em {currentDate} • Página {pageIndex + 1} de {totalPages}
        </Text>
      </View>
    </Page>
  );

  return (
    <Document>
      {Array.from({ length: totalPages }, (_, i) => {
        const start = i * itemsPerPage;
        const end = start + itemsPerPage;
        return renderPage(assets.slice(start, end), i);
      })}
    </Document>
  );
};
