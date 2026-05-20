import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { marginBottom: 30, borderBottom: 3, borderColor: '#d4af37', paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  crown: { fontSize: 28, marginRight: 10, color: '#d4af37' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', letterSpacing: 2 },
  headerSubtitle: { fontSize: 11, color: '#666666', textAlign: 'center', marginTop: 5, letterSpacing: 1 },
  headerLocation: { fontSize: 10, color: '#999999', textAlign: 'center', marginTop: 3 },
  cnpjText: { fontSize: 10, color: '#666666', textAlign: 'center', marginTop: 3 },
  assetSection: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#d4af37', marginBottom: 12, paddingBottom: 5, borderBottom: 1, borderColor: '#e5e5e5', letterSpacing: 1 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoItem: { width: '48%', marginBottom: 12 },
  infoLabel: { fontSize: 8, color: '#999999', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 11, color: '#333333', fontWeight: 'bold' },
  tagBox: { backgroundColor: '#d4af37', padding: 12, borderRadius: 6, marginBottom: 20, textAlign: 'center' },
  tagLabel: { fontSize: 9, color: '#ffffff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  tagNumber: { fontSize: 24, color: '#ffffff', fontWeight: 'bold', letterSpacing: 3 },
  financialBox: { backgroundColor: '#f8f6f0', border: 1, borderColor: '#d4af37', borderRadius: 6, padding: 15, marginBottom: 20 },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  financialLabel: { fontSize: 9, color: '#666666', fontWeight: 'bold' },
  financialValue: { fontSize: 11, color: '#d4af37', fontWeight: 'bold' },
  statusBadge: { padding: 6, borderRadius: 4, textAlign: 'center', marginBottom: 15 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  committeeSection: { marginTop: 40, borderTop: 2, borderColor: '#d4af37', paddingTop: 20 },
  committeeTitle: { fontSize: 12, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', marginBottom: 15, letterSpacing: 1 },
  committeeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  committeeMember: { width: '48%', marginBottom: 20, textAlign: 'center' },
  memberRole: { fontSize: 7, color: '#999999', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  memberName: { fontSize: 9, color: '#333333', fontWeight: 'bold' },
  signatureLine: { borderTop: 1, borderColor: '#cccccc', marginTop: 30, paddingTop: 5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', borderTop: 1, borderColor: '#e5e5e5', paddingTop: 10 },
  footerText: { fontSize: 7, color: '#999999', letterSpacing: 0.5 },
});

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE: { bg: '#d4edda', color: '#155724', label: 'ATIVO' },
  IN_USE: { bg: '#cce5ff', color: '#004085', label: 'EM USO' },
  MAINTENANCE: { bg: '#fff3cd', color: '#856404', label: 'MANUTENÇÃO' },
  RETIRED: { bg: '#e2e3e5', color: '#383d41', label: 'BAIXADO' },
  MISSING: { bg: '#f8d7da', color: '#721c24', label: 'EXTRAVIADO' },
  RESERVE: { bg: '#d1ecf1', color: '#0c5460', label: 'RESERVA' },
};

const formatCurrency = (value: number | null) => {
  if (!value) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const AssetPDF = ({ asset, committee }: { asset: any; committee: any }) => {
  const status = statusConfig[asset.status] || { bg: '#e2e3e5', color: '#383d41', label: asset.status };
  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.crown}>👑</Text>
            <Text style={styles.headerTitle}>PATRIMÔNIO DO REI</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Comissão de Patrimônio do {committee?.organization || 'Núcleo REI RABINO'}
          </Text>
          <Text style={styles.cnpjText}>
            CNPJ: {committee?.cnpj || '09.621.597/0001-66'}
          </Text>
          <Text style={styles.headerLocation}>
            {committee?.location || 'PERDIGÃO/MG'} • {currentDate}
          </Text>
        </View>

        <View style={styles.tagBox}>
          <Text style={styles.tagLabel}>Código do Patrimônio</Text>
          <Text style={styles.tagNumber}>{asset.tagNumber}</Text>
        </View>

        <View style={styles.assetSection}>
          <Text style={styles.sectionTitle}>Informações do Bem</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nome do Item</Text>
              <Text style={styles.infoValue}>{asset.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Categoria</Text>
              <Text style={styles.infoValue}>{asset.category || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Subcategoria</Text>
              <Text style={styles.infoValue}>{asset.subcategory || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Marca</Text>
              <Text style={styles.infoValue}>{asset.brand || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Modelo</Text>
              <Text style={styles.infoValue}>{asset.model || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Número de Série</Text>
              <Text style={styles.infoValue}>{asset.serialNumber || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Código Interno</Text>
              <Text style={styles.infoValue}>{asset.internalCode || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Código de Barras</Text>
              <Text style={styles.infoValue}>{asset.barcode || '-'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            Status: {status.label}
          </Text>
        </View>

        <View style={styles.financialBox}>
          <Text style={styles.sectionTitle}>Informações Financeiras</Text>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Valor de Aquisição</Text>
            <Text style={styles.financialValue}>{formatCurrency(asset.acquisitionValue)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Valor Atual</Text>
            <Text style={styles.financialValue}>{formatCurrency(asset.currentValue)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Data de Aquisição</Text>
            <Text style={styles.financialValue}>{formatDate(asset.acquisitionDate)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Nota Fiscal</Text>
            <Text style={styles.financialValue}>{asset.invoiceNumber || '-'}</Text>
          </View>
          {asset.warrantyDate && (
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Garantia até</Text>
              <Text style={styles.financialValue}>{formatDate(asset.warrantyDate)}</Text>
            </View>
          )}
        </View>

        <View style={styles.assetSection}>
          <Text style={styles.sectionTitle}>Localização e Responsáveis</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Localização Física</Text>
              <Text style={styles.infoValue}>{asset.physicalLocation || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Responsável</Text>
              <Text style={styles.infoValue}>{asset.responsibleName || '-'}</Text>
            </View>
          </View>
        </View>

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

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Documento gerado automaticamente pelo Sistema Patrimônio do Rei • {currentDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
