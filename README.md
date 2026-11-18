# Tarefa 3.1 b) — Prototipagem do back-office do Animalec

Unidade curricular **Programação Web Avançada**\
Mestrado em Engenharia Informática e Tecnologia Web — Universidade Aberta

**Autor:** José Ernesto Constantino Bule

**Demonstração:** [ernestobule-rgb.github.io/Tarefa_3.1b/prototipo](https://ernestobule-rgb.github.io/Tarefa_3.1b/prototipo/) · utilizador `admin`, palavra-passe `animalec`

## Objetivo

Planear a inclusão de duas novas entidades no back-office do Animalec, a aplicação usada como caso prático no livro recomendado (Queirós & Portela, 2020, Anexo A.3):

- **Patrocinadores** (*sponsors*): entidades que se identificam com os animais e os apoiam;
- **Especialistas** (*experts*): especialistas científicos de um grupo ou família de animais.

## Artefactos entregues

O planeamento segue os três níveis de prototipagem. Os wireframes e os mockups incluem versões para *browser* e para telemóvel.

| Artefacto | Ficheiro | Fidelidade | O que comunica |
| --- | --- | --- | --- |
| Wireframes | [`Wireframes_Tarefa3.1b.drawio`](wireframes/Wireframes_Tarefa3.1b.drawio) | Baixa: tons de cinzento, dados representados por barras e ícones por caixas | Estrutura, hierarquia e navegação, incluindo o diagrama de navegação |
| Mockups | [`Mockups_Tarefa3.1b.drawio`](mockups/Mockups_Tarefa3.1b.drawio) | Alta fidelidade visual: cores, tipografia, ícones e dados de exemplo | Aspeto final, estático |
| Protótipo | [`prototipo/`](prototipo/) | Funcional: HTML5, CSS e JavaScript | Navegação, validação, janelas modais, adicionar, editar e remover, estados da interface e acessibilidade |

Os ficheiros `.drawio` abrem no [app.diagrams.net](https://app.diagrams.net) ou no draw.io Desktop. Cada vista ocupa uma página, acessível pelos separadores na parte inferior: os wireframes têm 28 páginas (diagrama de navegação, 14 vistas *browser* e 13 vistas mobile) e os mockups têm 27.

## Estrutura do repositório

```text
Tarefa_3.1b/
├── README.md
├── wireframes/
│   └── Wireframes_Tarefa3.1b.drawio
├── mockups/
│   └── Mockups_Tarefa3.1b.drawio
└── prototipo/
    ├── index.html            # entrada (login de administrador)
    ├── admin.html            # página principal do back-office
    ├── patrocinadores.html   # gestão de patrocinadores (lista)
    ├── patrocinador.html     # adicionar e editar patrocinador
    ├── especialistas.html    # gestão de especialistas (lista)
    ├── especialista.html     # adicionar e editar especialista
    ├── animais.html          # animais e respetivas ligações às novas entidades
    ├── fora-ambito.html      # utilizadores, quizzes e questões (áreas já existentes)
    ├── css/
    │   └── estilos.css
    └── js/
        ├── dados.js          # dados de exemplo e persistência
        └── app.js            # comportamento das páginas
```

## Como experimentar

1. Abrir a [demonstração](https://ernestobule-rgb.github.io/Tarefa_3.1b/prototipo/) ou o ficheiro `prototipo/index.html` num navegador recente (Chrome, Firefox ou Edge). A ligação à Internet carrega os tipos de letra e os ícones.
2. Entrar com o utilizador **`admin`** e a palavra-passe **`animalec`**.
3. Os dados ficam guardados no navegador (`localStorage`). O botão **Repor dados de exemplo**, na página principal, restaura o estado inicial.

## Modelo de dados

### Patrocinador

| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| Nome (`nome`) | Texto, até 80 caracteres | Sim | |
| Tipo (`tipo`) | Lista fechada | Sim | Empresa · Organização sem fins lucrativos · Particular |
| Nível (`nivel`) | Lista fechada | Sim | Bronze · Prata · Ouro |
| Animais (`animais`) | Lista de animais | Sim, pelo menos um | Animais apoiados pelo patrocinador |
| Patrocinador desde (`dataInicio`) | Data | Sim | |
| E-mail (`email`) | Endereço de e-mail | Sim | Contacto |
| Website (`website`) | URL | Não | |
| Logótipo (`logotipo`) | URL de imagem | Não | Sem imagem, são apresentadas as iniciais |
| Mensagem (`mensagem`) | Texto, até 300 caracteres | Não | Aparece na ficha do patrocinador |

### Especialista

| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| Nome (`nome`) | Texto, até 80 caracteres | Sim | |
| Título académico (`titulo`) | Lista fechada | Sim | Licenciado(a) · Mestre · Doutor(a) |
| Especialidade (`especialidade`) | Texto com sugestões | Sim | Ex.: Ornitologia, Herpetologia |
| Âmbito (`ambito`) | Escolha única | Sim | **Todo o grupo** ou **Animais específicos** |
| Grupo (`grupo`) | Lista fechada | Sim, no âmbito "Todo o grupo" | Anfíbio · Ave · Mamífero · Peixe · Réptil |
| Animais (`animais`) | Lista de animais | Sim, pelo menos um, no âmbito "Animais específicos" | Ex.: tigre e leão |
| Instituição (`instituicao`) | Texto | Sim | |
| País (`pais`) | Texto | Não | |
| E-mail (`email`) | Endereço de e-mail | Sim | |
| Perfil científico (`perfil`) | URL | Não | ORCID ou página científica |
| Fotografia (`fotografia`) | URL de imagem | Não | Sem imagem, são apresentadas as iniciais |
| Biografia (`biografia`) | Texto, até 400 caracteres | Não | Aparece na ficha do especialista |

### Relações com as entidades existentes

- **Patrocinador ↔ Animal:** relação N:N. Um patrocinador apoia um ou mais animais, e um animal pode ter vários patrocinadores.
- **Especialista → Animais**, segundo o âmbito escolhido:
  - **Todo o grupo:** o especialista fica associado a todos os animais do grupo, incluindo os que venham a ser registados mais tarde;
  - **Animais específicos:** o especialista fica associado apenas aos animais selecionados, como um especialista em grandes felinos que acompanha o tigre e o leão sem ficar ligado a todos os mamíferos.

O formulário apresenta apenas uma das listas, de grupos ou de animais, consoante o âmbito. Esta opção resulta da discussão no fórum da Tarefa 3.1.

## Diagrama de navegação

A primeira página dos wireframes usa o vocabulário visual de Garrett (2002; trad. 2004), que separa a macroestrutura (as relações entre páginas) do detalhe de cada ecrã.

| Símbolo | Utilização neste diagrama |
| --- | --- |
| Página (retângulo) | Entrar, Gestão do Animalec, Gestão de animais, listas e formulários |
| Pilha de páginas | Páginas iguais para cada registo: formulário `?id=…` e fichas |
| Ponto de decisão (losango) | "Credenciais válidas?" e "Dados válidos?" |
| Área condicional (tracejada) | Todo o back-office, acessível apenas com sessão de administrador |
| Área | Janelas modais (`dialog`) |
| Área iterativa | A mesma estrutura serve Patrocinadores e Especialistas |
| Seta com barra na origem | Remover após confirmação: a ação não pode ser desfeita |

## Estados da interface

Além das vistas principais, os wireframes e os mockups apresentam três estados, em *browser* e em telemóvel:

| Estado | O que é apresentado |
| --- | --- |
| Formulário com erros | Resumo no topo com ligações para cada campo; campos assinalados a vermelho, com a mensagem junto de cada um |
| Pesquisa sem resultados | O cabeçalho da tabela mantém-se, o contador mostra "0 de 3" e surge a mensagem "Nenhum registo corresponde à pesquisa." |
| Dados longos (*stress*) | Nome com 80 caracteres e oito animais: o texto quebra e a linha ou o cartão cresce, sem deslocação horizontal |

## Integração no back-office

O protótipo segue o padrão do back-office descrito no livro e acrescenta-lhe as duas entidades.

| Bloco da aplicação | Integração das novas entidades |
| --- | --- |
| Barra de navegação | ADMIN dá acesso ao back-office; SAIR termina a sessão |
| Entrada | As páginas de gestão exigem credenciais de administrador |
| Página principal (Figura A.41) | Dois novos cartões, **Patrocinadores** e **Especialistas**, com o número de registos |
| Listas (Figuras A.42 e A.45) | Tabela com ordenação por nome, pesquisa e ações EDITAR, VER e REMOVER; nos especialistas, filtro por grupo e coluna Âmbito |
| Formulários (Figura A.46) | Adicionar e editar com validação; no especialista, a escolha do âmbito apresenta a lista de grupos, com os respetivos animais, ou a lista de animais |
| Janelas modais (Figuras A.43 e A.44) | Ficha de cada registo e confirmação antes da remoção |
| Gestão de animais | A ficha de cada animal apresenta os seus patrocinadores e os especialistas que o acompanham, por grupo ou como animal específico |

As áreas de utilizadores, quizzes e questões já existem no Animalec (Anexo A.3) e estão fora do âmbito desta tarefa. Os respetivos cartões levam a uma página que o indica.

## Estrutura HTML5 semântica

| Elemento | Utilização no protótipo |
| --- | --- |
| `header`, `nav`, `main`, `footer` | Estrutura comum a todas as páginas |
| `nav aria-label="Localização"` com `ol` | Trilho de navegação: Administração › Patrocinadores › … |
| `section`, `aside` | Blocos de conteúdo e notas complementares |
| `search` | Zona de pesquisa e filtro das listas |
| `table`, `caption`, `thead`, `th scope`, `aria-sort` | Listas de registos com ordenação |
| `form`, `fieldset`, `legend`, `label` | Formulários agrupados por tema: Identificação, Patrocínio, Contactos… |
| `input type="email"`, `"url"`, `"date"`, `required`, `maxlength`, `datalist` | Regras de validação no HTML e sugestões de preenchimento |
| `dialog` | Janelas modais para fichas e confirmações |
| `dl`, `dt`, `dd`, `blockquote` | Ficha de cada registo e mensagem do patrocinador |

Todas as páginas passam na validação do [html-validate](https://html-validate.org). Em ecrãs estreitos, as tabelas passam a cartões empilhados e o menu recolhe num botão.

### Semântica e funcionalidades nativas

Os elementos estruturais (`header`, `nav`, `main`, `table`, `fieldset`…) indicam **o que é** cada parte da página. Os atributos `required` e `type="email"` e o elemento `dialog` são **funcionalidades da plataforma** que dão comportamento com pouco código. As regras que o HTML não exprime, como "pelo menos um animal", são implementadas em JavaScript, em `js/app.js`.

## Acessibilidade

| Verificação | Resultado |
| --- | --- |
| [axe-core](https://github.com/dequelabs/axe-core) 4.10 (WCAG 2.1 A e AA e boas práticas), em oito páginas, em *browser* e telemóvel | 0 violações, incluindo os formulários com erros e as janelas modais abertas |
| Contraste | Cores de texto e de selos conformes com o nível AA, incluindo o selo **Ouro** (`#7a5c00`) |
| Teclado | Ligação "Saltar para o conteúdo"; ordem de tabulação lógica; foco sempre visível |
| Janelas modais | O foco entra no `dialog`; a tecla Esc fecha a janela; o foco regressa ao botão que a abriu |
| Erros nos formulários | Resumo no topo que recebe o foco, com ligações para os campos; `aria-invalid` e mensagem associada por `aria-describedby`; a mensagem desaparece assim que o campo fica válido |
| Validação sem JavaScript | As restrições estão no HTML, e o navegador valida os campos mesmo que o script não carregue |

## Guião de teste com utilizadores

Guião para validar os percursos com 3 a 5 participantes, a partir dos dados de exemplo:

| N.º | Tarefa | Dispositivo | Sucesso quando… |
| --- | --- | --- | --- |
| 1 | Adicionar o patrocinador "Fundação Mar Azul", de nível Prata, que apoia o crocodilo e a rã | Browser | O registo aparece na lista com os dois animais |
| 2 | Alterar esse patrocinador para o nível Ouro | Telemóvel | A lista apresenta o selo Ouro |
| 3 | Descobrir quem patrocina o leão e que especialistas o acompanham | Browser | O participante abre a ficha do leão e identifica o patrocinador e os dois especialistas |
| 4 | Encontrar o especialista em répteis e consultar o respetivo e-mail | Telemóvel | O participante usa o filtro ou a pesquisa e abre a ficha |
| 5 | Adicionar um especialista que acompanha apenas o crocodilo | Browser | O participante escolhe "Animais específicos" e marca o crocodilo |
| 6 | Remover a "Clínica Patas & Companhia" | Browser | O participante confirma a remoção e reconhece que a ação não pode ser desfeita |
| 7 | Tentar gravar um formulário vazio e corrigir os erros apenas com o teclado | Browser | O formulário é gravado sem recurso ao rato |

Para cada tarefa, registam-se a conclusão sem ajuda (sim/não), o tempo, os erros e hesitações e a dificuldade sentida, numa escala de 1 a 5. Antes de cada sessão, usa-se o botão **Repor dados de exemplo**.

## Preparação para Vue.js

O protótipo está organizado para a passagem a componentes na segunda parte do tópico. Os nomes das rotas seguem o padrão do livro (`listUsers`, `editUser`).

| Protótipo (HTML) | Vue.js |
| --- | --- |
| `admin.html` | Vista `Admin`, com um componente `CartaoAdmin` por entidade |
| `patrocinadores.html` / `especialistas.html` | Vistas `ListSponsors` / `ListExperts` (rotas `listSponsors`, `listExperts`) |
| `patrocinador.html?id=…` / `especialista.html?id=…` | Vistas `AddSponsor`, `EditSponsor`, `AddExpert` e `EditExpert` (rotas com o parâmetro `sponsorId` ou `expertId`) |
| Tabela com ordenação e ações | Componente `TabelaRegistos` (colunas por *props*, ações por *slot*) |
| `dialog id="janela"` (`abrirDialogo`, `confirmar`) | Componente `JanelaModal` |
| `prepararValidacao`, `validarFormulario` | Componentes `ResumoErros` e `CampoFormulario` |
| `js/dados.js` (`localStorage`) | Módulo da *store* por entidade, com chamadas à API REST do back-end |

Na migração, o estado, os eventos e a validação passam para os componentes e para a *store*; a estrutura semântica de cada vista mantém-se.

### Próximos passos

- Implementar as vistas e os componentes acima em Vue.js, ligados à API do back-end.
- Aplicar o guião de teste com utilizadores.
- Testar os percursos principais com um leitor de ecrã (NVDA ou VoiceOver).

## Referências

GARRETT, Jesse James. **Um vocabulário visual para AI e design de interação**. Tradução e adaptação: Livia Labate e Laura Cretton Lessa. [S. l.]: Information Architecture Institute, 2004. Original publicado em 2002. Disponível em: http://archive.iainstitute.org/pt/translations/000332.html. Acesso em: 16 nov. 2026.

QUEIRÓS, Ricardo; PORTELA, Filipe. **Desenvolvimento avançado para a Web**: do front-end ao back-end. Lisboa: FCA, 2020.

## Créditos

Ícones: [Font Awesome Free](https://fontawesome.com/license/free), licença CC BY 4.0. Tipos de letra: Montserrat e Open Sans, do [Google Fonts](https://fonts.google.com), licença SIL Open Font License.

Os patrocinadores, especialistas, instituições e endereços de e-mail usados nos exemplos são fictícios.
