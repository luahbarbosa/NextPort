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

// Helper para mapear cargo do frontend para Perfil do Prisma
function mapearCargoParaPerfil(cargo) {
  if (cargo === 'Administrador') return 'admin';
  if (cargo === 'Funcionário Comum') return 'operador';
  return null;
}

// Helper para mapear Perfil do Prisma para Cargo do frontend
function mapearPerfilParaCargo(perfil) {
  if (perfil === 'admin') return 'Administrador';
  if (perfil === 'operador') return 'Funcionário Comum';
  return perfil;
}

// 1. Listar Funcionários
router.get('/', async (req, res) => {
  try {
    const funcionarios = await prisma.usuario.findMany({
      where: {
        perfil: { in: ['admin', 'operador'] }
      }
    });
    
    // Mapear de volta para cargo na resposta
    const resultado = funcionarios.map(u => {
      const sanitizado = sanitizarUsuario(u);
      sanitizado.cargo = mapearPerfilParaCargo(u.perfil);
      return sanitizado;
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 2. Buscar Funcionário por ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const funcionario = await prisma.usuario.findFirst({
      where: {
        id,
        perfil: { in: ['admin', 'operador'] }
      }
    });

    if (!funcionario) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }

    const resultado = sanitizarUsuario(funcionario);
    resultado.cargo = mapearPerfilParaCargo(funcionario.perfil);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// 3. Cadastrar Funcionário
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, email, senha, cargo } = req.body;

    // Validações básicas
    if (!nome || !cpf || !email || !senha || !cargo) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios (nome, cpf, email, senha, cargo).' });
    }

    const perfil = mapearCargoParaPerfil(cargo);
    if (!perfil) {
      return res.status(400).json({ erro: 'Cargo inválido. Escolha "Administrador" ou "Funcionário Comum".' });
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

    // Criar funcionário
    const funcionario = await prisma.usuario.create({
      data: {
        nome,
        cpf,
        email,
        senhaHash,
        perfil
      }
    });

    const resultado = sanitizarUsuario(funcionario);
    resultado.cargo = mapearPerfilParaCargo(funcionario.perfil);

    res.status(201).json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno inesperado: ' + err.message });
  }
});

// 4. Editar Funcionário
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, cpf, email, senha, cargo } = req.body;

    const funcionarioExistente = await prisma.usuario.findFirst({
      where: {
        id,
        perfil: { in: ['admin', 'operador'] }
      }
    });
    if (!funcionarioExistente) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }

    // Validar e-mail duplicado
    if (email && email !== funcionarioExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({ where: { email } });
      if (emailExistente) {
        return res.status(409).json({ erro: 'Este e-mail já está em uso por outro usuário.' });
      }
    }

    // Preparar dados de atualização
    const dataUpdate = {
      nome: nome || undefined,
      cpf: cpf || undefined,
      email: email || undefined,
    };

    if (cargo) {
      const perfil = mapearCargoParaPerfil(cargo);
      if (!perfil) {
        return res.status(400).json({ erro: 'Cargo inválido. Escolha "Administrador" ou "Funcionário Comum".' });
      }
      dataUpdate.perfil = perfil;
    }

    if (senha) {
      dataUpdate.senhaHash = await bcrypt.hash(senha, 10);
    }

    // Atualizar funcionário
    const funcionarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dataUpdate
    });

    const resultado = sanitizarUsuario(funcionarioAtualizado);
    resultado.cargo = mapearPerfilParaCargo(funcionarioAtualizado.perfil);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno inesperado: ' + err.message });
  }
});

// 5. Remover Funcionário
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const funcionario = await prisma.usuario.findFirst({
      where: {
        id,
        perfil: { in: ['admin', 'operador'] }
      }
    });
    if (!funcionario) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }

    // 1. Limpar referências em LogSistema
    await prisma.logSistema.updateMany({
      where: { usuarioId: id },
      data: { usuarioId: null }
    });

    // 2. Excluir o usuário
    await prisma.usuario.delete({
      where: { id }
    });

    res.json({ mensagem: 'Funcionário removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno inesperado: ' + err.message });
  }
});

module.exports = router
