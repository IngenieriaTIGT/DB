import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando seed...")

  // Crear usuario admin
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@poligrafo.com" },
    update: {},
    create: {
      email: "admin@poligrafo.com",
      password: adminPassword,
      nombre: "Administrador",
      rol: "ADMIN"
    }
  })
  console.log("✅ Usuario admin creado:", admin.email)

  // Crear tipos de servicio por defecto (campos como JSON string)
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
  console.log("✅ Tipo de servicio creado:", tipoPoligrafo.nombre)

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
  console.log("✅ Tipo de servicio creado:", tipoVisita.nombre)

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
  console.log("✅ Tipo de servicio creado:", tipoAntecedentes.nombre)

  console.log("🎉 Seed completado!")
  console.log("\n📋 Credenciales de acceso:")
  console.log("   Admin: admin@poligrafo.com / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })