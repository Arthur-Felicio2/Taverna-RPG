/* ==========================================================================
   TAVERNA REAL & ORDEM DOS TEMPLÁRIOS - CONTROLADOR DO FRONT-END
   Integração completa com API REST Spring Boot (/api/personagens) + Fallback Local
   ========================================================================== */

const API_URL = '/api/personagens';
const STORAGE_KEY = 'taverna_real_aventureiros_v3';
const PAGE_SIZE = 8;

const AVENTUREIROS_INICIAIS = [
    {
        nome: 'Trevor Belmont',
        raca: 'Humano',
        classe: 'Paladino',
        nivel: 38,
        pontosVida: 96,
        pontosMana: 45,
        atributoForca: 18,
        atributoDestreza: 17,
        atributoInteligencia: 13,
        alinhamento: 'Leal e Bom'
    },
    {
        nome: 'Sypha Belnades',
        raca: 'Humano',
        classe: 'Mago',
        nivel: 40,
        pontosVida: 62,
        pontosMana: 98,
        atributoForca: 9,
        atributoDestreza: 15,
        atributoInteligencia: 20,
        alinhamento: 'Neutro e Bom'
    },
    {
        nome: 'Alucard Tepes',
        raca: 'Dhampyr',
        classe: 'Guerreiro',
        nivel: 45,
        pontosVida: 99,
        pontosMana: 82,
        atributoForca: 19,
        atributoDestreza: 19,
        atributoInteligencia: 17,
        alinhamento: 'Caótico e Bom'
    },
    {
        nome: 'Godofredo de Acre',
        raca: 'Humano',
        classe: 'Paladino',
        nivel: 32,
        pontosVida: 92,
        pontosMana: 50,
        atributoForca: 18,
        atributoDestreza: 12,
        atributoInteligencia: 14,
        alinhamento: 'Leal e Neutro'
    },
    {
        nome: 'Irmão Tomás de Cluny',
        raca: 'Humano',
        classe: 'Clérigo',
        nivel: 27,
        pontosVida: 74,
        pontosMana: 88,
        atributoForca: 12,
        atributoDestreza: 11,
        atributoInteligencia: 18,
        alinhamento: 'Leal e Bom'
    },
    {
        nome: 'Astarion Ancunín',
        raca: 'Alto Elfo',
        classe: 'Ladino',
        nivel: 24,
        pontosVida: 58,
        pontosMana: 36,
        atributoForca: 11,
        atributoDestreza: 19,
        atributoInteligencia: 15,
        alinhamento: 'Caótico e Neutro'
    },
    {
        nome: 'Gimli Filho de Glóin',
        raca: 'Anão da Montanha',
        classe: 'Guerreiro',
        nivel: 29,
        pontosVida: 94,
        pontosMana: 12,
        atributoForca: 19,
        atributoDestreza: 12,
        atributoInteligencia: 11,
        alinhamento: 'Leal e Bom'
    },
    {
        nome: 'Jaskier Dandelion',
        raca: 'Humano',
        classe: 'Bardo',
        nivel: 18,
        pontosVida: 48,
        pontosMana: 66,
        atributoForca: 9,
        atributoDestreza: 15,
        atributoInteligencia: 16,
        alinhamento: 'Caótico e Bom'
    }
];

const CRUZADAS_DISPONIVEIS = [
    {
        id: 'abadia',
        rank: 'Grau I • Patrulha Sagrada',
        titulo: 'Abadia Profanada de Saint-Michel',
        lore: 'Espectros menores profanaram o relicário da abadia. Exige fé inabalável e aço consagrado.',
        requisitoNivel: 15,
        atributoChave: 'atributoForca',
        atributoNome: 'FOR',
        poderAlvo: 95,
        recompensa: 'Relíquia de Prata & 400 Florins'
    },
    {
        id: 'torre',
        rank: 'Grau II • Incursão Arcana',
        titulo: 'Torre do Relógio Sombrio',
        lore: 'Engrenagens amaldiçoadas e gárgulas guardam o grimório perdido nos pináculos da cidadela.',
        requisitoNivel: 25,
        atributoChave: 'atributoDestreza',
        atributoNome: 'DES',
        poderAlvo: 135,
        recompensa: 'Grimório do Crepúsculo & 900 Florins'
    },
    {
        id: 'catacumbas',
        rank: 'Grau III • Cerco Templário',
        titulo: 'Catacumbas Submersas de Acre',
        lore: 'Necromantes evocam legiões sob as ruínas templárias. Apenas intelecto e mana contêm o ritual.',
        requisitoNivel: 32,
        atributoChave: 'atributoInteligencia',
        atributoNome: 'INT',
        poderAlvo: 165,
        recompensa: 'Selo Carmesim da Ordem & 1.500 Florins'
    },
    {
        id: 'castelo',
        rank: 'Grau IV • Cruzada Suprema',
        titulo: 'Sala do Trono de Castlevania',
        lore: 'O próprio Senhor das Trevas aguarda sob o vitral lunar. Somente os campeões lendários retornam vivos.',
        requisitoNivel: 40,
        atributoChave: 'atributoForca',
        atributoNome: 'FOR',
        poderAlvo: 210,
        recompensa: 'Coroa Imortal da Alvorada & 5.000 Florins'
    }
];

let listaPersonagensCache = [];
let idsSelecionados = new Set();
let filtroClasseAtivo = '';
let ordemNivelDesc = true;
let modoExibicao = 'table';
let paginaAtual = 1;
let isBackendOnline = false;
let acaoConfirmacaoPendente = null;
let toastTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarPersonagens();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal('modal-cadastro');
            fecharModal('modal-ficha');
            fecharModal('modal-confirmacao');
        }
    });
});

/* ==========================================================================
   NAVEGAÇÃO ENTRE ABAS & VISUALIZAÇÃO
   ========================================================================== */
