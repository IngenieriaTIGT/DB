import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import TrabajoDetalleClient from "./TrabajoDetalleClient"

async function TrabajoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  const trabajoRaw = await prisma.trabajo.findUnique({
    where: { id },
    include: {
      cliente: true,
      tipoServicio: true,
      documentos: true
    }
  })

  if (!trabajoRaw) {
    notFound()
  }

  // Parsear datos JSON
  const trabajo = {
    ...trabajoRaw,
    datos: typeof trabajoRaw.datos === 'string' ? JSON.parse(trabajoRaw.datos) : trabajoRaw.datos,
    tipoServicio: {
      ...trabajoRaw.tipoServicio,
      campos: typeof trabajoRaw.tipoServicio.campos === 'string' 
        ? JSON.parse(trabajoRaw.tipoServicio.campos) 
        : trabajoRaw.tipoServicio.campos
    }
  }

  return <TrabajoDetalleClient trabajo={trabajo as any} />
}

export default TrabajoDetallePage