/* ==========================================================
   Animalec – Protótipo do back-office (Tarefa 3.1 b)
   Comportamento das páginas. Cada página HTML indica no
   atributo data-pagina do <body> qual a função a executar.
   ========================================================== */

/* ---------- Utilitários ---------- */

// Cria um elemento de forma segura (o texto nunca é interpretado como HTML)
function el(tag, atributos = {}, filhos = []) {
  const no = document.createElement(tag);
  for (const [nome, valor] of Object.entries(atributos)) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (nome === 'texto') no.textContent = valor;
    else if (nome.startsWith('on')) no.addEventListener(nome.slice(2), valor);
    else no.setAttribute(nome, valor === true ? '' : valor);
  }
  for (const filho of [].concat(filhos)) {
    if (filho === null || filho === undefined || filho === false) continue;
    no.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
  }
  return no;
}

// Ícone decorativo do Font Awesome (o texto do botão já descreve a ação)
const icone = (nome) => el('i', { class: `fa-solid ${nome}`, 'aria-hidden': 'true' });

const parametro = (nome) => new URLSearchParams(location.search).get(nome);
const iniciais = (nome) => nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
const formatarData = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');
const nomeAnimal = (id) => (DADOS.animais.find((a) => a.id === id) || { nome: '(removido)' }).nome;

/* ---------- Sessão de administrador ---------- */
const CHAVE_SESSAO = 'animalec-admin';

function sessaoAtiva() {
  try { return sessionStorage.getItem(CHAVE_SESSAO) === 'sim'; } catch (e) { return window.__sessao === true; }
}

function iniciarSessao() {
  try { sessionStorage.setItem(CHAVE_SESSAO, 'sim'); } catch (e) { window.__sessao = true; }
}

function terminarSessao() {
  try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (e) { window.__sessao = false; }
  location.href = 'index.html';
}

/* ---------- Mensagens (aviso temporário) ---------- */
function aviso(texto) {
  const zona = document.getElementById('aviso');
  if (!zona) return;
  zona.textContent = texto;
  zona.classList.add('visivel');
  clearTimeout(aviso.temporizador);
  aviso.temporizador = setTimeout(() => zona.classList.remove('visivel'), 3000);
}

// Mensagem guardada para mostrar na página seguinte (ex.: depois de gravar um formulário)
function avisoSeguinte(texto) {
  try { sessionStorage.setItem('animalec-aviso', texto); } catch (e) { /* ignora */ }
}

function mostrarAvisoPendente() {
  try {
    const texto = sessionStorage.getItem('animalec-aviso');
    if (texto) { sessionStorage.removeItem('animalec-aviso'); aviso(texto); }
  } catch (e) { /* ignora */ }
}

/* ---------- Janelas modais com <dialog> (HTML5) ---------- */
function abrirDialogo(titulo, conteudo, acoes) {
  const dialogo = document.getElementById('janela');
  dialogo.replaceChildren(
    el('form', { method: 'dialog', class: 'janela-conteudo' }, [
      el('header', { class: 'janela-topo' }, [
        el('h2', { id: 'janela-titulo', texto: titulo }),
        el('button', { class: 'fechar', value: 'cancelar', 'aria-label': 'Fechar', texto: '×' })
      ]),
      el('div', { class: 'janela-corpo' }, conteudo),
      el('footer', { class: 'janela-acoes' }, acoes || [el('button', { class: 'botao', value: 'ok', texto: 'Fechar' })])
    ])
  );
  dialogo.showModal();
  return new Promise((resolver) => {
    dialogo.addEventListener('close', () => resolver(dialogo.returnValue), { once: true });
  });
}

// Fecha a janela ao clicar fora dela
document.addEventListener('click', (evento) => {
  const dialogo = document.getElementById('janela');
  if (dialogo && evento.target === dialogo) dialogo.close('cancelar');
});

function confirmar(mensagem, { titulo = 'Confirmar remoção', botao = 'Remover' } = {}) {
  return abrirDialogo(titulo, [el('p', { texto: mensagem })], [
    el('button', { class: 'botao secundario', value: 'cancelar', texto: 'Cancelar' }),
    el('button', { class: 'botao perigo', value: 'ok', texto: botao })
  ]).then((resposta) => resposta === 'ok');
}

/* ---------- Componentes de tabela ---------- */
function celula(rotulo, conteudo) {
  return el('td', { 'data-rotulo': rotulo }, conteudo);
}

function botoesAcao({ editar, ver, remover }) {
  return el('div', { class: 'acoes' }, [
    el('a', { class: 'botao pequeno', href: editar }, [icone('fa-pen-to-square'), 'Editar']),
    el('button', { type: 'button', class: 'botao pequeno', onclick: ver }, [icone('fa-magnifying-glass'), 'Ver']),
    el('button', { type: 'button', class: 'botao pequeno perigo', onclick: remover }, [icone('fa-trash-can'), 'Remover'])
  ]);
}

// Ordenação por nome ao clicar no cabeçalho NOME (como na Figura A.45 do livro)
function ligarOrdenacao(botao, desenhar) {
  let ascendente = true;
  botao.addEventListener('click', () => {
    ascendente = !ascendente;
    botao.closest('th').setAttribute('aria-sort', ascendente ? 'ascending' : 'descending');
    botao.querySelector('.seta').textContent = ascendente ? '▲' : '▼';
    desenhar(ascendente);
  });
}

/* ==========================================================
   PÁGINAS
   ========================================================== */
const paginas = {

  /* ---------- Entrada (login de administrador) ---------- */
  login() {
    if (sessaoAtiva()) { location.href = 'admin.html'; return; }
    const formulario = document.getElementById('form-login');
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const utilizador = formulario.utilizador.value.trim();
      const palavraPasse = formulario.palavraPasse.value;
      const erro = document.getElementById('erro-login');
      if (utilizador === 'admin' && palavraPasse === 'animalec') {
        iniciarSessao();
        location.href = 'admin.html';
      } else {
        erro.textContent = 'Credenciais inválidas. Use as credenciais de demonstração indicadas abaixo.';
        formulario.palavraPasse.select();
      }
    });
  },

  /* ---------- Página principal do back-office ---------- */
  admin() {
    const contagens = {
      animais: DADOS.animais.length,
      patrocinadores: DADOS.patrocinadores.length,
      especialistas: DADOS.especialistas.length
    };
    document.querySelectorAll('[data-contagem]').forEach((no) => {
      const total = contagens[no.dataset.contagem];
      no.textContent = `${total} ${total === 1 ? 'registo' : 'registos'}`;
    });
    document.getElementById('repor').addEventListener('click', async () => {
      const ok = await confirmar('Repor os dados de exemplo? As alterações feitas no protótipo serão apagadas.',
        { titulo: 'Repor dados de exemplo', botao: 'Repor' });
      if (ok) { repor(); location.reload(); }
    });
  },

  /* ---------- Gestão de patrocinadores ---------- */
  listaPatrocinadores() {
    const corpo = document.getElementById('corpo-tabela');
    const pesquisa = document.getElementById('pesquisa');
    let ascendente = true;

    const desenhar = () => {
      const termo = pesquisa.value.trim().toLowerCase();
      const lista = DADOS.patrocinadores
        .filter((p) => p.nome.toLowerCase().includes(termo))
        .sort((a, b) => (ascendente ? 1 : -1) * a.nome.localeCompare(b.nome, 'pt'));
      corpo.replaceChildren(...lista.map((p) => el('tr', {}, [
        celula('Nome', el('strong', { texto: p.nome })),
        celula('Tipo', p.tipo),
        celula('Nível', el('span', { class: `selo ${p.nivel.toLowerCase()}`, texto: p.nivel })),
        celula('Animais', p.animais.map(nomeAnimal).join(', ')),
        celula('Ações', botoesAcao({
          editar: `patrocinador.html?id=${encodeURIComponent(p.id)}`,
          ver: () => verPatrocinador(p),
          remover: async () => {
            if (await confirmar(`Remover o patrocinador "${p.nome}"?`)) {
              DADOS.patrocinadores = DADOS.patrocinadores.filter((x) => x.id !== p.id);
              guardarDados(); desenhar(); aviso('Patrocinador removido.');
            }
          }
        }))
      ])));
      document.getElementById('sem-resultados').hidden = lista.length > 0;
      document.getElementById('total').textContent = `${lista.length} de ${DADOS.patrocinadores.length}`;
    };

    ligarOrdenacao(document.getElementById('ordenar-nome'), (asc) => { ascendente = asc; desenhar(); });
    pesquisa.addEventListener('input', desenhar);
    desenhar();
    mostrarAvisoPendente();
  },

  formPatrocinador() {
    const id = parametro('id');
    const existente = id ? DADOS.patrocinadores.find((p) => p.id === id) : null;
    const formulario = document.getElementById('form-entidade');

    preencherOpcoes(formulario.tipo, TIPOS_PATROCINADOR);
    preencherOpcoes(formulario.nivel, NIVEIS_PATROCINIO);
    const caixaAnimais = document.getElementById('lista-animais');
    caixaAnimais.replaceChildren(...DADOS.animais.map((a) => el('label', { class: 'opcao' }, [
      el('input', { type: 'checkbox', name: 'animais', value: a.id, id: `animal-${a.id}` }),
      ` ${a.nome} `, el('small', { texto: `(${a.grupo})` })
    ])));

    if (existente) {
      document.querySelectorAll('[data-modo]').forEach((no) => { no.textContent = no.dataset.modo; });
      for (const campo of ['nome', 'tipo', 'nivel', 'email', 'website', 'logotipo', 'dataInicio', 'mensagem']) {
        formulario[campo].value = existente[campo] || '';
      }
      formulario.querySelectorAll('[name="animais"]').forEach((c) => { c.checked = existente.animais.includes(c.value); });
    }

    prepararValidacao(formulario);
    const erroAnimais = document.getElementById('erro-animais');
    erroAnimais.removeAttribute('role'); // o resumo de erros já é anunciado
    caixaAnimais.addEventListener('change', () => {
      if (erroAnimais.textContent && formulario.querySelector('[name="animais"]:checked')) erroAnimais.textContent = '';
    });

    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const animais = [...formulario.querySelectorAll('[name="animais"]:checked')].map((c) => c.value);
      const valido = validarFormulario(formulario, [{
        valido: animais.length > 0,
        alvo: caixaAnimais.querySelector('input'),
        zona: erroAnimais,
        rotulo: 'Animais patrocinados',
        mensagem: 'Escolha pelo menos um animal patrocinado.'
      }]);
      if (!valido) return;

      const registo = {
        id: existente ? existente.id : novoId('s'),
        nome: formulario.nome.value.trim(),
        tipo: formulario.tipo.value,
        nivel: formulario.nivel.value,
        email: formulario.email.value.trim(),
        website: formulario.website.value.trim(),
        logotipo: formulario.logotipo.value.trim(),
        dataInicio: formulario.dataInicio.value,
        mensagem: formulario.mensagem.value.trim(),
        animais
      };
      if (existente) Object.assign(existente, registo); else DADOS.patrocinadores.push(registo);
      guardarDados();
      avisoSeguinte(existente ? 'Patrocinador atualizado.' : 'Patrocinador adicionado.');
      location.href = 'patrocinadores.html';
    });
  },

  /* ---------- Gestão de especialistas ---------- */
  listaEspecialistas() {
    const corpo = document.getElementById('corpo-tabela');
    const pesquisa = document.getElementById('pesquisa');
    const filtroGrupo = document.getElementById('filtro-grupo');
    preencherOpcoes(filtroGrupo, GRUPOS, 'Todos os grupos');
    let ascendente = true;

    const desenhar = () => {
      const termo = pesquisa.value.trim().toLowerCase();
      const grupo = filtroGrupo.value;
      const lista = DADOS.especialistas
        .filter((e) => (e.nome + ' ' + e.especialidade).toLowerCase().includes(termo))
        .filter((e) => !grupo || (e.ambito !== 'animais' && e.grupo === grupo) || animaisDoEspecialista(e).some((a) => a.grupo === grupo))
        .sort((a, b) => (ascendente ? 1 : -1) * a.nome.localeCompare(b.nome, 'pt'));
      corpo.replaceChildren(...lista.map((e) => el('tr', {}, [
        celula('Nome', el('strong', { texto: `${e.nome}` })),
        celula('Especialidade', e.especialidade),
        celula('Âmbito', descreverAmbito(e)),
        celula('Instituição', e.instituicao),
        celula('Ações', botoesAcao({
          editar: `especialista.html?id=${encodeURIComponent(e.id)}`,
          ver: () => verEspecialista(e),
          remover: async () => {
            if (await confirmar(`Remover o especialista "${e.nome}"?`)) {
              DADOS.especialistas = DADOS.especialistas.filter((x) => x.id !== e.id);
              guardarDados(); desenhar(); aviso('Especialista removido.');
            }
          }
        }))
      ])));
      document.getElementById('sem-resultados').hidden = lista.length > 0;
      document.getElementById('total').textContent = `${lista.length} de ${DADOS.especialistas.length}`;
    };

    ligarOrdenacao(document.getElementById('ordenar-nome'), (asc) => { ascendente = asc; desenhar(); });
    pesquisa.addEventListener('input', desenhar);
    filtroGrupo.addEventListener('change', desenhar);
    desenhar();
    mostrarAvisoPendente();
  },

  formEspecialista() {
    const id = parametro('id');
    const existente = id ? DADOS.especialistas.find((e) => e.id === id) : null;
    const formulario = document.getElementById('form-entidade');

    preencherOpcoes(formulario.titulo, TITULOS_ACADEMICOS);
    preencherOpcoes(formulario.grupo, GRUPOS);

    // Mostra, em tempo real, os animais do grupo escolhido
    const animaisDoGrupo = document.getElementById('animais-do-grupo');
    const atualizarAnimais = () => {
      const nomes = DADOS.animais.filter((a) => a.grupo === formulario.grupo.value).map((a) => a.nome);
      animaisDoGrupo.textContent = formulario.grupo.value
        ? (nomes.length ? `Animais deste grupo no Animalec: ${nomes.join(', ')}.` : 'Ainda não há animais deste grupo no Animalec.')
        : '';
    };
    formulario.grupo.addEventListener('change', atualizarAnimais);

    // Âmbito: mostra só uma das listas (grupos ou animais), nunca as duas
    const zonaGrupo = document.getElementById('zona-grupo');
    const zonaAnimais = document.getElementById('zona-animais');
    const caixaAnimais = document.getElementById('lista-animais');
    const erroAnimais = document.getElementById('erro-animais');
    caixaAnimais.replaceChildren(...DADOS.animais.map((a) => el('label', { class: 'opcao' }, [
      el('input', { type: 'checkbox', name: 'animais', value: a.id, id: `animal-${a.id}` }),
      ` ${a.nome} `, el('small', { texto: `(${a.grupo})` })
    ])));
    const ambito = () => formulario.querySelector('[name="ambito"]:checked').value;
    const mostrarAmbito = () => {
      const porGrupo = ambito() === 'grupo';
      zonaGrupo.hidden = !porGrupo;
      formulario.grupo.disabled = !porGrupo;
      zonaAnimais.hidden = porGrupo;
      zonaAnimais.disabled = porGrupo; // um fieldset desativado fica fora da validação
      if (porGrupo) erroAnimais.textContent = '';
      else marcarCampo(formulario.grupo, '');
    };
    formulario.querySelectorAll('[name="ambito"]').forEach((r) => r.addEventListener('change', mostrarAmbito));
    caixaAnimais.addEventListener('change', () => {
      if (erroAnimais.textContent && formulario.querySelector('[name="animais"]:checked')) erroAnimais.textContent = '';
    });

    if (existente) {
      document.querySelectorAll('[data-modo]').forEach((no) => { no.textContent = no.dataset.modo; });
      for (const campo of ['nome', 'titulo', 'especialidade', 'grupo', 'instituicao', 'pais', 'email', 'perfil', 'fotografia', 'biografia']) {
        formulario[campo].value = existente[campo] || '';
      }
      const modo = existente.ambito === 'animais' ? 'animais' : 'grupo';
      formulario.querySelector(`[name="ambito"][value="${modo}"]`).checked = true;
      formulario.querySelectorAll('[name="animais"]').forEach((c) => { c.checked = (existente.animais || []).includes(c.value); });
    }
    atualizarAnimais();
    mostrarAmbito();
    prepararValidacao(formulario);

    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const porGrupo = ambito() === 'grupo';
      const animais = porGrupo ? [] : [...formulario.querySelectorAll('[name="animais"]:checked')].map((c) => c.value);
      const regras = porGrupo ? [] : [{
        valido: animais.length > 0,
        alvo: caixaAnimais.querySelector('input'),
        zona: erroAnimais,
        rotulo: 'Animais específicos',
        mensagem: 'Escolha pelo menos um animal.'
      }];
      if (!validarFormulario(formulario, regras)) return;
      const registo = {
        id: existente ? existente.id : novoId('e'),
        nome: formulario.nome.value.trim(),
        titulo: formulario.titulo.value,
        especialidade: formulario.especialidade.value.trim(),
        ambito: porGrupo ? 'grupo' : 'animais',
        grupo: porGrupo ? formulario.grupo.value : '',
        animais,
        instituicao: formulario.instituicao.value.trim(),
        pais: formulario.pais.value.trim(),
        email: formulario.email.value.trim(),
        perfil: formulario.perfil.value.trim(),
        fotografia: formulario.fotografia.value.trim(),
        biografia: formulario.biografia.value.trim()
      };
      if (existente) Object.assign(existente, registo); else DADOS.especialistas.push(registo);
      guardarDados();
      avisoSeguinte(existente ? 'Especialista atualizado.' : 'Especialista adicionado.');
      location.href = 'especialistas.html';
    });
  },

  /* ---------- Gestão de animais (entidade existente, agora ligada às novas) ---------- */
  listaAnimais() {
    const corpo = document.getElementById('corpo-tabela');
    corpo.replaceChildren(...DADOS.animais.map((a) => {
      const patrocinadores = DADOS.patrocinadores.filter((p) => p.animais.includes(a.id));
      const especialistas = DADOS.especialistas.filter((e) => animaisDoEspecialista(e).some((x) => x.id === a.id));
      return el('tr', {}, [
        celula('Nome', el('strong', { texto: a.nome })),
        celula('Grupo', a.grupo),
        celula('Nível', String(a.nivel)),
        celula('Patrocinadores', String(patrocinadores.length)),
        celula('Especialistas', String(especialistas.length)),
        celula('Ações', el('div', { class: 'acoes' }, [
          el('button', {
            type: 'button', class: 'botao pequeno',
            onclick: () => verAnimal(a, patrocinadores, especialistas)
          }, [icone('fa-magnifying-glass'), 'Ver'])
        ]))
      ]);
    }));
  }
};

/* ---------- Âmbito do especialista ----------
   "grupo": acompanha todos os animais do grupo (também os que entrarem depois);
   "animais": acompanha só os animais escolhidos (ex.: um especialista em grandes felinos). */
function animaisDoEspecialista(e) {
  return e.ambito === 'animais'
    ? DADOS.animais.filter((a) => (e.animais || []).includes(a.id))
    : DADOS.animais.filter((a) => a.grupo === e.grupo);
}

function descreverAmbito(e) {
  return e.ambito === 'animais'
    ? `Animais: ${animaisDoEspecialista(e).map((a) => a.nome).join(', ') || '—'}`
    : `Grupo: ${e.grupo}`;
}

/* ---------- Janelas de detalhe ---------- */
function ficha(campos) {
  return el('dl', { class: 'ficha' }, campos.flatMap(([rotulo, valor]) => [
    el('dt', { texto: rotulo }), el('dd', {}, valor || '—')
  ]));
}

function ligacao(url) {
  return url ? el('a', { href: url, target: '_blank', rel: 'noopener', texto: url }) : '—';
}

function avatar(nome, imagem) {
  return imagem
    ? el('img', { class: 'avatar', src: imagem, alt: '' })
    : el('span', { class: 'avatar', 'aria-hidden': 'true', texto: iniciais(nome) });
}

