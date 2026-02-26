import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🔍 Verificando usuarios en la base de datos...")
  
  const usuarios = await prisma.usuario.findMany()
  console.log("\n📋 Usuarios encontrados:", usuarios.length)
  
  for (const u of usuarios) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("ID:", u.id)
    console.log("Email:", u.email)
    console.log("Nombre:", u.nombre)
    console.log("Rol:", u.rol)
    console.log("Activo:", u.activo)
    console.log("Password hash:", u.password.substring(0, 20) + "...")
    
    // Verificar contraseña
    const testPassword = "Princesa@lis1702"
    const isValid = await bcrypt.compare(testPassword, u.password)
    console.log("¿Contraseña 'Princesa@lis1702' válida?:", isValid)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