function ativarAba(nomeAba) {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === nomeAba);
    });

    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `view-${nomeAba}`);
    });

    if (nomeAba === 'cruzadas') {
        renderizarQuadroCruzadas();
    } else if (nomeAba === 'cronicas') {
        renderizarAltarCronicas();
    }
}

function alternarModoExibicao(modo) {
    modoExibicao = modo;
    document.getElementById('btn-view-table').classList.toggle('active', modo === 'table');
    document.getElementById('btn-view-cards').classList.toggle('active', modo === 'cards');
    atualizarTela();
}

/* ==========================================================================
   CONEXÃO COM API SPRING BOOT & PERSISTÊNCIA
   ========================================================================== */
function atualizarIndicadorConexao(online) {
    isBackendOnline = online;
    const badge = document.getElementById('status-conexao');
    const texto = document.getElementById('status-conexao-texto');
    if (online) {
        badge.classList.remove('offline');
        texto.textContent = 'PostgreSQL Ativo';
    } else {
        badge.classList.add('offline');
        texto.textContent = 'Pergaminho Local';
    }
}

async function carregarPersonagens(notificarSync = false) {
    let carregouApi = false;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            listaPersonagensCache = await res.json();
            salvarNoStorage(listaPersonagensCache);
            carregouApi = true;
            atualizarIndicadorConexao(true);
        }
    } catch (error) {
        atualizarIndicadorConexao(false);
    }

    if (!carregouApi) {
        atualizarIndicadorConexao(false);
        const dadosLocais = localStorage.getItem(STORAGE_KEY);
        if (dadosLocais) {
            try {
                listaPersonagensCache = JSON.parse(dadosLocais);
            } catch (e) {
                listaPersonagensCache = criarCopiaIniciais();
            }
        } else {
            listaPersonagensCache = criarCopiaIniciais();
            salvarNoStorage(listaPersonagensCache);
        }
    }

    paginaAtual = 1;
    idsSelecionados.clear();
    atualizarTela();

    if (notificarSync) {
        notificar(
            carregouApi
                ? 'Códice sincronizado com a base PostgreSQL!'
                : 'Servidor offline; exibindo cópia em pergaminho local.',
            carregouApi ? 'fa-solid fa-arrows-rotate' : 'fa-solid fa-scroll'
        );
    }
}

function criarCopiaIniciais() {
    return AVENTUREIROS_INICIAIS.map((item, idx) => ({
        ...item,
        id: idx + 1
    }));
}

function salvarNoStorage(dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

/* ==========================================================================
   FILTRAGEM, ORDENAÇÃO & PAGINAÇÃO
   ========================================================================== */
function obterDadosFiltrados() {
    const termo = (document.getElementById('filtro-busca')?.value || '').toLowerCase().trim();
    let dados = [...listaPersonagensCache];

    if (filtroClasseAtivo) {
        dados = dados.filter(p => p.classe && p.classe.toLowerCase().includes(filtroClasseAtivo.toLowerCase()));
    }

    if (termo) {
        dados = dados.filter(p =>
            (p.nome && p.nome.toLowerCase().includes(termo)) ||
            (p.raca && p.raca.toLowerCase().includes(termo)) ||
            (p.classe && p.classe.toLowerCase().includes(termo)) ||
            (p.alinhamento && p.alinhamento.toLowerCase().includes(termo))
        );
    }

    return dados;
}

function filtrarAventureiros() {
    paginaAtual = 1;
    atualizarTela();
}

function filtrarPorClasse(classe, botaoEl) {
    document.querySelectorAll('.class-sigil-filters .sigil-filter-btn').forEach(btn => btn.classList.remove('active'));
    if (botaoEl) botaoEl.classList.add('active');
    filtroClasseAtivo = classe;
    paginaAtual = 1;
    atualizarTela();
}

function ordenarPorNivel() {
    listaPersonagensCache.sort((a, b) => {
        const na = parseInt(a.nivel) || 0;
        const nb = parseInt(b.nivel) || 0;
        return ordemNivelDesc ? (nb - na) : (na - nb);
    });
    ordemNivelDesc = !ordemNivelDesc;
    paginaAtual = 1;
    atualizarTela();
    notificar(
        ordemNivelDesc
            ? 'Ordenados do menor ao maior grau de maestria.'
            : 'Ordenados do maior ao menor grau de maestria!',
        'fa-solid fa-arrow-up-wide-short'
    );
}

function irParaPagina(novaPagina) {
    paginaAtual = novaPagina;
    atualizarTela();
}

/* ==========================================================================
   RENDERIZAÇÃO PRINCIPAL (KPIS, TABELA, CARTAS & PAGINAÇÃO)
   ========================================================================== */
function atualizarTela() {
    const filtrados = obterDadosFiltrados();
    atualizarKPIs(listaPersonagensCache);
    renderizarLista(filtrados);
    atualizarBarraSelecao();
}

function atualizarKPIs(dados) {
    const total = dados.length;
    document.getElementById('kpi-recrutados').textContent = total;
    document.getElementById('badge-total').textContent = `${total} ${total === 1 ? 'Juramentado' : 'Juramentados'}`;

    const capacidadeMaxima = 20;
    const ocupacaoPerc = Math.min(Math.round((total / capacidadeMaxima) * 100), 100);
    document.getElementById('kpi-ocupacao').textContent = `${ocupacaoPerc}%`;

    if (total > 0) {
        const somaNiveis = dados.reduce((acc, p) => acc + (parseInt(p.nivel) || 1), 0);
        document.getElementById('kpi-nivel-medio').textContent = (somaNiveis / total).toFixed(1);
    } else {
        document.getElementById('kpi-nivel-medio').textContent = '0.0';
    }

    const leais = dados.filter(p => {
        const a = (p.alinhamento || '').toLowerCase();
        return a.includes('bom') || a.includes('leal');
    }).length;
    document.getElementById('kpi-leais').textContent = leais;
}

function renderizarLista(dadosFiltrados) {
    const totalItens = dadosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / PAGE_SIZE));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    const paginaDados = dadosFiltrados.slice(inicio, inicio + PAGE_SIZE);

    const tbody = document.getElementById('tabela-personagens');
    const tableWrap = document.getElementById('table-view-wrapper');
    const cardsWrap = document.getElementById('cards-view-wrapper');
    const emptyState = document.getElementById('empty-state');
    const footerCount = document.getElementById('footer-count');

    tbody.innerHTML = '';
    cardsWrap.innerHTML = '';

    if (totalItens === 0) {
        tableWrap.style.display = 'none';
        cardsWrap.style.display = 'none';
        emptyState.style.display = 'block';
        footerCount.textContent = 'Exibindo 0 juramentados';
        renderizarPaginacao(0, 1);
        return;
    }

    emptyState.style.display = 'none';
    const exibindoInicio = inicio + 1;
    const exibindoFim = inicio + paginaDados.length;
    footerCount.textContent = `Exibindo ${exibindoInicio}–${exibindoFim} de ${totalItens} ${totalItens === 1 ? 'juramentado' : 'juramentados'}`;

    if (modoExibicao === 'table') {
        tableWrap.style.display = 'block';
        cardsWrap.style.display = 'none';
        renderizarLinhasTabela(paginaDados, tbody);
    } else {
        tableWrap.style.display = 'none';
        cardsWrap.style.display = 'grid';
        renderizarCartasHeraldicas(paginaDados, cardsWrap);
    }

    renderizarPaginacao(totalItens, totalPaginas);
    sincronizarCheckboxMestre(paginaDados);
}