function verPatrocinador(p) {
  abrirDialogo(p.nome, [
    el('div', { class: 'cabeca-ficha' }, [
      avatar(p.nome, p.logotipo),
      el('p', {}, [el('span', { class: `selo ${p.nivel.toLowerCase()}`, texto: p.nivel }), ` ${p.tipo}`])
    ]),
    p.mensagem ? el('blockquote', { texto: p.mensagem }) : null,
    ficha([
      ['Animais patrocinados', p.animais.map(nomeAnimal).join(', ')],
      ['Patrocinador desde', formatarData(p.dataInicio)],
      ['E-mail', p.email ? el('a', { href: `mailto:${p.email}`, texto: p.email }) : '—'],
      ['Website', ligacao(p.website)]
    ])
  ]);
}

function verEspecialista(e) {
  const animais = animaisDoEspecialista(e).map((a) => a.nome);
  abrirDialogo(e.nome, [
    el('div', { class: 'cabeca-ficha' }, [
      avatar(e.nome, e.fotografia),
      el('p', {}, [el('strong', { texto: e.titulo }), ` · ${e.especialidade}`])
    ]),
    e.biografia ? el('blockquote', { texto: e.biografia }) : null,
    ficha([
      ['Âmbito', e.ambito === 'animais' ? 'Animais específicos' : `Todo o grupo: ${e.grupo}`],
      ['Animais acompanhados', animais.length ? animais.join(', ') : 'Ainda não há animais deste grupo no Animalec.'],
      ['Instituição', e.instituicao],
      ['País', e.pais],
      ['E-mail', e.email ? el('a', { href: `mailto:${e.email}`, texto: e.email }) : '—'],
      ['Perfil científico', ligacao(e.perfil)]
    ])
  ]);
}

