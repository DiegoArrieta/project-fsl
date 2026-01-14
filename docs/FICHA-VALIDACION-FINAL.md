# Ficha de Validación Final: Forestal Santa Lucía

**Objetivo:** Obtener el 100% de claridad táctica para iniciar el desarrollo del MVP.
**Fecha:** 12 de enero de 2026
**Estado:** Pendiente de revisión por el cliente

---

## 1. Confirmación de Supuestos Críticos
*Por favor, marque con una [X] si el supuesto es correcto. Si no lo es, favor comentar.*

- [X] **S1. Volumen de Operaciones:** Se asume que el volumen es manejable (< 50 operaciones al mes) y que un usuario único puede gestionarlo sin problemas.
- [X] **S2. Flujos de Trabajo:** Se asume que NO existen flujos de aprobación (ej: que un supervisor deba aprobar una venta). Todo lo que registre el usuario es válido.
- [X] **S3. Digitalización:** Se asume que el cliente tiene la capacidad de escanear o fotografiar todos los documentos (OC, Guías, Facturas) para subirlos al sistema.
- [X] **S4. Firma Digital:** El sistema NO gestionará firmas digitales. Las guías se firman físicamente y luego se sube la foto de la guía firmada.
- [X] **S5. Precios:** Los precios son informativos. El sistema no bloqueará operaciones si el margen es bajo o negativo.

---

## 2. Definiciones Tácticas Pendientes

**P1. Correlativo de Operaciones:**
¿Con qué número desea que comience el sistema?
- [X] OP-2026-00001 (Recomendado)
- [ ] Otro: ____________________

**P2. Definición del Botón "Cerrar Operación":**
¿Qué debe pasar exactamente cuando una operación se marca como "CERRADA"?
- [ ] a) Solo cambia el color a verde/check (visual).
- [ ] b) Se bloquea la edición de todo (documentos y pagos) para evitar cambios accidentales.
- [X] c) Se requiere que el sistema pida una "Observación de Cierre" obligatoria.

**P3. Emisión de Guías Propias:**
¿El sistema debe permitir GENERAR e IMPRIMIR una guía de despacho propia de FSL?
- [X] No, solo registramos las guías que ya vienen en papel.
- [ ] Sí, el sistema debe generar el documento para imprimir (requiere definir formato legal).

---

## 3. Muestras Necesarias (Muestrario Visual)
*Para configurar correctamente el lector de documentos y los campos, necesito ver una muestra (foto o PDF) de:*

1. **Guía de Despacho de Proveedor:** (Para ver dónde está el folio, fecha y detalle).
2. **Factura de Venta:** (Para ver el formato de impuestos y totales).
3. **Certificado NIMF-15:** (Para conocer el formato de este documento específico).

---

## 4. Acuerdo de Fecha de Corte

Se propone la siguiente estrategia para el inicio:
- **Fecha de Corte:** ___ / ___ / 2026
- **Acción:** No se migrarán datos antiguos. Todas las operaciones anteriores a esa fecha se siguen llevando en Excel. Las nuevas se ingresan 100% al sistema.

¿Está de acuerdo con esta estrategia? [ SÍ / NO ]

---

## Firma de Aceptación de Alcance

Al firmar este documento, el cliente valida que el **SDD v2.0** y esta **Ficha de Validación** representan la totalidad de lo que se construirá en el MVP.

| Nombre Cliente | Firma | Fecha |
|----------------|-------|-------|
|                |       |       |

---
*Este documento cierra la fase de definición y da inicio a la fase de construcción.*

