/* ==========================================================
   Animalec – Protótipo do back-office (Tarefa 3.1 b)
   Camada de dados: dados de exemplo e persistência local.

   No Animalec real, estes dados viriam da API REST
   (Queirós & Portela, 2020, Anexo A). No protótipo ficam
   guardados no localStorage do navegador para que as
   operações de adicionar, editar e remover possam ser testadas.
   ========================================================== */

// Grupos de animais usados no Animalec (Queirós & Portela, 2020, A.3.2)
const GRUPOS = ['anfíbio', 'ave', 'mamífero', 'peixe', 'réptil'];

// Opções fechadas das novas entidades
const TIPOS_PATROCINADOR = ['Empresa', 'Organização sem fins lucrativos', 'Particular'];
const NIVEIS_PATROCINIO = ['Bronze', 'Prata', 'Ouro'];
const TITULOS_ACADEMICOS = ['Licenciado(a)', 'Mestre', 'Doutor(a)'];

// Animais existentes (exemplos da Figura A.47 do livro)
const ANIMAIS_INICIAIS = [
  { id: 'a1', nome: 'chimpanzé', grupo: 'mamífero', nivel: 2 },
  { id: 'a2', nome: 'tigre', grupo: 'mamífero', nivel: 1 },
  { id: 'a3', nome: 'pardal', grupo: 'ave', nivel: 1 },
  { id: 'a4', nome: 'gato', grupo: 'mamífero', nivel: 2 },
  { id: 'a5', nome: 'cão', grupo: 'mamífero', nivel: 1 },
  { id: 'a6', nome: 'leão', grupo: 'mamífero', nivel: 1 },
  { id: 'a7', nome: 'crocodilo', grupo: 'réptil', nivel: 3 },
  { id: 'a8', nome: 'rã', grupo: 'anfíbio', nivel: 2 }
];

// Entidade nova 1: Patrocinador (sponsor). Nomes fictícios.
const PATROCINADORES_INICIAIS = [
  {
    id: 's1', nome: 'Savana Viva, Lda.', tipo: 'Empresa', nivel: 'Ouro',
    email: 'parcerias@savanaviva.example', website: 'https://savanaviva.example',
    logotipo: '', dataInicio: '2025-03-01', animais: ['a2', 'a6'],
    mensagem: 'Apoiamos a conservação dos grandes felinos e a educação ambiental.'
  },
  {
    id: 's2', nome: 'Associação Asas Livres', tipo: 'Organização sem fins lucrativos', nivel: 'Prata',
    email: 'geral@asaslivres.example', website: 'https://asaslivres.example',
    logotipo: '', dataInicio: '2025-09-15', animais: ['a3'],
    mensagem: 'Promovemos a observação e a proteção das aves urbanas.'
  },
  {
    id: 's3', nome: 'Clínica Patas & Companhia', tipo: 'Empresa', nivel: 'Bronze',
    email: 'info@patasecompanhia.example', website: '',
    logotipo: '', dataInicio: '2026-01-10', animais: ['a4', 'a5'],
    mensagem: 'Cuidamos de animais domésticos há mais de dez anos.'
  }
];

// Entidade nova 2: Especialista científico (expert). Nomes fictícios.
const ESPECIALISTAS_INICIAIS = [
  {
    id: 'e1', nome: 'Marta Sitoe', titulo: 'Doutor(a)', especialidade: 'Primatologia',
    ambito: 'grupo', animais: [], grupo: 'mamífero', instituicao: 'Instituto de Investigação Animal (exemplo)', pais: 'Moçambique',
    email: 'marta.sitoe@iia.example', perfil: 'https://orcid.org/0000-0000-0000-0001',
    fotografia: '', biografia: 'Estuda o comportamento social de primatas em florestas tropicais.'
  },
  {
    id: 'e2', nome: 'Rui Fonseca', titulo: 'Mestre', especialidade: 'Ornitologia',
    ambito: 'grupo', animais: [], grupo: 'ave', instituicao: 'Centro de Estudos das Aves (exemplo)', pais: 'Portugal',
    email: 'rui.fonseca@cea.example', perfil: '',
    fotografia: '', biografia: 'Coordena programas de anilhagem e monitorização de aves migratórias.'
  },
  {
    id: 'e3', nome: 'Ana Macuácua', titulo: 'Doutor(a)', especialidade: 'Herpetologia',
    ambito: 'grupo', animais: [], grupo: 'réptil', instituicao: 'Museu de História Natural (exemplo)', pais: 'Moçambique',
    email: 'ana.macuacua@mhn.example', perfil: '',
    fotografia: '', biografia: 'Investiga a ecologia de répteis em zonas húmidas.'
  },
  {
    // Âmbito "animais específicos": acompanha só o tigre e o leão, não todos os mamíferos
    id: 'e4', nome: 'Tomás Nhantumbo', titulo: 'Mestre', especialidade: 'Grandes felinos',
    ambito: 'animais', animais: ['a2', 'a6'], grupo: '', instituicao: 'Centro de Conservação de Felinos (exemplo)', pais: 'Moçambique',
    email: 'tomas.nhantumbo@ccf.example', perfil: '',
    fotografia: '', biografia: 'Acompanha populações de leões e tigres em programas de conservação.'
  }
];

/* ---------- Persistência ---------- */
const CHAVE = 'animalec-prototipo-v2'; // v2: especialistas com âmbito

function carregarDados() {
  try {
    const guardado = localStorage.getItem(CHAVE);
    if (guardado) return JSON.parse(guardado);
  } catch (e) { /* sem localStorage: usa os dados iniciais em memória */ }
  return {
    animais: structuredClone(ANIMAIS_INICIAIS),
    patrocinadores: structuredClone(PATROCINADORES_INICIAIS),
    especialistas: structuredClone(ESPECIALISTAS_INICIAIS)
  };
}

let DADOS = carregarDados();

function guardarDados() {
  try { localStorage.setItem(CHAVE, JSON.stringify(DADOS)); } catch (e) { /* ignora */ }
}

function repor() {
  try { localStorage.removeItem(CHAVE); } catch (e) { /* ignora */ }
  DADOS = carregarDados();
}

function novoId(prefixo) {
  return prefixo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