function verAnimal(a, patrocinadores, especialistas) {
  abrirDialogo(a.nome, [
    el('p', { texto: `Grupo: ${a.grupo} · Nível ${a.nivel}` }),
    el('section', { class: 'bloco-relacao' }, [
      el('h3', { texto: 'Patrocinadores' }),
      patrocinadores.length
        ? el('ul', {}, patrocinadores.map((p) => el('li', {}, [p.nome, ' ', el('span', { class: `selo ${p.nivel.toLowerCase()}`, texto: p.nivel })])))
        : el('p', { class: 'vazio', texto: 'Este animal ainda não tem patrocinadores.' })
    ]),
    el('section', { class: 'bloco-relacao' }, [
      el('h3', { texto: 'Especialistas' }),
      especialistas.length
        ? el('ul', {}, especialistas.map((e) => el('li', { texto: `${e.titulo} ${e.nome} – ${e.especialidade}` })))
        : el('p', { class: 'vazio', texto: 'Ainda não há especialistas para este animal.' })
    ])
  ]);
}

/* ---------- Formulários ---------- */
function preencherOpcoes(select, opcoes, textoVazio = '— Selecione —') {
  select.replaceChildren(el('option', { value: '', texto: textoVazio }), ...opcoes.map((o) => el('option', { value: o, texto: o })));
}

/* ---------- Validação acessível ----------
   As restrições continuam no HTML (required, type="email", maxlength…),
   e o navegador valida sozinho se o JavaScript falhar. Com JavaScript,
   os erros passam a aparecer junto de cada campo (aria-invalid e
   aria-describedby) e num resumo no topo do formulário, que recebe o foco. */

function mensagemErro(campo) {
  const v = campo.validity;
  if (v.valueMissing) return campo.tagName === 'SELECT' ? 'Escolha uma opção.' : 'Preencha este campo.';
  if (v.typeMismatch && campo.type === 'email') return 'Indique um e-mail válido, por exemplo nome@dominio.pt.';
  if (v.typeMismatch && campo.type === 'url') return 'Indique um endereço completo, começado por https://.';
  if (v.tooLong) return `Use no máximo ${campo.maxLength} caracteres.`;
  if (v.badInput) return 'Indique uma data válida.';
  return 'Verifique o valor deste campo.';
}

function rotuloDe(campo) {
  const rotulo = document.querySelector(`label[for="${campo.id}"]`);
  return rotulo ? rotulo.firstChild.textContent.trim() : campo.name;
}

function marcarCampo(campo, mensagem) {
  const idErro = `erro-${campo.id}`;
  let erro = document.getElementById(idErro);
  if (!erro) {
    erro = el('p', { class: 'erro', id: idErro });
    campo.closest('.campo').append(erro);
  }
  erro.textContent = mensagem;
  const ligados = (campo.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== idErro);
  if (mensagem) {
    campo.setAttribute('aria-invalid', 'true');
    ligados.unshift(idErro); // o erro é lido antes da ajuda
  } else {
    campo.removeAttribute('aria-invalid');
  }
  if (ligados.length) campo.setAttribute('aria-describedby', ligados.join(' '));
  else campo.removeAttribute('aria-describedby');
}

