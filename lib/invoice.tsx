import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, padding: 40, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  companyMeta: { fontSize: 8, color: "#6b7280", marginTop: 3 },
  invoiceTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#4f46e5", textAlign: "right" },
  invoiceMeta: { fontSize: 8, color: "#6b7280", textAlign: "right", marginTop: 3 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  addressLine: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  table: { marginTop: 4 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 4, paddingVertical: 6, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  colProduct: { flex: 1 },
  colQty: { width: 50, textAlign: "center" },
  colPrice: { width: 70, textAlign: "right" },
  colTotal: { width: 70, textAlign: "right" },
  thText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  tdText: { fontSize: 9, color: "#374151" },
  totalsBox: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  totalLabel: { fontSize: 9, color: "#6b7280", width: 120, textAlign: "right", paddingRight: 12 },
  totalValue: { fontSize: 9, color: "#374151", width: 80, textAlign: "right" },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a1a1a", width: 120, textAlign: "right", paddingRight: 12 },
  grandValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#4f46e5", width: 80, textAlign: "right" },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10, fontSize: 7, color: "#9ca3af", textAlign: "center" },
});

function formatTRY(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

type OrderItem = { productId: number; name: string; price: number; quantity: number };
type Address = { fullName?: string; street: string; city: string; district: string; postalCode: string; country: string } | null;

type InvoiceProps = {
  orderNumber: string;
  createdAt: Date | string;
  customerName: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  siteName: string;
};

export function InvoiceDocument({
  orderNumber, createdAt, customerName, address, items, subtotal, discount, total, siteName,
}: InvoiceProps) {
  const date = new Date(createdAt).toLocaleDateString("tr-TR");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{siteName}</Text>
            <Text style={styles.companyMeta}>Mezoterapi Ürünleri</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FATURA</Text>
            <Text style={styles.invoiceMeta}>#{orderNumber}</Text>
            <Text style={styles.invoiceMeta}>{date}</Text>
          </View>
        </View>

        {/* Billing address */}
        {address && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fatura Adresi</Text>
            <Text style={styles.addressLine}>{address.fullName ?? customerName}</Text>
            <Text style={styles.addressLine}>{address.street}</Text>
            <Text style={styles.addressLine}>{address.district}, {address.city} {address.postalCode}</Text>
            <Text style={styles.addressLine}>{address.country}</Text>
          </View>
        )}

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, styles.colProduct]}>Ürün</Text>
            <Text style={[styles.thText, styles.colQty]}>Adet</Text>
            <Text style={[styles.thText, styles.colPrice]}>Birim Fiyat</Text>
            <Text style={[styles.thText, styles.colTotal]}>Toplam</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tdText, styles.colProduct]}>{item.name}</Text>
              <Text style={[styles.tdText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tdText, styles.colPrice]}>{formatTRY(item.price)}</Text>
              <Text style={[styles.tdText, styles.colTotal]}>{formatTRY(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Ara Toplam</Text>
            <Text style={styles.totalValue}>{formatTRY(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>İndirim</Text>
              <Text style={styles.totalValue}>-{formatTRY(discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.grandLabel}>Genel Toplam</Text>
            <Text style={styles.grandValue}>{formatTRY(total)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Bu belge elektronik olarak oluşturulmuştur. • {siteName}</Text>
      </Page>
    </Document>
  );
}
