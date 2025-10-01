// Import modules
// API Configuration
//const API_BASE = "http://localhost:3000"
const API_BASE = "https://testsapi.nuvemhost.xyz"
let TOKEN = ""
let USERNAME = ""

// DOM Elements
const authContainer = document.getElementById("auth-container")
const appContainer = document.getElementById("app-container")
const loading = document.getElementById("loading")
const loadingText = document.getElementById("loading-text")

// Theme Management Functions
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  document.documentElement.setAttribute("data-theme", savedTheme)
  updateThemeIcon(savedTheme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  updateThemeIcon(newTheme)
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector("#theme-toggle i")
  if (theme === "dark") {
    themeIcon.className = "fas fa-sun"
  } else {
    themeIcon.className = "fas fa-moon"
  }
}

function manutencao(MSG) {
  appContainer.remove();
  document.getElementById("modals").remove();

  authContainer.innerHTML = "";
  authContainer.innerHTML = `
    <div class="manutencao-warning">
      <i class="fas fa-exclamation-triangle auth-container"></i>
        ${MSG}
    </div>
  `;
}

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  initializeTheme();
  
  if (!(await checkInternetConnection())) {
    showToast("Erro: Não foi possível conectar ao servidor. Verifique sua conexão.", "error")
    return
  }

  const valid = await checkServerConnection();
  if (!valid[0]) {
    manutencao(valid[1]);
    return
  }

  // Try auto-login with stored credentials
  const storedCredentials = await getStoredCredentials()
  if (storedCredentials) {
    await loginByCredentil(storedCredentials)
  }
})

// Utility Functions
const getIpAddress = async () => {
  const url = 'https://api.ipify.org?format=json';

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Ocorreu um erro ao buscar o IP:', error);
    return null; // Retorna null em caso de erro
  }
}

function showLoading(text = "Carregando...") {
  loadingText.textContent = text
  loading.classList.remove("hidden")
}

function hideLoading() {
  loading.classList.add("hidden")
}

function showToast(message, type = "info") {
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  document.getElementById("toast-container").appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 5000)
}

async function checkInternetConnection() {
  try {
    await fetch(API_BASE, { method: "HEAD", timeout: 5000 })
    return true
  } catch {
    return false
  }
}

async function checkServerConnection() {
  try {
    const response = await fetch(`${API_BASE}/valid`, { timeout: 10000 })
    const data = await response.json()
    return [data.valid, data.msg];
  } catch {
    return [false]
  }
}

// Local Storage Functions com criptografia
async function storeCredentials() {
  try {
    const response = await fetch(`${API_BASE}/auth/GeCredential`, {
      method: "POST",
      headers: {
        Authorization: `Berer ${TOKEN}`,
        userip: await getIpAddress(),
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    const credenciais = data.tokenUS
    console.log(`dados brutos: ${response.json}`)
    console.log(`Token jwt (credentials): ${credenciais}`)
    localStorage.setItem("produtos_credentials", credenciais);
  }catch(erro){
    hideLoading()
    showToast("Erro ao salvar as credenciais: " + erro.message, "erro")
  }
}

async function getStoredCredentials() {
  const cred = localStorage.getItem("produtos_credentials");
  if (!cred) return null;

  return cred;
}

function clearStoredCredentials() {
  localStorage.removeItem("produtos_chave")
  localStorage.removeItem("produtos_credentials")
}

// Auth Functions
function showAuthSelection() {
  document.getElementById("auth-selection").classList.remove("hidden")
  document.getElementById("login-form").classList.add("hidden")
  document.getElementById("register-form").classList.add("hidden")
}

function showLogin() {
  document.getElementById("auth-selection").classList.add("hidden")
  document.getElementById("login-form").classList.remove("hidden")
  document.getElementById("register-form").classList.add("hidden")
}

function showRegister() {
  document.getElementById("auth-selection").classList.add("hidden")
  document.getElementById("login-form").classList.add("hidden")
  document.getElementById("register-form").classList.remove("hidden")
}

async function handleRegister(event) {
  event.preventDefault()

  const nome = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const senha = document.getElementById("register-password").value

  showLoading("Registrando...")

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha }),
    })

    if (response.ok) {
      hideLoading()
      showToast("Registro concluído com sucesso!", "success")
      showToast(`Bem-vindo, ${nome}!`, "info")

      // Auto login after registration
      await performLogin(email, senha, false)
    } else {
      const errorData = await response.erro
      throw new Error(errorData)
    } 
  } catch (error) {
    hideLoading()
    showToast("Erro ao registrar: " + error.message, "error")
  }
}

async function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("login-email").value
  const senha = document.getElementById("login-password").value

  await performLogin(email, senha, false)
}

async function performLogin(email, senha, IsCred) {
  showLoading("Autenticando...")

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        userip: await getIpAddress(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })

    if (response.ok) {
      const data = await response.json()
      TOKEN = data.tokenUS
      USERNAME = data.username

      hideLoading()
      showToast("Login bem-sucedido!", "success")

      // Ask to save credentials
      if (!IsCred) {
        if (confirm("Deseja salvar as credenciais neste dispositivo?")) {
          await storeCredentials()
        }
      }

      showApp()
    } else {
      throw new Error(response.erro)
    }
  } catch (error) {
    hideLoading()
    showToast("Falha no login: " + error.message, "error")
  }
}

async function loginWithCredentials() {
  const credentials = await getStoredCredentials()
  if (!credentials) {
    showToast("Credenciais não encontradas.", "error")
    return
  }

  await loginByCredentil(credentials)
}

async function loginByCredentil(cred) {
  showLoading("Fazendo o login por credencial...")

  try {
    const response = await fetch(`${API_BASE}/auth/LoginByCredential`, {
      method: "POST",
      headers: {
        userip: await getIpAddress(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cred }),
    })

    if (response.ok) {
      const data = await response.json()
      TOKEN = data.tokenUS
      USERNAME = data.username

      hideLoading()
      showToast("Login bem-sucedido!", "success")

      showApp()
    } else {
      throw new Error(response.erro)
    }
  } catch (error) {
    hideLoading()
    showToast("Falha no login: " + error.message, "error")
  }
}

function showApp() {
  authContainer.classList.add("hidden")
  appContainer.classList.remove("hidden")
  document.getElementById("username-display").textContent = `Bem-vindo, ${USERNAME}!`
  loadProducts()
}

async function logout() {
  showLoading("Fazendo logout...")

  try {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    TOKEN = ""
    USERNAME = ""
    clearStoredCredentials()

    hideLoading()
    showToast("Logout realizado. Até logo! 👋", "success")

    appContainer.classList.add("hidden")
    authContainer.classList.remove("hidden")
    showAuthSelection()
  } catch (error) {
    hideLoading()
    if (confirm("Erro ao fazer logout. Deseja sair mesmo assim?")) {
      TOKEN = ""
      USERNAME = ""
      clearStoredCredentials()
      appContainer.classList.add("hidden")
      authContainer.classList.remove("hidden")
      showAuthSelection()
    }
  }
}

async function DelACCT() {
  document.getElementById("delacct-modal").classList.remove("hidden")
}