// Prepara o formulário: desliga os balões do navegador e cria o resumo de erros
function prepararValidacao(formulario) {
  formulario.noValidate = true;
  const resumo = el('div', { class: 'resumo-erros', id: 'resumo-erros', tabindex: '-1', 'aria-labelledby': 'resumo-erros-titulo', hidden: true }, [
    el('h2', { id: 'resumo-erros-titulo' }),
    el('ul')
  ]);
  formulario.prepend(resumo);
  // Revalida em tempo real os campos que já estavam com erro
  const revalidar = (evento) => {
    const campo = evento.target;
    if (campo.getAttribute('aria-invalid') === 'true') marcarCampo(campo, campo.checkValidity() ? '' : mensagemErro(campo));
  };
  formulario.addEventListener('input', revalidar);
  formulario.addEventListener('change', revalidar);
}

/* Valida todos os campos. "extras" são regras que o HTML não exprime,
   por exemplo "pelo menos um animal": { valido, alvo, zona, rotulo, mensagem } */
function validarFormulario(formulario, extras = []) {
  const erros = [];
  formulario.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select, textarea').forEach((campo) => {
    const mensagem = campo.checkValidity() ? '' : mensagemErro(campo);
    marcarCampo(campo, mensagem);
    if (mensagem) erros.push({ alvo: campo, texto: `${rotuloDe(campo)}: ${mensagem}` });
  });
  extras.forEach((regra) => {
    regra.zona.textContent = regra.valido ? '' : regra.mensagem;
    if (!regra.valido) erros.push({ alvo: regra.alvo, texto: `${regra.rotulo}: ${regra.mensagem}` });
  });

  const resumo = document.getElementById('resumo-erros');
  resumo.hidden = erros.length === 0;
  if (!erros.length) return true;

  resumo.querySelector('h2').textContent = erros.length === 1
    ? 'Há 1 campo por corrigir'
    : `Há ${erros.length} campos por corrigir`;
  resumo.querySelector('ul').replaceChildren(...erros.map((erro) => el('li', {}, [
    el('a', {
      href: `#${erro.alvo.id}`,
      texto: erro.texto,
      onclick: (evento) => { evento.preventDefault(); erro.alvo.focus(); }
    })
  ])));
  resumo.focus();
  return false;
}

/* ---------- Arranque ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const pagina = document.body.dataset.pagina;
  const publica = pagina === 'login';
  if (!publica && !sessaoAtiva()) { location.href = 'index.html'; return; }

  document.querySelectorAll('[data-sair]').forEach((b) => b.addEventListener('click', terminarSessao));

  // Menu para telemóvel
  const botaoMenu = document.querySelector('.botao-menu');
  if (botaoMenu) {
    botaoMenu.addEventListener('click', () => {
      const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
      botaoMenu.setAttribute('aria-expanded', String(!aberto));
      document.getElementById('menu').classList.toggle('aberto', !aberto);
    });
  }

  if (paginas[pagina]) paginas[pagina]();
});
