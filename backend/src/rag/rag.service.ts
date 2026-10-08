import { pipeline } from '@xenova/transformers';

// Nuestra base de conocimiento de la empresa (Documentos a vectorizar)
const hrPolicies = [
  {
    id: "VAC-01",
    title: "Política de Vacaciones",
    content: "Todos los empleados de tiempo completo tienen derecho a 15 días de vacaciones pagadas al año. Las vacaciones deben solicitarse con al menos 2 semanas de anticipación en el sistema."
  },
  {
    id: "MED-01",
    title: "Trámite de Incapacidad",
    content: "Los empleados tienen derecho a incapacidad pagada. Si la enfermedad supera los 3 días consecutivos, se requiere un certificado médico del IMSS o seguro privado. Para iniciar el trámite, el empleado debe notificar a RRHH el primer día de ausencia."
  },
  {
    id: "REM-01",
    title: "Trabajo Remoto",
    content: "El equipo de ingeniería (Engineering) puede hacer trabajo remoto hasta 4 días a la semana. El equipo de Marketing puede hacer remoto 2 días a la semana."
  }
];

let extractor: any = null;

// Inicializa el modelo de embeddings localmente (Descarga el modelo la primera vez)
async function getExtractor() {
  if (!extractor) {
    // Usamos el modelo all-MiniLM-L6-v2, estándar en la industria para RAG rápido
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

// Similitud Coseno para comparar vectores matemáticamente
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchPoliciesRAG(query: string) {
  const extract = await getExtractor();
  
  // 1. Vectorizar la pregunta del usuario
  const queryResult = await extract(query, { pooling: 'mean', normalize: true });
  const queryEmbedding = Array.from(queryResult.data) as number[];

  // 2. Vectorizar y comparar contra todas las políticas (En producción esto vive en una DB Vectorial)
  const results = [];
  for (const policy of hrPolicies) {
    const policyResult = await extract(policy.content, { pooling: 'mean', normalize: true });
    const policyEmbedding = Array.from(policyResult.data) as number[];
    
    const similarity = cosineSimilarity(queryEmbedding, policyEmbedding);
    results.push({ ...policy, similarity });
  }

  // 3. Ordenar por relevancia
  results.sort((a, b) => b.similarity - a.similarity);
  
  // Retornar los top 2 resultados más relevantes
  return results.slice(0, 2);
}
