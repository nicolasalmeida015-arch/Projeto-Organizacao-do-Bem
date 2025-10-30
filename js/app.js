/* ============================================================
   app.js - Organização Solidária do Bem (Acessível WCAG 2.1 AA)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ====== MENU RESPONSIVO ====== */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("active");
    });
  }

  /* ====== NAVEGAÇÃO POR TECLADO NO MENU ====== */
  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("focus", () => link.classList.add("focus"));
    link.addEventListener("blur", () => link.classList.remove("focus"));
  });

  /* ====== BOTÕES DE ACESSIBILIDADE ====== */
  const contrastBtn = document.getElementById("toggle-contrast");
  const darkBtn = document.getElementById("toggle-darkmode");

  // Modo alto contraste
  contrastBtn?.addEventListener("click", () => {
    document.body.classList.toggle("high-contrast");
    const ativo = document.body.classList.contains("high-contrast");
    contrastBtn.setAttribute("aria-pressed", ativo);
  });

  // Modo escuro
  darkBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const ativo = document.body.classList.contains("dark-mode");
    darkBtn.setAttribute("aria-pressed", ativo);
  });

  /* ====== EXPANDIR TEXTO - BOTÃO "SAIBA MAIS" ====== */
  document.querySelectorAll(".btn-saiba-mais").forEach((botao) => {
    botao.addEventListener("click", () => {
      const card = botao.closest(".card");
      const descricao = card?.querySelector(".descricao-completa");

      if (!descricao) return;
      const expandido = descricao.classList.toggle("expandido");
      botao.textContent = expandido ? "Mostrar menos" : "Saiba mais";
      botao.setAttribute("aria-expanded", expandido);
    });
  });

  /* ====== MÁSCARA AUTOMÁTICA DE TELEFONE ====== */
  const campoTelefone = document.querySelector("#telefone");
  if (campoTelefone) {
    campoTelefone.addEventListener("input", (e) => {
      let valor = e.target.value.replace(/\D/g, "");
      if (valor.length > 11) valor = valor.slice(0, 11);
      valor =
        valor.length <= 10
          ? valor.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
          : valor.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      e.target.value = valor.trim();
    });
  }
});

/* ====== SPA SIMPLES ====== */
document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener("click", async (event) => {
    const href = link.getAttribute("href");
    if (!href.startsWith("http") && !href.includes("#")) {
      event.preventDefault();
      try {
        const response = await fetch(href);
        const text = await response.text();
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(text, "text/html");
        const newMain = newDoc.querySelector("main");
        const oldMain = document.querySelector("main");
        if (newMain && oldMain) {
          oldMain.replaceWith(newMain);
          window.history.pushState({}, "", href);
          window.scrollTo(0, 0);
          newMain.focus(); // acessibilidade: foco no conteúdo carregado
        }
      } catch (err) {
        console.error("Erro ao carregar a página:", err);
      }
    }
  });
});

/* ====== TEMPLATE DE PROJETOS ====== */
function criarCardProjeto(projeto) {
  const card = document.createElement("article");
  card.className = "card project-card fade-in";
  card.setAttribute("tabindex", "0");
  card.innerHTML = `
    <h2 class="card-title">${projeto.nome}</h2>
    <p class="descricao-curta">${projeto.descricao.slice(0, 100)}...</p>
    <p class="descricao-completa">${projeto.descricao}</p>
    <p class="meta">Categoria: ${projeto.categoria}</p>
    <p><strong>Localização:</strong> ${projeto.localizacao}</p>
    <p><strong>Contato:</strong> ${projeto.contato}</p>
    <button class="btn-saiba-mais" aria-expanded="false">Saiba mais</button>
  `;
  return card;
}

/* ====== FORMULÁRIO DE CADASTRO DE ONGS ====== */
const formOng = document.querySelector("form[action='#']");
if (formOng) {
  formOng.addEventListener("submit", (e) => {
    e.preventDefault();

    const nomeOng = formOng["nome-ong"].value.trim();
    const nomeProjeto = formOng["nome-projeto"].value.trim();
    const descricao = formOng["descricao"].value.trim();
    const categoria = formOng["categoria"].value;
    const localizacao = formOng["localizacao"].value.trim();
    const contato = formOng["contato"].value.trim();

    if (!nomeOng || !nomeProjeto || !descricao || !categoria || !localizacao || !contato) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    if (!contato.includes("@") && isNaN(contato)) {
      alert("Informe um e-mail válido ou número de telefone.");
      return;
    }

    const projeto = { nome: nomeProjeto, descricao, categoria, localizacao, contato };
    const projetos = JSON.parse(localStorage.getItem("projetos")) || [];
    projetos.push(projeto);
    localStorage.setItem("projetos", JSON.stringify(projetos));

    alert("Projeto cadastrado com sucesso!");
    formOng.reset();
  });
}

/* ====== EXIBIR PROJETOS SALVOS ====== */
if (window.location.pathname.includes("projetos.html") || window.location.pathname.includes("ongs.html")) {
  const container = document.querySelector(".cards-grid");
  if (container) {
    const projetos = JSON.parse(localStorage.getItem("projetos")) || [];
    projetos.forEach((p) => container.appendChild(criarCardProjeto(p)));

    // Reativar o comportamento "Saiba mais"
    setTimeout(() => {
      document.querySelectorAll(".btn-saiba-mais").forEach((botao) => {
        botao.addEventListener("click", () => {
          const card = botao.closest(".card");
          const descricao = card.querySelector(".descricao-completa");
          if (!descricao) return;
          const expandido = descricao.classList.toggle("expandido");
          botao.textContent = expandido ? "Mostrar menos" : "Saiba mais";
          botao.setAttribute("aria-expanded", expandido);
        });
      });
    }, 200);
  }
}

/* ====== FORMULÁRIO DE VOLUNTÁRIOS ====== */
const formVoluntario = document.querySelector("form");
if (formVoluntario && document.title.includes("Voluntários")) {
  formVoluntario.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = formVoluntario["nome"].value.trim();
    const email = formVoluntario["email"].value.trim();
    const cpf = formVoluntario["CPF"].value.trim();
    const telefone = formVoluntario["telefone"].value.trim();

    if (!nome || !email || !cpf || !telefone) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cpfValido = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/.test(cpf);
    if (!cpfValido) {
      alert("CPF inválido. Use o formato 000.000.000-00");
      return;
    }

    const voluntario = {
      nome,
      email,
      cpf,
      telefone,
      cidade: formVoluntario["cidade"].value.trim(),
      estado: formVoluntario["estado"].value,
      disponibilidade: formVoluntario["Disponibilidade"].value,
    };

    const voluntarios = JSON.parse(localStorage.getItem("voluntarios")) || [];
    voluntarios.push(voluntario);
    localStorage.setItem("voluntarios", JSON.stringify(voluntarios));

    alert("Cadastro realizado com sucesso! ❤️");
    formVoluntario.reset();
  });
}

/* ====== MODAIS DE EVENTOS ====== */
const openButtons = document.querySelectorAll("[data-modal]");
const closeButtons = document.querySelectorAll("[data-close]");

openButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const modal = document.getElementById(btn.dataset.modal);
    modal?.classList.remove("hidden");
    modal?.setAttribute("aria-hidden", "false");
    modal?.querySelector("[data-close]")?.focus();
  });
});

closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal-backdrop");
    modal?.classList.add("hidden");
    modal?.setAttribute("aria-hidden", "true");
  });
});

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.classList.add("hidden");
      backdrop.setAttribute("aria-hidden", "true");
    }
  });
});