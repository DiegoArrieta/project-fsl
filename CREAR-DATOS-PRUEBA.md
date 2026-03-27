# Crear Datos de Prueba Reales

## Problema
Los botones de descarga PDF funcionan pero los datos mock usan IDs simples ("1", "2") que no son UUIDs válidos para la base de datos.

## Solución: Crear datos reales

### Paso 1: Crear un Proveedor
```bash
curl -X POST http://localhost:3000/api/proveedores \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "765432109",
    "razonSocial": "Maderera Los Pinos Ltda",
    "nombreFantasia": "Los Pinos",
    "direccion": "Av. Principal 456",
    "comuna": "Puerto Montt",
    "ciudad": "Puerto Montt",
    "telefono": "+56 9 8765 4321",
    "email": "ventas@lospinos.cl"
  }'
```

**Guardar el ID del proveedor** que te devuelve (será un UUID).

### Paso 2: Crear una Orden de Compra

Primero, obtén el ID de un tipo de pallet:
```bash
# Ver tipos de pallet disponibles
curl http://localhost:3000/api/tipos-pallet
```

Luego crea la orden:
```bash
curl -X POST http://localhost:3000/api/ordenes-compra \
  -H "Content-Type: application/json" \
  -d '{
    "proveedorId": "UUID-DEL-PROVEEDOR",
    "fecha": "2026-01-27",
    "fechaEntrega": "2026-02-05",
    "direccionEntrega": "Bodega Central, Puerto Montt",
    "observaciones": "Orden de prueba",
    "productos": [
      {
        "tipoPalletId": "UUID-DEL-TIPO-PALLET",
        "cantidad": 500,
        "precioUnitario": 5500,
        "descripcion": "Pallets estándar 1200x1000"
      }
    ]
  }'
```

**Guardar el ID de la orden** (será un UUID).

### Paso 3: Descargar el PDF

Ahora sí puedes descargar el PDF:
```bash
curl -o orden.pdf http://localhost:3000/api/ordenes-compra/UUID-DE-LA-ORDEN/descargar-pdf
```

O en el navegador:
```
http://localhost:3000/api/ordenes-compra/UUID-DE-LA-ORDEN/descargar-pdf
```

---

## Alternativa: Script de Seed

Puedes ejecutar el seed para crear datos de prueba:

```bash
cd ops-platform
npm run db:seed
```

Esto creará:
- ✅ Tipos de pallet
- ✅ Usuario admin
- ✅ Proveedor de ejemplo
- ✅ Cliente de ejemplo

Luego crea órdenes de compra desde la UI:
1. Ve a http://localhost:3000/ordenes-compra/nueva
2. Completa el formulario
3. Guarda la orden
4. Descarga el PDF

---

## Ver Órdenes Existentes en la BD

```bash
# Desde psql
psql -U fsl_user -d fsl_db -c "SELECT id, numero, estado FROM orden_compra;"
```

O crea un endpoint para listar:
```bash
curl http://localhost:3000/api/ordenes-compra
```





