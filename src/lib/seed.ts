import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // ==========================================
  // SUPER ADMIN - Ingeniería TI GT
  // ==========================================
  const superAdminPassword = await bcrypt.hash("Princesa@lis1702", 10)
  const superAdmin = await prisma.usuario.upsert({
    where: { email: "administrador@ingenieriatigt.com" },
    update: {},
    create: {
      email: "administrador@ingenieriatigt.com",
      password: superAdminPassword,
      nombre: "super_admin",
      rol: "SUPER_ADMIN"
    }
  })
  console.log("✅ Super Admin creado:", superAdmin.email)

  // ==========================================
  // ADMIN - CT Consultores
  // Se crea manualmente desde el panel de SUPER_ADMIN
  // ==========================================
  // El administrador de CT Consultores se crea manualmente
  // desde el panel de administración con las credenciales que el cliente defina

  // ==========================================
  // TIPOS DE SERVICIO
  // ==========================================
  
  // 1. Polígrafo
  const tipoPoligrafo = await prisma.tipoServicio.upsert({
    where: { nombre: "Polígrafo" },
    update: {},
    create: {
      nombre: "Polígrafo",
      descripcion: "Evaluación mediante polígrafo para verificación de veracidad",
      campos: JSON.stringify([
        { nombre: "nombreEvaluado", label: "Nombre del Evaluado", tipo: "texto", requerido: true },
        { nombre: "identificacion", label: "Número de Identificación", tipo: "texto", requerido: true },
        { nombre: "tipoExamen", label: "Tipo de Examen", tipo: "select", requerido: true, opciones: ["Pre-empleo", "Rutinario", "Específico", "Seguimiento"] },
        { nombre: "resultado", label: "Resultado", tipo: "select", requerido: true, opciones: ["Aprobado", "No Aprobado", "Inconcluso"] },
        { nombre: "observaciones", label: "Observaciones", tipo: "textarea", requerido: false }
      ])
    }
  })
  console.log("✅ Tipo de servicio:", tipoPoligrafo.nombre)

  // 2. Visita Socioeconómica
  const tipoVisita = await prisma.tipoServicio.upsert({
    where: { nombre: "Visita Socioeconómica" },
    update: {},
    create: {
      nombre: "Visita Socioeconómica",
      descripcion: "Investigación socioeconómica mediante visita domiciliaria",
      campos: JSON.stringify([
        { nombre: "direccion", label: "Dirección Visitada", tipo: "texto", requerido: true },
        { nombre: "nombreVisitado", label: "Nombre del Visitado", tipo: "texto", requerido: true },
        { nombre: "parentesco", label: "Parentesco/Relación", tipo: "texto", requerido: true },
        { nombre: "tipoVivienda", label: "Tipo de Vivienda", tipo: "select", requerido: true, opciones: ["Propia", "Alquilada", "Familiar", "Otro"] },
        { nombre: "ingresosMensuales", label: "Ingresos Mensuales", tipo: "numero", requerido: false },
        { nombre: "numeroHabitantes", label: "Número de Habitantes", tipo: "numero", requerido: false },
        { nombre: "observacionesVivienda", label: "Observaciones de la Vivienda", tipo: "textarea", requerido: false }
      ])
    }
  })
  console.log("✅ Tipo de servicio:", tipoVisita.nombre)

  // 3. Investigación de Antecedentes
  const tipoAntecedentes = await prisma.tipoServicio.upsert({
    where: { nombre: "Investigación de Antecedentes" },
    update: {},
    create: {
      nombre: "Investigación de Antecedentes",
      descripcion: "Investigación de antecedentes laborales, penales y personales",
      campos: JSON.stringify([
        { nombre: "nombreInvestigado", label: "Nombre del Investigado", tipo: "texto", requerido: true },
        { nombre: "identificacion", label: "Número de Identificación", tipo: "texto", requerido: true },
        { nombre: "antecedentesPenales", label: "Antecedentes Penales", tipo: "select", requerido: true, opciones: ["Sin antecedentes", "Con antecedentes", "En investigación"] },
        { nombre: "antecedentesLaborales", label: "Verificación Laboral", tipo: "select", requerido: true, opciones: ["Verificado", "No verificado", "Inconsistencias"] },
        { nombre: "observaciones", label: "Observaciones", tipo: "textarea", requerido: false }
      ])
    }
  })
  console.log("✅ Tipo de servicio:", tipoAntecedentes.nombre)

  // 4. Verificación de Empleo
  const tipoVerificacion = await prisma.tipoServicio.upsert({
    where: { nombre: "Verificación de Empleo" },
    update: {},
    create: {
      nombre: "Verificación de Empleo",
      descripcion: "Verificación de historial laboral y referencias profesionales",
      campos: JSON.stringify([
        { nombre: "nombreCandidato", label: "Nombre del Candidato", tipo: "texto", requerido: true },
        { nombre: "empresaAnterior", label: "Empresa Anterior", tipo: "texto", requerido: true },
        { nombre: "puesto", label: "Puesto Desempeñado", tipo: "texto", requerido: false },
        { nombre: "periodo", label: "Período Laboral", tipo: "texto", requerido: false },
        { nombre: "motivoSalida", label: "Motivo de Salida", tipo: "texto", requerido: false },
        { nombre: "observaciones", label: "Observaciones", tipo: "textarea", requerido: false }
      ])
    }
  })
  console.log("✅ Tipo de servicio:", tipoVerificacion.nombre)

  console.log("\n🎉 Seed completado!")
  console.log("\n📋 CREDENCIALES DE ACCESO:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("🔧 SUPER ADMIN (Ingeniería TI GT):")
  console.log("   Email: administrador@ingenieriatigt.com")
  console.log("   Password: Princesa@lis1702")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("🏢 ADMIN (CT Consultores):")
  console.log("   Se crea manualmente desde el panel de administración")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
