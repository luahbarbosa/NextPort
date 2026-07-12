import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHashAdmin = await bcrypt.hash('123456', 10);
  const senhaHashMorador = await bcrypt.hash('senha123', 10);

  // 1. Criar Usuários
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@interfone.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@interfone.com',
      senhaHash: senhaHashAdmin,
      perfil: 'admin',
    },
  });

  const morador1 = await prisma.usuario.upsert({
    where: { email: 'gabriel@interfacil.com' },
    update: {},
    create: {
      nome: 'Gabriel Carvalho',
      email: 'gabriel@interfacil.com',
      senhaHash: senhaHashMorador,
      perfil: 'morador',
    },
  });

  const morador2 = await prisma.usuario.upsert({
    where: { email: 'laura@interfacil.com' },
    update: {},
    create: {
      nome: 'Laura Menezes',
      email: 'laura@interfacil.com',
      senhaHash: senhaHashMorador,
      perfil: 'morador',
    },
  });

  const morador3 = await prisma.usuario.upsert({
    where: { email: 'felipe@interfacil.com' },
    update: {},
    create: {
      nome: 'Felipe Andrade',
      email: 'felipe@interfacil.com',
      senhaHash: senhaHashMorador,
      perfil: 'morador',
    },
  });

  // 2. Criar Residências
  const apto001 = await prisma.residencia.upsert({
    where: { identificador: 'Apartamento 001' },
    update: {},
    create: {
      identificador: 'Apartamento 001',
      bloco: 'A',
      usuarioId: morador1.id,
      ativa: true,
    },
  });

  const apto002 = await prisma.residencia.upsert({
    where: { identificador: 'Apartamento 002' },
    update: {},
    create: {
      identificador: 'Apartamento 002',
      bloco: 'A',
      usuarioId: morador2.id,
      ativa: true,
    },
  });

  const apto003 = await prisma.residencia.upsert({
    where: { identificador: 'Apartamento 003' },
    update: {},
    create: {
      identificador: 'Apartamento 003',
      bloco: 'B',
      usuarioId: morador3.id,
      ativa: true,
    },
  });

  // 3. Criar Dispositivos (1 Portaria e 3 Residências)
  const portaria = await prisma.dispositivo.upsert({
    where: { androidId: 'PORTARIA-001' },
    update: {},
    create: {
      tipo: 'portaria',
      nomeDispositivo: 'Tablet Portaria Principal',
      androidId: 'PORTARIA-001',
      ipLocal: '192.168.1.10',
      ultimoPing: new Date(),
    },
  });

  const dispApto001 = await prisma.dispositivo.upsert({
    where: { androidId: 'APTO001-DEV1' },
    update: {},
    create: {
      tipo: 'residencia',
      residenciaId: apto001.id,
      nomeDispositivo: 'Celular Gabriel',
      androidId: 'APTO001-DEV1',
      ipLocal: '192.168.1.101',
      ultimoPing: new Date(),
    },
  });

  const dispApto002 = await prisma.dispositivo.upsert({
    where: { androidId: 'APTO002-DEV1' },
    update: {},
    create: {
      tipo: 'residencia',
      residenciaId: apto002.id,
      nomeDispositivo: 'Celular Laura',
      androidId: 'APTO002-DEV1',
      ipLocal: '192.168.1.102',
      ultimoPing: new Date(Date.now() - 500000), // offline
    },
  });

  const dispApto003 = await prisma.dispositivo.upsert({
    where: { androidId: 'APTO003-DEV1' },
    update: {},
    create: {
      tipo: 'residencia',
      residenciaId: apto003.id,
      nomeDispositivo: 'Celular Felipe',
      androidId: 'APTO003-DEV1',
      ipLocal: '192.168.1.103',
      ultimoPing: new Date(),
    },
  });

  // 4. Criar Chamadas de Exemplo
  const chamadasCount = await prisma.chamada.count();
  if (chamadasCount === 0) {
    const agora = new Date();
    const cincoMinAtras = new Date(agora.getTime() - 5 * 60000);
    const dezMinAtras = new Date(agora.getTime() - 10 * 60000);

    // Chamada Atendida (Portaria -> Apto 1)
    await prisma.chamada.create({
      data: {
        dispositivoOrigemId: portaria.id,
        dispositivoDestinoId: dispApto001.id,
        iniciadoEm: dezMinAtras,
        atendidoEm: new Date(dezMinAtras.getTime() + 15000),
        encerradoEm: new Date(dezMinAtras.getTime() + 60000),
        status: 'atendida',
      },
    });

    // Chamada Não Atendida (Portaria -> Apto 2)
    await prisma.chamada.create({
      data: {
        dispositivoOrigemId: portaria.id,
        dispositivoDestinoId: dispApto002.id,
        iniciadoEm: cincoMinAtras,
        status: 'nao_atendida',
      },
    });

    // Chamada Recusada (Portaria -> Apto 3)
    await prisma.chamada.create({
      data: {
        dispositivoOrigemId: portaria.id,
        dispositivoDestinoId: dispApto003.id,
        iniciadoEm: agora,
        atendidoEm: new Date(agora.getTime() + 10000),
        encerradoEm: new Date(agora.getTime() + 10000),
        status: 'recusada',
      },
    });
  }

  // 5. Criar Notificações de Exemplo
  const notificacoesCount = await prisma.notificacao.count();
  if (notificacoesCount === 0) {
    await prisma.notificacao.create({
      data: {
        dispositivoId: dispApto001.id,
        tipo: 'chamada',
        mensagem: 'Chamada perdida de Portaria Principal',
        lida: false,
        criadoEm: new Date(),
      }
    });
    await prisma.notificacao.create({
      data: {
        dispositivoId: dispApto003.id,
        tipo: 'sistema',
        mensagem: 'Atualização do sistema disponível para a versão v1.1.0',
        lida: true,
        criadoEm: new Date(),
      }
    });
  }

  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