function renderizarLinhasTabela(paginaDados, tbody) {
    paginaDados.forEach((p) => {
        const icone = obterIconeClasse(p.classe);
        const seloMoral = obterSeloMoral(p.alinhamento);
        const nivel = p.nivel ?? 1;
        const vida = p.pontosVida ?? 0;
        const mana = p.pontosMana ?? 0;
        const forca = p.atributoForca ?? 0;
        const destreza = p.atributoDestreza ?? 0;
        const inteligencia = p.atributoInteligencia ?? 0;
        const hpPct = Math.min(Math.max((vida / 100) * 100, 8), 100);
        const mpPct = Math.min(Math.max((mana / 100) * 100, 8), 100);
        const selecionado = idsSelecionados.has(p.id);

        const tr = document.createElement('tr');
        if (selecionado) tr.classList.add('row-selected');

        tr.onclick = (e) => {
            if (e.target.closest('button') || e.target.closest('.gothic-checkbox')) return;
            abrirFichaPersonagem(p.id);
        };

        tr.innerHTML = `
            <td style="text-align: center;">
                <span class="gothic-checkbox ${selecionado ? 'checked' : ''}" onclick="event.stopPropagation(); alternarSelecao(${p.id})">
                    <i class="fa-solid fa-check" style="${selecionado ? 'display: block;' : 'display: none;'} font-size: 10px;"></i>
                </span>
            </td>
            <td>
                <div class="knight-cell">
                    <div class="knight-crest-avatar">
                        <i class="${icone}"></i>
                    </div>
                    <div class="knight-details">
                        <span class="knight-name">${escapeHtml(p.nome)}</span>
                        <span class="knight-id">Selo #${String(p.id).padStart(3, '0')}</span>
                    </div>
                </div>
            </td>
            <td>
                <span class="class-badge"><i class="${icone}"></i> ${escapeHtml(p.classe || 'Andarilho')}</span>
            </td>
            <td>
                <span class="race-text">${escapeHtml(p.raca || 'Desconhecida')}</span>
            </td>
            <td style="text-align: center;">
                <span class="level-crest">NV ${nivel}</span>
            </td>
            <td>
                <div class="castlevania-vitals">
                    <div class="vital-line">
                        <div class="vital-meta">
                            <span class="lbl-hp">PV</span>
                            <span class="val">${vida}</span>
                        </div>
                        <div class="gothic-bar-track">
                            <div class="gothic-bar-fill-hp" style="width: ${hpPct}%;"></div>
                        </div>
                    </div>
                    <div class="vital-line">
                        <div class="vital-meta">
                            <span class="lbl-mp">PM</span>
                            <span class="val">${mana}</span>
                        </div>
                        <div class="gothic-bar-track">
                            <div class="gothic-bar-fill-mp" style="width: ${mpPct}%;"></div>
                        </div>
                    </div>
                </div>
            </td>
            <td style="text-align: center;">
                <div class="triad-tablet">
                    ${forca} <span class="sep">/</span> ${destreza} <span class="sep">/</span> ${inteligencia}
                </div>
            </td>
            <td>
                <span class="wax-seal-pill ${seloMoral.classe}">
                    <i class="${seloMoral.icone}"></i> ${escapeHtml(seloMoral.texto)}
                </span>
            </td>
            <td style="text-align: right; padding-right: 18px;">
                <div class="row-actions">
                    <button type="button" class="btn-codex-action" title="Inspecionar Pergaminho" onclick="event.stopPropagation(); abrirFichaPersonagem(${p.id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button type="button" class="btn-codex-action" title="Editar Registro" onclick="event.stopPropagation(); editarPersonagemPorId(${p.id})">
                        <i class="fa-solid fa-pen-nib"></i>
                    </button>
                    <button type="button" class="btn-codex-action banish" title="Banir da Ordem" onclick="event.stopPropagation(); solicitarExclusao(${p.id})">
                        <i class="fa-solid fa-skull"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarCartasHeraldicas(paginaDados, container) {
    paginaDados.forEach((p) => {
        const icone = obterIconeClasse(p.classe);
        const seloMoral = obterSeloMoral(p.alinhamento);
        const nivel = p.nivel ?? 1;
        const vida = p.pontosVida ?? 0;
        const mana = p.pontosMana ?? 0;
        const forca = p.atributoForca ?? 0;
        const destreza = p.atributoDestreza ?? 0;
        const inteligencia = p.atributoInteligencia ?? 0;
        const hpPct = Math.min(Math.max((vida / 100) * 100, 8), 100);
        const mpPct = Math.min(Math.max((mana / 100) * 100, 8), 100);

        const card = document.createElement('article');
        card.className = 'knight-tarot-card';
        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            abrirFichaPersonagem(p.id);
        };

        card.innerHTML = `
            <div class="tarot-header">
                <div class="knight-cell">
                    <div class="knight-crest-avatar">
                        <i class="${icone}"></i>
                    </div>
                    <div class="knight-details">
                        <span class="knight-name">${escapeHtml(p.nome)}</span>
                        <span class="knight-id">${escapeHtml(p.raca || 'Desconhecida')} &bull; ${escapeHtml(p.classe || 'Andarilho')}</span>
                    </div>
                </div>
                <span class="level-crest">NV ${nivel}</span>
            </div>

            <div class="castlevania-vitals" style="width: 100%;">
                <div class="vital-line">
                    <div class="vital-meta">
                        <span class="lbl-hp">VITALIDADE (PV)</span>
                        <span class="val">${vida}</span>
                    </div>
                    <div class="gothic-bar-track">
                        <div class="gothic-bar-fill-hp" style="width: ${hpPct}%;"></div>
                    </div>
                </div>
                <div class="vital-line">
                    <div class="vital-meta">
                        <span class="lbl-mp">ÉTER ARCANO (PM)</span>
                        <span class="val">${mana}</span>
                    </div>
                    <div class="gothic-bar-track">
                        <div class="gothic-bar-fill-mp" style="width: ${mpPct}%;"></div>
                    </div>
                </div>
            </div>

            <div class="tarot-stats-grid">
                <div class="tarot-stat-box">
                    <span class="tarot-stat-lbl">FOR</span>
                    <span class="tarot-stat-val">${forca}</span>
                </div>
                <div class="tarot-stat-box">
                    <span class="tarot-stat-lbl">DES</span>
                    <span class="tarot-stat-val">${destreza}</span>
                </div>
                <div class="tarot-stat-box">
                    <span class="tarot-stat-lbl">INT</span>
                    <span class="tarot-stat-val">${inteligencia}</span>
                </div>
            </div>

            <div class="tarot-footer">
                <span class="wax-seal-pill ${seloMoral.classe}">
                    <i class="${seloMoral.icone}"></i> ${escapeHtml(seloMoral.texto)}
                </span>
                <div class="row-actions">
                    <button type="button" class="btn-codex-action" title="Editar" onclick="event.stopPropagation(); editarPersonagemPorId(${p.id})">
                        <i class="fa-solid fa-pen-nib"></i>
                    </button>
                    <button type="button" class="btn-codex-action banish" title="Banir" onclick="event.stopPropagation(); solicitarExclusao(${p.id})">
                        <i class="fa-solid fa-skull"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderizarPaginacao(totalItens, totalPaginas) {
    const container = document.getElementById('pagination-controls');
    container.innerHTML = '';

    if (totalItens === 0) return;

    const btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.className = 'page-rune-btn';
    btnPrev.disabled = paginaAtual <= 1;
    btnPrev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    btnPrev.onclick = () => irParaPagina(paginaAtual - 1);
    container.appendChild(btnPrev);

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `page-rune-btn ${i === paginaAtual ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => irParaPagina(i);
        container.appendChild(btn);
    }

    const btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.className = 'page-rune-btn';
    btnNext.disabled = paginaAtual >= totalPaginas;
    btnNext.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    btnNext.onclick = () => irParaPagina(paginaAtual + 1);
    container.appendChild(btnNext);
}

/* ==========================================================================
   SELEÇÃO INDIVIDUAL E EM LOTE
   ========================================================================== */
function alternarSelecao(id) {
    if (idsSelecionados.has(id)) {
        idsSelecionados.delete(id);
    } else {
        idsSelecionados.add(id);
    }
    atualizarTela();
}

function alternarTodosCheckboxes() {
    const filtrados = obterDadosFiltrados();
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    const paginaDados = filtrados.slice(inicio, inicio + PAGE_SIZE);
    const todosMarcados = paginaDados.length > 0 && paginaDados.every(p => idsSelecionados.has(p.id));

    paginaDados.forEach(p => {
        if (todosMarcados) {
            idsSelecionados.delete(p.id);
        } else {
            idsSelecionados.add(p.id);
        }
    });
    atualizarTela();
}

function sincronizarCheckboxMestre(paginaDados) {
    const master = document.getElementById('master-checkbox');
    if (!master) return;
    const todosMarcados = paginaDados.length > 0 && paginaDados.every(p => idsSelecionados.has(p.id));
    master.classList.toggle('checked', todosMarcados);
    master.querySelector('i').style.display = todosMarcados ? 'block' : 'none';
}

function limparSelecao() {
    idsSelecionados.clear();
    atualizarTela();
}

function atualizarBarraSelecao() {
    const bar = document.getElementById('bulk-action-bar');
    const texto = document.getElementById('bulk-count-text');
    const qtd = idsSelecionados.size;
    bar.classList.toggle('visible', qtd > 0);
    texto.textContent = `${qtd} ${qtd === 1 ? 'juramentado selecionado' : 'juramentados selecionados'} no códice`;
}

/* ==========================================================================
   CRUD: CRIAR, EDITAR, INSPECCIONAR & BANIR
   ========================================================================== */
function abrirModalCadastro() {
    document.getElementById('modal-cadastro').classList.add('open');
    document.getElementById('txtNome').focus();
}

function fecharModalCadastro() {
    fecharModal('modal-cadastro');
    limparFormulario();
}

function fecharModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

function fecharModalAoClicarFora(e, id) {
    if (e.target.id === id) {
        if (id === 'modal-cadastro') {
            fecharModalCadastro();
        } else {
            fecharModal(id);
        }
    }
}

function limparFormulario() {
    document.getElementById('form-personagem').reset();
    document.getElementById('txtId').value = '';
    document.getElementById('modal-titulo').innerHTML = `<i class="fa-solid fa-feather-pointed"></i> Consagrar Aventureiro`;
    document.getElementById('btnSalvar').innerHTML = `<i class="fa-solid fa-stamp"></i> Selar no Códice`;
}

function editarPersonagemPorId(id) {
    const p = listaPersonagensCache.find(item => item.id === id);
    if (!p) return;

    document.getElementById('txtId').value = p.id;
    document.getElementById('txtNome').value = p.nome || '';
    document.getElementById('txtRaca').value = p.raca || '';
    document.getElementById('txtClasse').value = p.classe || '';
    document.getElementById('txtNivel').value = p.nivel ?? 1;
    document.getElementById('txtVida').value = p.pontosVida ?? 10;
    document.getElementById('txtMana').value = p.pontosMana ?? 0;
    document.getElementById('txtForca').value = p.atributoForca ?? 10;
    document.getElementById('txtDestreza').value = p.atributoDestreza ?? 10;
    document.getElementById('txtInteligencia').value = p.atributoInteligencia ?? 10;
    document.getElementById('txtAlinhamento').value = p.alinhamento || '';

    document.getElementById('modal-titulo').innerHTML = `<i class="fa-solid fa-pen-nib"></i> Retificar Registro (#${p.id})`;
    document.getElementById('btnSalvar').innerHTML = `<i class="fa-solid fa-stamp"></i> Atualizar Selo`;

    abrirModalCadastro();
}

async function salvarPersonagem() {
    const idStr = document.getElementById('txtId').value;
    const isEdicao = Boolean(idStr);

    const payload = {
        nome: document.getElementById('txtNome').value.trim(),
        raca: document.getElementById('txtRaca').value.trim(),
        classe: document.getElementById('txtClasse').value.trim(),
        nivel: parseInt(document.getElementById('txtNivel').value, 10),
        pontosVida: parseInt(document.getElementById('txtVida').value, 10),
        pontosMana: parseInt(document.getElementById('txtMana').value, 10),
        atributoForca: parseInt(document.getElementById('txtForca').value, 10),
        atributoDestreza: parseInt(document.getElementById('txtDestreza').value, 10),
        atributoInteligencia: parseInt(document.getElementById('txtInteligencia').value, 10),
        alinhamento: document.getElementById('txtAlinhamento').value.trim()
    };

    if (!payload.nome || !payload.raca || !payload.classe || !payload.alinhamento ||
        isNaN(payload.nivel) || isNaN(payload.pontosVida) || isNaN(payload.pontosMana) ||
        isNaN(payload.atributoForca) || isNaN(payload.atributoDestreza) || isNaN(payload.atributoInteligencia)) {
        notificar('Preencha todos os campos do pergaminho antes de selar.', 'fa-solid fa-triangle-exclamation');
        return;
    }

    let registroPersistido = null;
    try {
        const metodo = isEdicao ? 'PUT' : 'POST';
        const url = isEdicao ? `${API_URL}/${idStr}` : API_URL;
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => null);
            const msgErro = errData?.message
                ? escapeHtml(errData.message)
                : 'Erro ao selar no PostgreSQL (verifique se o nome já existe no códice).';
            notificar(msgErro, 'fa-solid fa-circle-exclamation');
            return;
        }
        registroPersistido = await res.json();
        atualizarIndicadorConexao(true);
    } catch (error) {
        atualizarIndicadorConexao(false);
        // Modo offline: gera ID local apenas quando servidor não responde
        const idNum = isEdicao
            ? parseInt(idStr, 10)
            : (listaPersonagensCache.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1);
        registroPersistido = { id: idNum, ...payload };
    }

    if (isEdicao) {
        const idx = listaPersonagensCache.findIndex(p => p.id === parseInt(idStr, 10));
        if (idx !== -1) {
            listaPersonagensCache[idx] = registroPersistido;
        } else {
            listaPersonagensCache.push(registroPersistido);
        }
    } else {
        listaPersonagensCache.unshift(registroPersistido);
    }

    salvarNoStorage(listaPersonagensCache);
    fecharModalCadastro();
    atualizarTela();

    notificar(
        isEdicao
            ? `Selo de <strong>${escapeHtml(registroPersistido.nome)}</strong> atualizado com honra!`
            : `<strong>${escapeHtml(registroPersistido.nome)}</strong> foi consagrado à Ordem!`,
        'fa-solid fa-crown'
    );
}

function abrirFichaPersonagem(id) {
    const p = listaPersonagensCache.find(item => item.id === id);
    if (!p) return;

    const icone = obterIconeClasse(p.classe);
    const seloMoral = obterSeloMoral(p.alinhamento);
    const poderCombate = calcularPoderCombate(p);
    const nivel = p.nivel ?? 1;
    const vida = p.pontosVida ?? 0;
    const mana = p.pontosMana ?? 0;
    const forca = p.atributoForca ?? 0;
    const destreza = p.atributoDestreza ?? 0;
    const inteligencia = p.atributoInteligencia ?? 0;
    const dataFormatada = p.dataCriacao
        ? new Date(p.dataCriacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Era Imemorial';

    const hpPct = Math.min(Math.max((vida / 100) * 100, 8), 100);
    const mpPct = Math.min(Math.max((mana / 100) * 100, 8), 100);

    document.getElementById('ficha-conteudo').innerHTML = `
        <div class="status-sheet-hero">
            <div class="status-sheet-portrait">
                <i class="${icone}"></i>
            </div>
            <div class="status-sheet-meta">
                <h3>${escapeHtml(p.nome)}</h3>
                <p>${escapeHtml(p.raca || 'Desconhecida')} &bull; ${escapeHtml(p.classe || 'Andarilho')} de Grau ${nivel}</p>
                <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                    <span class="wax-seal-pill ${seloMoral.classe}">
                        <i class="${seloMoral.icone}"></i> ${escapeHtml(seloMoral.texto)}
                    </span>
                    <span class="level-crest">PODER ${poderCombate}</span>
                </div>
            </div>
        </div>

        <div class="castlevania-vitals" style="width: 100%; gap: 12px;">
            <div class="vital-line">
                <div class="vital-meta">
                    <span class="lbl-hp">PONTOS DE VIDA (PV)</span>
                    <span class="val">${vida}</span>
                </div>
                <div class="gothic-bar-track" style="height: 9px;">
                    <div class="gothic-bar-fill-hp" style="width: ${hpPct}%;"></div>
                </div>
            </div>
            <div class="vital-line">
                <div class="vital-meta">
                    <span class="lbl-mp">PONTOS DE MANA (PM)</span>
                    <span class="val">${mana}</span>
                </div>
                <div class="gothic-bar-track" style="height: 9px;">
                    <div class="gothic-bar-fill-mp" style="width: ${mpPct}%;"></div>
                </div>
            </div>
        </div>

        <div class="status-attr-row">
            <div class="status-attr-card">
                <span>Força (FOR)</span>
                <strong>${forca}</strong>
            </div>
            <div class="status-attr-card">
                <span>Destreza (DES)</span>
                <strong>${destreza}</strong>
            </div>
            <div class="status-attr-card">
                <span>Inteligência (INT)</span>
                <strong>${inteligencia}</strong>
            </div>
        </div>

        <p style="margin-top: 16px; font-size: 0.92rem; color: var(--text-muted); font-style: italic; text-align: right;">
            Selo #${p.id} &bull; Consagrado em ${dataFormatada}
        </p>
    `;

    document.getElementById('btn-ficha-editar').onclick = () => {
        fecharModal('modal-ficha');
        editarPersonagemPorId(p.id);
    };

    document.getElementById('modal-ficha').classList.add('open');
}

/* ==========================================================================
   CONFIRMAÇÕES GÓTICAS (EXCLUSÃO & RESTAURAÇÃO)
   ========================================================================== */
function abrirConfirmacao(titulo, mensagem, callback) {
    document.getElementById('confirm-titulo').innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${titulo}`;
    document.getElementById('confirm-mensagem').innerHTML = mensagem;
    acaoConfirmacaoPendente = callback;

    const btn = document.getElementById('btn-confirmar-acao');
    btn.onclick = async () => {
        fecharModal('modal-confirmacao');
        if (acaoConfirmacaoPendente) {
            await acaoConfirmacaoPendente();
            acaoConfirmacaoPendente = null;
        }
    };
    document.getElementById('modal-confirmacao').classList.add('open');
}

function solicitarExclusao(id) {
    const p = listaPersonagensCache.find(item => item.id === id);
    const nome = p ? escapeHtml(p.nome) : 'este juramentado';
    abrirConfirmacao(
        'Decreto de Banimento',
        `Deseja realmente riscar <strong>${nome}</strong> dos pergaminhos da Ordem? Esta ação é permanente.`,
        () => executarExclusao(id)
    );
}

async function executarExclusao(id) {
    const p = listaPersonagensCache.find(item => item.id === id);
    const nome = p ? p.nome : 'Aventureiro';

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok || res.status === 204 || res.status === 404) {
            atualizarIndicadorConexao(true);
        } else {
            notificar('Erro ao banir aventureiro no servidor PostgreSQL.', 'fa-solid fa-circle-exclamation');
            return;
        }
    } catch (error) {
        atualizarIndicadorConexao(false);
    }

    listaPersonagensCache = listaPersonagensCache.filter(item => item.id !== id);
    idsSelecionados.delete(id);
    salvarNoStorage(listaPersonagensCache);
    atualizarTela();
    notificar(`<strong>${escapeHtml(nome)}</strong> foi banido do códice.`, 'fa-solid fa-skull');
}

function solicitarExclusaoEmLote() {
    const qtd = idsSelecionados.size;
    if (qtd === 0) return;
    abrirConfirmacao(
        'Expurgo em Lote',
        `Confirma o banimento de <strong>${qtd}</strong> ${qtd === 1 ? 'juramentado selecionado' : 'juramentados selecionados'}?`,
        executarExclusaoEmLote
    );
}

async function executarExclusaoEmLote() {
    const idsParaRemover = Array.from(idsSelecionados);
    for (const id of idsParaRemover) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch (e) {
            // Continua fallback local
        }
    }
    listaPersonagensCache = listaPersonagensCache.filter(p => !idsSelecionados.has(p.id));
    idsSelecionados.clear();
    salvarNoStorage(listaPersonagensCache);
    atualizarTela();
    notificar(`${idsParaRemover.length} registros banidos do códice.`, 'fa-solid fa-skull-crossbones');
}

function solicitarRestauracao() {
    abrirConfirmacao(
        'Invocar Ordem Padrão',
        'Deseja invocar os campeões clássicos da Ordem Templária para o códice? Nomes já existentes serão preservados.',
        restaurarDadosIniciais
    );
}

async function restaurarDadosIniciais() {
    const nomesExistentes = new Set(listaPersonagensCache.map(p => (p.nome || '').toLowerCase()));
    const faltantes = AVENTUREIROS_INICIAIS.filter(p => !nomesExistentes.has(p.nome.toLowerCase()));

    if (faltantes.length === 0) {
        notificar('Todos os campeões da Ordem já estão inscritos no códice.', 'fa-solid fa-scroll');
        return;
    }

    let inseridosNoBanco = 0;
    for (const modelo of faltantes) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(modelo)
            });
            if (res.ok) {
                const criado = await res.json();
                listaPersonagensCache.push(criado);
                inseridosNoBanco++;
                atualizarIndicadorConexao(true);
                continue;
            }
        } catch (e) {
            atualizarIndicadorConexao(false);
        }

        // Fallback local se API indisponível
        const nextId = listaPersonagensCache.reduce((m, item) => Math.max(m, item.id || 0), 0) + 1;
        listaPersonagensCache.push({ id: nextId, ...modelo });
    }

    salvarNoStorage(listaPersonagensCache);
    paginaAtual = 1;
    atualizarTela();
    notificar(
        inseridosNoBanco > 0
            ? `${inseridosNoBanco} campeões consagrados na base PostgreSQL!`
            : `${faltantes.length} campeões restaurados no pergaminho local.`,
        'fa-solid fa-rotate-left'
    );
}

/* ==========================================================================
   ABA 2: QUADRO DE CRUZADAS (SIMULADOR TÁTICO COM DADOS REAIS)
   ========================================================================== */
function renderizarQuadroCruzadas() {
    const select = document.getElementById('select-campeao-cruzada');
    const board = document.getElementById('crusade-board');

    select.innerHTML = '';
    if (listaPersonagensCache.length === 0) {
        select.innerHTML = '<option value="">Nenhum aventureiro disponível</option>';
    } else {
        listaPersonagensCache.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nome} (${p.classe} • Nv ${p.nivel})`;
            select.appendChild(opt);
        });
    }

    board.innerHTML = CRUZADAS_DISPONIVEIS.map(c => `
        <article class="gothic-frame crusade-card">
            <div>
                <span class="crusade-rank">${c.rank}</span>
                <h3 class="crusade-title">${c.titulo}</h3>
                <p class="crusade-lore" style="margin-top: 8px;">${c.lore}</p>
            </div>
            <div>
                <div class="crusade-meta" style="margin-bottom: 12px;">
                    <span><i class="fa-solid fa-crown"></i> Nv. Rec: ${c.requisitoNivel}+</span>
                    <span><i class="fa-solid fa-dice-d20"></i> Chave: ${c.atributoNome}</span>
                    <span><i class="fa-solid fa-coins"></i> ${c.recompensa}</span>
                </div>
                <div id="crusade-res-${c.id}" class="crusade-result" style="margin-bottom: 12px;"></div>
                <button type="button" class="btn-gothic btn-templar-primary" style="width: 100%;" onclick="executarCruzada('${c.id}')">
                    <i class="fa-solid fa-khanda"></i> Despachar Campeão
                </button>
            </div>
        </article>
    `).join('');
}

