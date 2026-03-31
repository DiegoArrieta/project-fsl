/**
 * Estilos base compartidos para documentos comerciales (presupuesto, orden de compra, etc.).
 * Tema Forestal: verde #2d5016.
 */
export function getDocumentoPdfBaseStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 12px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2d5016;
    }
    .logo {
      font-size: 22px;
      font-weight: bold;
      color: #2d5016;
    }
    .header-info {
      text-align: right;
    }
    .header-info h1 {
      font-size: 18px;
      color: #2d5016;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .header-info div {
      margin-bottom: 3px;
    }
    .presupuesto-info {
      margin-bottom: 24px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      width: 140px;
      flex-shrink: 0;
      color: #2d5016;
    }
    .counterparty-section {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 5px;
      border-left: 4px solid #2d5016;
    }
    .counterparty-section h2 {
      font-size: 14px;
      color: #2d5016;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #2d5016;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
      vertical-align: middle;
    }
    th.numeric,
    td.numeric {
      text-align: right;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .line-detail {
      font-size: 11px;
      color: #555;
      margin-top: 4px;
      display: block;
      line-height: 1.4;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
      padding: 5px 0;
    }
    .total-label {
      font-weight: bold;
      width: 150px;
      text-align: right;
      margin-right: 20px;
    }
    .total-value {
      width: 150px;
      text-align: right;
      font-weight: bold;
    }
    .total-final {
      font-size: 16px;
      color: #2d5016;
      border-top: 2px solid #2d5016;
      padding-top: 10px;
      margin-top: 10px;
    }
    .observaciones {
      margin-top: 30px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
      border-left: 4px solid #2d5016;
    }
    .observaciones h3 {
      font-size: 14px;
      color: #2d5016;
      margin-bottom: 10px;
    }
    .observaciones p {
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
    .empresa-emisor {
      margin-bottom: 16px;
      font-size: 11px;
      color: #555;
    }
    .empresa-emisor strong {
      color: #2d5016;
    }
`
}

export function getPdfFooterText(): { linea1: string; linea2: string } {
  return {
    linea1: 'Forestal Santa Lucía SpA — Sistema de Gestión Operativa',
    linea2: 'Documento generado automáticamente',
  }
}
