import fs from 'fs'
import path from 'path'

const LOGO_FILE = path.join(process.cwd(), 'public', 'brand', 'logo.jpg')

/**
 * Data URL del logo para incrustar en HTML de PDFs (Puppeteer).
 * Retorna null si no existe el archivo.
 */
export function getEmpresaPdfLogoDataUrl(): string | null {
  try {
    if (!fs.existsSync(LOGO_FILE)) return null
    const buf = fs.readFileSync(LOGO_FILE)
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}
