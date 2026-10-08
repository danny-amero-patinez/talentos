import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { executeQuery } from "./db/database";
import { searchPoliciesRAG } from "./rag/rag.service";

// Inicializar el servidor MCP
const server = new McpServer({
  name: "TalentOS-HR-Tools",
  version: "2.0.0" // Actualizado a la V2 con las nuevas herramientas
});

// ----------------------------------------------------
// 1. TOOL EXISTENTE: El Reclutador (Decisiones y Feedback)
// ----------------------------------------------------
server.tool(
  "generate_candidate_feedback",
  "Generates a professional email report or rejection letter based on the AI candidate evaluation JSON.",
  {
    final_recommendation: z.enum(["STRONG_HIRE", "HIRE", "NO_HIRE", "HUMAN_REVIEW_REQUIRED"]),
    candidate_name: z.string().optional().default("the candidate"),
    executive_summary: z.string(),
    key_strengths: z.array(z.string()),
    areas_for_improvement: z.array(z.string()),
  },
  async (args) => {
    const { final_recommendation, candidate_name, executive_summary, key_strengths, areas_for_improvement } = args;

    let emailSubject = "";
    let emailBody = "";

    if (final_recommendation === "NO_HIRE") {
      emailSubject = `Update regarding your application - TalentOS`;
      emailBody = `Dear ${candidate_name},\n\nThank you for taking the time to interview with us and for participating in our AI-driven technical assessment.\n\nWhile we appreciated learning about your experience, we have decided to move forward with other candidates who more closely match the specific technical requirements for this role at this time.\n\nWe wish you the best of luck in your job search.\n\nBest regards,\nTalentOS HR Team`;
    } else {
      emailSubject = `Next Steps for ${candidate_name} - TalentOS`;
      emailBody = `Dear ${candidate_name},\n\nThank you for an excellent interview session! Our team was very impressed with your results.\n\nExecutive Summary:\n${executive_summary}\n\nWe noted your key strengths in:\n${key_strengths.map(s => `- ${s}`).join("\n")}\n\nOur HR team will be reaching out shortly to schedule your final team fit interview.\n\nBest regards,\nTalentOS HR Team`;
    }

    const internalReport = `[INTERNAL HR REPORT]\nRecommendation: ${final_recommendation}\nSummary: ${executive_summary}\nStrengths: ${key_strengths.join(", ")}\nAreas for Growth: ${areas_for_improvement.join(", ")}\n\n[DRAFTED EMAIL TO CANDIDATE]\nSubject: ${emailSubject}\n\n${emailBody}`;

    return {
      content: [{ type: "text", text: internalReport }]
    };
  }
);

// ----------------------------------------------------
// 2. NUEVA TOOL: Operaciones Internas (Simulador de DB)
// ----------------------------------------------------
server.tool(
  "query_employee_database",
  "Ejecuta una consulta SQL SELECT real en la base de datos de la empresa. La tabla se llama 'employees'. Columnas disponibles: id, name, email, vacation_days_balance, department.",
  {
    sql_query: z.string().describe("Consulta SQL SELECT a ejecutar. Ej: SELECT * FROM employees WHERE name LIKE '%Juan%';")
  },
  async ({ sql_query }) => {
    try {
      const results = executeQuery(sql_query);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (e: any) {
      return {
        content: [{ type: "text", text: `Error ejecutando SQL: ${e.message}` }]
      };
    }
  }
);

// ----------------------------------------------------
// 3. NUEVA TOOL: Motor RAG (Búsqueda Semántica Vectorial)
// ----------------------------------------------------
server.tool(
  "search_hr_policies",
  "Realiza una búsqueda semántica (RAG) matemática usando embeddings vectoriales en los documentos oficiales de políticas de RRHH.",
  {
    semantic_query: z.string().describe("Pregunta o concepto a buscar, ej: '¿Qué hago si me enfermo tres días?'")
  },
  async ({ semantic_query }) => {
    try {
      const results = await searchPoliciesRAG(semantic_query);
      // Formateamos los resultados para que el LLM los pueda leer y procesar
      const textResponse = results
        .map(r => `[Documento: ${r.title}]\nRelevancia Vectorial: ${Math.round(r.similarity * 100)}%\nRegla de la empresa: ${r.content}`)
        .join('\n\n');
        
      return {
        content: [{ type: "text", text: textResponse }]
      };
    } catch (e: any) {
      return {
        content: [{ type: "text", text: `Error en la búsqueda RAG: ${e.message}` }]
      };
    }
  }
);

// Iniciar el servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 TalentOS MCP Server is running on stdio (Now with Real DB & Vectorial RAG)");
}

main().catch(console.error);
