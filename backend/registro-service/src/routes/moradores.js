const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { prisma } = require('shared-db')

// Helper para remover a senha hash do objeto do usuário
function sanitizarUsuario(usuario) {
  if (!usuario) return null;
  const user = { ...usuario };
  delete user.senhaHash;
  delete user.senha;
  return user;
}

// Helper para encontrar residência por identificação flexível
async function buscarResidenciaFlexivel(apartamento) {
  if (!apartamento) return null;
  const query = String(apartamento).trim().toLowerCase();
  
  // Buscar todas as residências no banco
  const residencias = await prisma.residencia.findMany();
  
  // Encontrar a primeira residência que corresponda de forma flexível
  return residencias.find(res => {
    const ident = res.identificador.toLowerCase();
    // Ex: "001" contido em "Apartamento 001", ou "Apartamento 001" contendo "Apartamento 001"
    return ident.includes(query) || query.includes(ident);
  });
}

// 1. Listar Moradores
router.get('/', async (req, res) => {
  try {
    const moradores = await prisma.usuario.findMany({
      where: { perfil: 'morador' },
      include: { residencias: true }
    });
    res.json(moradores.map(sanitizarUsuario));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 2. Buscar Morador por ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const morador = await prisma.usuario.findFirst({
      where: { id, perfil: 'morador' },
      include: { residencias: true }
    });

    if (!morador) {
      return res.status(404).json({ erro: 'Morador não encontrado' });
    }

    res.json(sanitizarUsuario(morador));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 3. Cadastrar Morador
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, email, senha, andar, apartamento } = req.body;

    // Validações básicas
    if (!nome || !cpf || !email || !senha || !andar || !apartamento) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios (nome, cpf, email, senha, andar, apartamento).' });
    }

    // Busca residência flexível
    const residencia = await buscarResidenciaFlexivel(apartamento);
    if (!residencia) {
      return res.status(400).json({ 
        erro: `A residência "${apartamento}" não está cadastrada. Por favor, informe um apartamento válido (ex: 001, 002 ou 003).` 
      });
    }

    // Impedir e-mails duplicados
    const emailExistente = await prisma.usuario.findUnique({
      where: { email }
    });
    if (emailExistente) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar morador
    const morador = await prisma.usuario.create({
      data: {
        nome,
        cpf,
        email,
        senhaHash,
        perfil: 'morador'
      }
    });

    // Associar residência ao novo morador
    await prisma.residencia.update({
      where: { id: residencia.id },
      data: { usuarioId: morador.id }
    });

    // Retorna morador com residência incluída
    const moradorCompleto = await prisma.usuario.findUnique({
      where: { id: morador.id },
      include: { residencias: true }
    });

    res.status(201).json(sanitizarUsuario(moradorCompleto));
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno inesperado: ' + err.message });
  }
});

// 4. Editar Morador
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, cpf, email, senha, andar, apartamento } = req.body;

    const moradorExistente = await prisma.usuario.findFirst({
      where: { id, perfil: 'morador' }
    });
    if (!moradorExistente) {
      return res.status(404).json({ erro: 'Morador não encontrado' });
    }

    // Validar e-mail duplicado
    if (email && email !== moradorExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({ where: { email } });
      if (emailExistente) {
        return res.status(409).json({ erro: 'Este e-mail já está em uso por outro usuário.' });
      }
    }

    // Validar e buscar residência nova
    let residenciaNova = null;
    if (apartamento) {
      residenciaNova = await buscarResidenciaFlexivel(apartamento);
      if (!residenciaNova) {
        return res.status(400).json({ 
          erro: `A residência "${apartamento}" não está cadastrada. Por favor, informe um apartamento válido (ex: 001, 002 ou 003).` 
        });
      }
    }

    // Preparar dados de atualização
    const dataUpdate = {
      nome: nome || undefined,
      cpf: cpf || undefined,
      email: email || undefined,
    };

    if (senha) {
      dataUpdate.senhaHash = await bcrypt.hash(senha, 10);
    }

    // Atualizar morador
    const moradorAtualizado = await prisma.usuario.update({
      where: { id },
      data: dataUpdate
    });

    // Se houve mudança de residência, desassociar antigas e associar nova
    if (residenciaNova) {
      // Desassociar residências antigas deste morador
      await prisma.residencia.updateMany({
        where: { usuarioId: id },
        data: { usuarioId: null }
      });

      // Associar a nova
      await prisma.residencia.update({
        where: { id: residenciaNova.id },
        data: { usuarioId: id }
      });
    }

    // Retorna atualizado
    const moradorCompleto = await prisma.usuario.findUnique({
      where: { id },
      include: { residencias: true }
    });

    res.json(sanitizarUsuario(moradorCompleto));
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno inesperado: ' + err.message });
  }
});

// 5. Remover Morador
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const morador = await prisma.usuario.findFirst({
      where: { id, perfil: 'morador' }
    });
    if (!morador) {
      return res.status(404).json({ erro: 'Morador não encontrado' });
    }

    // 1. Limpar referências em LogSistema
    await prisma.logSistema.updateMany({
      where: { usuarioId: id },
      data: { usuarioId: null }
    });

    // 2. Desassociar residências sem excluí-las do banco de dados
    await prisma.residencia.updateMany({
      where: { usuarioId: id },
      data: { usuarioId: null }
    });

    // 3. Excluir o usuário
    await prisma.usuario.delete({
      where: { id }
    });

    res.json({ mensagem: 'Morador removido com sucesso e residências desassociadas.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno inesperado: ' + err.message });
  }
});

module.exports = router