document.getElementById("confirm-delacct-btn").onclick = async function () {
    await Deletar_conta();
};
async function Deletar_conta() {
  showLoading("Apagando...")

  try {
    await fetch(`${API_BASE}/auth/delacct/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    TOKEN = ""
    USERNAME = ""
    clearStoredCredentials()

    hideLoading()
    showToast("Sua conta foi deletada com sucesso", "success")

    closeDelACCTModal()
    appContainer.classList.add("hidden")
    authContainer.classList.remove("hidden")
    showAuthSelection()
  }catch(erro) {
    hideLoading()
    closeDelACCTModal()
    if (confirm("Erro ao deletar sua conta. Deseja tentar novamente?")) {
      Deletar_conta()
      showAuthSelection()
    }
  }
};

// App Navigation
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".app-section").forEach((section) => {
    section.classList.add("hidden")
  })

  // Remove active class from all nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected section
  document.getElementById(`${sectionName}-section`).classList.remove("hidden")

  // Add active class to selected nav button
  document.querySelector(`[data-section="${sectionName}"]`).classList.add("active")

  // Load data if needed
  if (sectionName === "list") {
    loadProducts()
  }
}

// Products Functions
async function loadProducts() {
  showLoading("Carregando produtos...");

  try {
    const response = await fetch(`${API_BASE}/produtos/`, { // ✅ trailing slash
      method: "GET", // ✅ método fora dos headers
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // IP do usuário
        "Content-Type": "application/json"
      },
    });

    if (response.ok) {
      const produtos = await response.json();
      displayProducts(produtos);
    } else {
      const text = await response.erro; // captura erro detalhado
      throw new Error(`Erro ao carregar produtos: ${text}`);
    }
  } catch (error) {
    showToast("Erro ao buscar produtos: " + error.message, "error");
  } finally {
    hideLoading();
  }
}

function displayProducts(produtos) {
  const container = document.getElementById("products-table")

  if (!produtos || produtos.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Adicione seu primeiro produto para começar!</p>
            </div>
        `
    return
  }

  const table = `
        <div class="products-table">
          <table>
            <thead>
              <tr>
                <th>#</th> <!-- coluna do índice -->
                <th>Nome</th>
                <th>Preço</th>
                <th>Quantidade</th>
                <th>Valor total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${produtos
                .map(
                  (produto, index) => `
                    <tr>
                      <td>${index + 1}</td> <!-- mostra 1, 2, 3... -->
                      <td>${produto.nome}</td>
                      <td>R$ ${Number.parseFloat(produto.preco).toFixed(2)}</td>
                      <td>${produto.quantidade}</td>
                      <td>R$ ${Number.parseFloat(produto.preco * produto.quantidade).toFixed(2)}</td>
                      <td>
                        <div class="action-buttons">
                          <button class="btn btn-info btn-sm" onclick="editProduct(${produto.id})">
                            <i class="fas fa-edit"></i> Editar
                          </button>
                          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${produto.id})">
                            <i class="fas fa-trash"></i> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
    `

  container.innerHTML = table
}

async function handleAddProduct(event) {
  event.preventDefault()

  const nome = document.getElementById("product-name").value
  const preco = document.getElementById("product-price").value
  const quantidade = document.getElementById("product-quantity").value

  showLoading("Adicionando produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
      body: JSON.stringify({ nome, preco, quantidade }),
    })

    if (response.ok) {
      showToast("✅ Produto adicionado com sucesso!", "success")
      document.getElementById("product-name").value = ""
      document.getElementById("product-price").value = ""
      document.getElementById("product-quantity").value = ""

      // Switch to list view and reload products
      showSection("list")
    } else {
      throw new Error("Erro ao adicionar produto")
    }
  } catch (error) {
    showToast("Erro ao adicionar produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

async function searchProducts() {
  const query = document.getElementById("search-input").value.trim()

  if (!query) {
    showToast("Digite algo para pesquisar", "warning")
    return
  }

  if (query.toLowerCase() === "sair") {
    document.getElementById("search-input").value = ""
    document.getElementById("search-results").innerHTML = ""
    return
  }

  showLoading("Pesquisando...")

  try {
    const response = await fetch(`${API_BASE}/produtos/search/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
      body: JSON.stringify({ query }),
    })

    if (response.ok) {
      const data = await response.json()
      const produtos = data.produtos || []
      displaySearchResults(produtos)
    } else {
      throw new Error("Erro na pesquisa")
    }
  } catch (error) {
    showToast("Erro ao pesquisar produtos: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

function displaySearchResults(produtos) {
  const resultsContainer = document.getElementById("search-results")

  if (!produtos || produtos.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>Nenhum produto encontrado.</p>
      </div>
    `
    return
  }

  let tableHTML = `
    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Total</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
  `

  produtos.forEach((produto, index) => {
    tableHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${produto.nome}</td>
        <td>R$ ${Number.parseFloat(produto.preco).toFixed(2)}</td>
        <td>${produto.quantidade}</td>
        <td>R$ ${Number.parseFloat(produto.preco * produto.quantidade).toFixed(2)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-info btn-sm" onclick="editProduct(${produto.id})">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${produto.id})">
              <i class="fas fa-trash"></i> Remover
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableHTML += `
        </tbody>
      </table>
    </div>
  `

  resultsContainer.innerHTML = tableHTML
}

// Edit Product Functions
async function editProduct(id) {
  showLoading("Carregando produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos/`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    if (response.ok) {
      const produtos = await response.json()
      const produto = produtos.find((p) => p.id === id)

      if (produto) {
        document.getElementById("edit-product-id").value = produto.id
        document.getElementById("edit-product-name").value = produto.nome
        document.getElementById("edit-product-price").value = produto.preco
        document.getElementById("edit-product-quantity").value = produto.quantidade

        document.getElementById("edit-modal").classList.remove("hidden")
      } else {
        throw new Error("Produto não encontrado")
      }
    } else {
      throw new Error("Erro ao carregar produto")
    }
  } catch (error) {
    showToast("Erro ao carregar produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

async function handleEditProduct(event) {
  event.preventDefault()

  const id = document.getElementById("edit-product-id").value
  const nome = document.getElementById("edit-product-name").value.trim()
  const preco = document.getElementById("edit-product-price").value
  const quantidade = document.getElementById("edit-product-quantity").value

  if (!nome) {
    showToast("Nome do produto é obrigatório", "warning")
    return
  }

  showLoading("Atualizando produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
      body: JSON.stringify({
        nome,
        preco: Number.parseFloat(preco),
        quantidade: Number.parseInt(quantidade),
      }),
    })

    if (response.ok) {
      showToast("✏️ Produto atualizado com sucesso!", "success")
      closeEditModal()
      loadProducts()
      const searchResults = document.getElementById("search-results")
      if (searchResults.innerHTML.trim() !== "") {
        const searchInput = document.getElementById("search-input")
        if (searchInput.value.trim()) {
          searchProducts()
        }
      }
    } else {
      let errorMessage = "Erro ao atualizar produto"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    showToast("Erro ao atualizar produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden")
}

// Delete Product Functions
function deleteProduct(id) {
  document.getElementById("confirm-delete-btn").onclick = () => confirmDeleteProduct(id)
  document.getElementById("delete-modal").classList.remove("hidden")
}

async function confirmDeleteProduct(id) {
  showLoading("Removendo produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    if (response.ok || response.status === 204) {
      showToast("🗑️ Produto removido com sucesso!", "success")
      closeDeleteModal()
      loadProducts()
      const searchResults = document.getElementById("search-results")
      if (searchResults.innerHTML.trim() !== "") {
        const searchInput = document.getElementById("search-input")
        if (searchInput.value.trim()) {
          searchProducts()
        }
      }
    } else {
      let errorMessage = "Erro ao remover produto"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    showToast("Erro ao remover produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.add("hidden")
}

// Event Listeners
document.getElementById("search-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchProducts()
  }
})

// Close modals when clicking outside
document.getElementById("edit-modal").addEventListener("click", (e) => {
  if (e.target.id === "edit-modal") {
    closeEditModal()
  }
})

document.getElementById("delete-modal").addEventListener("click", (e) => {
  if (e.target.id === "delete-modal") {
    closeDeleteModal()
  }
})


function closeDelACCTModal() {
  document.getElementById("delacct-modal").classList.add("hidden")
}