function executarCruzada(cruzadaId) {
    const select = document.getElementById('select-campeao-cruzada');
    const idCampeao = parseInt(select.value, 10);
    const campeao = listaPersonagensCache.find(p => p.id === idCampeao);
    const cruzada = CRUZADAS_DISPONIVEIS.find(c => c.id === cruzadaId);
    const resBox = document.getElementById(`crusade-res-${cruzadaId}`);

    if (!campeao || !cruzada) {
        notificar('Consagre ao menos um aventureiro antes de iniciar uma cruzada.', 'fa-solid fa-triangle-exclamation');
        return;
    }

    const poderTotal = calcularPoderCombate(campeao) + ((campeao[cruzada.atributoChave] || 10) * 2);
    const dado = Math.floor(Math.random() * 20) + 1;
    const pontuacaoFinal = poderTotal + dado;
    const venceu = pontuacaoFinal >= cruzada.poderAlvo;

    resBox.classList.add('show');
    if (venceu) {
        resBox.style.borderColor = 'var(--seal-good-border)';
        resBox.innerHTML = `<strong style="color: var(--seal-good-text);">Vitória Templária!</strong> ${escapeHtml(campeao.nome)} alcançou <strong>${pontuacaoFinal}</strong> pts (d20: ${dado}) e retornou com <em>${cruzada.recompensa}</em>.`;
        notificar(`<strong>${escapeHtml(campeao.nome)}</strong> triunfou em ${cruzada.titulo}!`, 'fa-solid fa-trophy');
    } else {
        resBox.style.borderColor = 'var(--seal-evil-border)';
        resBox.innerHTML = `<strong style="color: var(--seal-evil-text);">Retirada Tática!</strong> ${escapeHtml(campeao.nome)} somou <strong>${pontuacaoFinal}</strong> pts (alvo ${cruzada.poderAlvo}). Eleve seu nível ou atributos antes de retornar.`;
        notificar(`${escapeHtml(campeao.nome)} recuou da expedição.`, 'fa-solid fa-shield-halved');
    }
}

