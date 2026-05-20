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
  statusBadge: { padding: 2, borderRadius: 2, textAlign: 'center' },
  statusText: { fontSize: 6, fontWeight: 'bold', textTransform: 'uppercase' },
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

const reasonConfig: Record<string, { bg: string; color: string; label: string }> = {
  DESCARTADA: { bg: '#f8d7da', color: '#721c24', label: 'Descartado' },
  DOADA: { bg: '#d4edda', color: '#155724', label: 'Doado' },
  QUEBROU: { bg: '#fff3cd', color: '#856404', label: 'Quebrou' },
  ESTRAGOU: { bg: '#ffe5cc', color: '#cc5500', label: 'Estragou' },
  ROUBADA: { bg: '#e2d5f1', color: '#5a2d82', label: 'Roubado' },
  PERDIDA: { bg: '#e2e3e5', color: '#383d41', label: 'Perdido' },
};

const formatCurrency = (value: number) => {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const DisposalPDF = ({ disposals, committee }: { disposals: any[]; committee: any }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const totalItems = disposals.reduce((sum, d) => sum + d.quantity, 0);
  const totalValue = disposals.reduce((sum, d) => sum + Number(d.value), 0);

  const byReason: Record<string, { count: number; value: number }> = {};
  disposals.forEach(d => {
    if (!byReason[d.reason]) byReason[d.reason] = { count: 0, value: 0 };
    byReason[d.reason].count += d.quantity;
    byReason[d.reason].value += Number(d.value);
  });

  const itemsPerPage = 25;
  const totalPages = Math.ceil(disposals.length / itemsPerPage);

  const renderPage = (pageItems: any[], pageIndex: number) => (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.headerTitle}>PATRIMÔNIO DO REI</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Relatório de Descarte e Doação de Bens
        </Text>
        <Text style={styles.cnpjText}>
          {committee?.organization || 'Núcleo REI RABINO'} • CNPJ: {committee?.cnpj || '09.621.597/0001-66'}
        </Text>
        <Text style={styles.locationText}>
          {committee?.location || 'PERDIGÃO/MG'} • {currentDate}
        </Text>
      </View>

      {pageIndex === 0 && (
        <>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total de Itens</Text>
              <Text style={styles.summaryValue}>{totalItems}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valor Total</Text>
              <Text style={styles.summaryValueGold}>{formatCurrency(totalValue)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Registros</Text>
              <Text style={styles.summaryValue}>{disposals.length}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Por Motivo</Text>
          <View style={{ marginBottom: 10 }}>
            {Object.entries(byReason).map(([reason, stats]) => {
              const config = reasonConfig[reason] || { bg: '#e2e3e5', color: '#383d41', label: reason };
              return (
                <View key={reason} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 3, borderBottom: 0.5, borderColor: '#e5e5e5' }}>
                  <Text style={{ fontSize: 7, color: '#333333' }}>{config.label}</Text>
                  <Text style={{ fontSize: 7, color: '#666666' }}>{stats.count} itens • {formatCurrency(stats.value)}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Lista de Bens Descartados/Doações</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Descrição</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Qtd</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Valor</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Data</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Motivo</Text>
        </View>
        {pageItems.map((d, idx) => {
          const config = reasonConfig[d.reason] || { bg: '#e2e3e5', color: '#383d41', label: d.reason };
          return (
            <View key={d.id} style={idx % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <Text style={styles.tableCell}>{d.description}</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{d.quantity}</Text>
              <Text style={styles.tableCell}>{formatCurrency(Number(d.value))}</Text>
              <Text style={styles.tableCell}>{formatDate(d.date)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {pageIndex === totalPages - 1 && (
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VALOR TOTAL DOS BENS DESCARTADOS/DOADOS</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
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
        return renderPage(disposals.slice(start, end), i);
      })}
    </Document>
  );
};
