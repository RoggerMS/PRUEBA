const fs = require('fs');
const path = require('path');

// Lista de archivos de rutas API que necesitan configuración dinámica
const apiRoutes = [
  'app/api/workspace/frases/items/[id]/route.ts',
  'app/api/workspace/frases/items/route.ts',
  'app/api/workspace/docs/pages/[id]/route.ts',
  'app/api/workspace/kanban/columns/route.ts',
  'app/api/workspace/kanban/cards/[id]/route.ts',
  'app/api/workspace/blocks/route.ts',
  'app/api/feed/[id]/save/route.ts',
  'app/api/notifications/read-all/route.ts',
  'app/api/feed/[id]/fire/route.ts',
  'app/api/feed/route.ts',
  'app/api/workspace/blocks/[id]/route.ts',
  'app/api/workspace/docs/pages/route.ts',
  'app/api/workspace/boards/[id]/route.ts',
  'app/api/workspace/kanban/cards/route.ts',
  'app/api/notifications/[id]/read/route.ts',
  'app/api/feed/[id]/comments/route.ts',
  'app/api/workspace/kanban/columns/[id]/route.ts',
  'app/api/notifications/route.ts',
  'app/api/feed/[id]/share/route.ts',
  'app/api/workspace/boards/route.ts'
];

const dynamicConfig = `
// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
`;

apiRoutes.forEach(routePath => {
  const fullPath = path.join(__dirname, routePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Verificar si ya tiene la configuración dinámica
    if (!content.includes('export const dynamic')) {
      // Encontrar la posición después de los imports
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Buscar el último import
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('} from ')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          // Línea vacía después de imports
          break;
        }
      }
      
      // Insertar la configuración dinámica
      lines.splice(insertIndex, 0, dynamicConfig);
      
      const newContent = lines.join('\n');
      fs.writeFileSync(fullPath, newContent, 'utf8');
      
      console.log(`✅ Configuración dinámica agregada a: ${routePath}`);
    } else {
      console.log(`⏭️  Ya configurado: ${routePath}`);
    }
  } else {
    console.log(`❌ No encontrado: ${routePath}`);
  }
});

console.log('\n🎉 Proceso completado!');