/* ==========================================================================
   ABA 3: ALTAR DE CRÔNICAS (RELATÓRIOS ANALÍTICOS EM TEMPO REAL)
   ========================================================================== */
function renderizarAltarCronicas() {
    const container = document.getElementById('analytics-container');
    const dados = listaPersonagensCache;

    if (dados.length === 0) {
        container.innerHTML = `
            <div class="gothic-frame chronicle-panel" style="grid-column: 1 / -1; text-align: center;">
                <p style="font-style: italic; color: var(--text-muted);">O Altar de Crônicas aguarda o registro do primeiro aventureiro.</p>
            </div>
        `;
        return;
    }

    // 1. Contagem por Classe
    const porClasse = {};
    dados.forEach(p => {
        const cls = p.classe || 'Andarilho';
        porClasse[cls] = (porClasse[cls] || 0) + 1;
    });
    const classesOrdenadas = Object.entries(porClasse).sort((a, b) => b[1] - a[1]);

    // 2. Contagem por Alinhamento
    let luz = 0, equilibrio = 0, trevas = 0;
    dados.forEach(p => {
        const a = (p.alinhamento || '').toLowerCase();
        if (a.includes('bom') || a.includes('leal')) luz++;
        else if (a.includes('mau')) trevas++;
        else equilibrio++;
    });

    // 3. Top 5 Campeões por Poder
    const topCampeoes = [...dados]
        .sort((a, b) => calcularPoderCombate(b) - calcularPoderCombate(a))
        .slice(0, 5);

    container.innerHTML = `
        <article class="gothic-frame chronicle-panel">
            <h3 class="panel-heading"><i class="fa-solid fa-khanda"></i> Distribuição de Vocações</h3>
            <div class="bar-stat-list">
                ${classesOrdenadas.map(([cls, qtd]) => {
                    const pct = Math.round((qtd / dados.length) * 100);
                    return `
                        <div class="bar-stat-row">
                            <div class="bar-stat-header">
                                <span>${escapeHtml(cls)}</span>
                                <span>${qtd} (${pct}%)</span>
                            </div>
                            <div class="bar-stat-track">
                                <div class="bar-stat-fill" style="width: ${pct}%;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </article>

        <article class="gothic-frame chronicle-panel">
            <h3 class="panel-heading"><i class="fa-solid fa-scale-balanced"></i> Balança Moral da Irmandade</h3>
            <div class="bar-stat-list">
                ${[
                    { label: 'Ordem & Virtude (Bom/Leal)', qtd: luz },
                    { label: 'Equilíbrio & Neutros', qtd: equilibrio },
                    { label: 'Sombra & Infortúnio (Mau)', qtd: trevas }
                ].map(item => {
                    const pct = Math.round((item.qtd / dados.length) * 100);
                    return `
                        <div class="bar-stat-row">
                            <div class="bar-stat-header">
                                <span>${item.label}</span>
                                <span>${item.qtd} (${pct}%)</span>
                            </div>
                            <div class="bar-stat-track">
                                <div class="bar-stat-fill" style="width: ${pct}%;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </article>

        <article class="gothic-frame chronicle-panel">
            <h3 class="panel-heading"><i class="fa-solid fa-trophy"></i> Panteão dos Campeões</h3>
            <div class="bar-stat-list">
                ${topCampeoes.map((p, idx) => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--bg-inset); border: 1px solid var(--iron-border);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="level-crest" style="min-width: 34px;">#${idx + 1}</span>
                            <div>
                                <div style="font-family: var(--font-heading); font-size: 0.88rem; color: var(--text-ivory);">${escapeHtml(p.nome)}</div>
                                <div style="font-size: 0.84rem; color: var(--text-muted);">${escapeHtml(p.classe)} &bull; Nível ${p.nivel}</div>
                            </div>
                        </div>
                        <span style="font-family: var(--font-mono); color: var(--gold-bright); font-weight: 700;">${calcularPoderCombate(p)} PWR</span>
                    </div>
                `).join('')}
            </div>
        </article>
    `;
}

/* ==========================================================================
   UTILITÁRIOS & EXPORTAÇÃO
   ========================================================================== */
function calcularPoderCombate(p) {
    const nivel = parseInt(p.nivel) || 1;
    const forca = parseInt(p.atributoForca) || 10;
    const des = parseInt(p.atributoDestreza) || 10;
    const intel = parseInt(p.atributoInteligencia) || 10;
    return (nivel * 2) + forca + des + intel;
}

function obterIconeClasse(classe) {
    if (!classe) return 'fa-solid fa-shield-halved';
    const c = classe.toLowerCase();
    if (c.includes('paladin')) return 'fa-solid fa-cross';
    if (c.includes('guerreir') || c.includes('warrior') || c.includes('bárbar')) return 'fa-solid fa-khanda';
    if (c.includes('mag') || c.includes('feiticeir') || c.includes('brux')) return 'fa-solid fa-wand-sparkles';
    if (c.includes('ladin') || c.includes('rogue')) return 'fa-solid fa-mask';
    if (c.includes('clérig')) return 'fa-solid fa-sun';
    if (c.includes('patrulheir') || c.includes('arqueir') || c.includes('ranger')) return 'fa-solid fa-bullseye';
    if (c.includes('bard')) return 'fa-solid fa-music';
    if (c.includes('druid')) return 'fa-solid fa-leaf';
    return 'fa-solid fa-shield-halved';
}

function obterSeloMoral(alinhamento) {
    if (!alinhamento) return { classe: 'neutral', icone: 'fa-solid fa-scale-balanced', texto: 'Neutro' };
    const a = alinhamento.toLowerCase();
    if (a.includes('bom') || a.includes('good')) {
        return { classe: 'good', icone: 'fa-solid fa-sun', texto: alinhamento };
    }
    if (a.includes('mau') || a.includes('evil')) {
        return { classe: 'evil', icone: 'fa-solid fa-skull', texto: alinhamento };
    }
    return { classe: 'neutral', icone: 'fa-solid fa-scale-balanced', texto: alinhamento };
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function exportarTomo() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(listaPersonagensCache, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `codice_taverna_real_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    notificar('Tomo da Ordem exportado em JSON!', 'fa-solid fa-file-export');
}

function notificar(msg, icone = 'fa-solid fa-scroll') {
    const toast = document.getElementById('toast-msg');
    const text = document.getElementById('toast-text');
    text.innerHTML = msg;
    toast.querySelector('i').className = icone;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}
