// =============================================================================
//  Componentes Alpine.js que se usan en los x-data de las páginas.
//  Todos hablan con el backend a través de `api.js`.
// =============================================================================

import ApexCharts from "apexcharts";
import {
  api,
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  getStoredUser,
  setStoredUser,
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  CATEGORIES,
  TYPES,
  CATEGORY_LABELS,
  TYPE_LABELS,
  ApiError,
} from "../api";

// Formatear moneda (ajusta la moneda si lo prefieres)
function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ---------------------------------------------------------------------------
//  App shell: nombre del usuario en header + logout
//  Uso: x-data="appShell()"
// ---------------------------------------------------------------------------
export function appShell() {
  return {
    user: getStoredUser() || { name: "", email: "" },
    dropdownOpen: false,
    async init() {
      // Si no hay datos cacheados, intentar obtener el perfil una vez
      if (!this.user || !this.user.name) {
        await this.refresh();
      }
    },
    async refresh() {
      try {
        const profile = await getProfile();
        const clean = {
          id: profile._id,
          name: profile.name,
          email: profile.email,
          balance: profile.balance,
        };
        this.user = clean;
        setStoredUser(clean);
      } catch (e) {
        // si el token expiró, el request helper ya hizo logout
        if (e instanceof ApiError && e.status === 401) {
          window.location.replace("signin.html");
        }
      }
    },
    logout() {
      logout();
      window.location.replace("signin.html");
    },
    get initials() {
      const n = (this.user && this.user.name) || "";
      return n
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    },
  };
}

// ---------------------------------------------------------------------------
//  Signin: x-data="signinForm()"
// ---------------------------------------------------------------------------
export function signinForm() {
  return {
    email: "",
    password: "",
    loading: false,
    error: "",
    async submit() {
      this.error = "";
      if (!this.email || !this.password) {
        this.error = "Ingresa email y contraseña.";
        return;
      }
      this.loading = true;
      try {
        await login({ email: this.email, password: this.password });
        window.location.replace("index.html");
      } catch (e) {
        this.error =
          e instanceof ApiError ? e.message : "Error al iniciar sesión.";
      } finally {
        this.loading = false;
      }
    },
  };
}

// ---------------------------------------------------------------------------
//  Signup: x-data="signupForm()"
// ---------------------------------------------------------------------------
export function signupForm() {
  return {
    fname: "",
    lname: "",
    email: "",
    password: "",
    accepted: false,
    loading: false,
    error: "",
    success: "",
    async submit() {
      this.error = "";
      this.success = "";
      const name = `${this.fname || ""} ${this.lname || ""}`.trim();
      if (!name || !this.email || !this.password) {
        this.error = "Completa todos los campos.";
        return;
      }
      if (!this.accepted) {
        this.error = "Debes aceptar los términos.";
        return;
      }
      this.loading = true;
      try {
        await register({
          name,
          email: this.email,
          password: this.password,
        });
        this.success =
          "Cuenta creada. Iniciando sesión...";
        // Auto-login tras el registro
        try {
          await login({ email: this.email, password: this.password });
          window.location.replace("index.html");
          return;
        } catch (_) {
          // Si falla el auto-login, mandamos al usuario a signin
          window.location.replace("signin.html");
        }
      } catch (e) {
        this.error =
          e instanceof ApiError ? e.message : "Error al registrarse.";
      } finally {
        this.loading = false;
      }
    },
  };
}

// ---------------------------------------------------------------------------
//  Dashboard: x-data="dashboardPage()"
// ---------------------------------------------------------------------------
export function dashboardPage() {
  return {
    loading: true,
    error: "",
    profile: null,
    recent: [],
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlyCount: 0,
    byCategory: {},
    monthlyChartData: [],
    categories: CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
    typeLabels: TYPE_LABELS,
    formatCurrency,
    formatDate,

    async init() {
      try {
        const profile = await getProfile();
        this.profile = profile;
        setStoredUser({
          id: profile._id,
          name: profile.name,
          email: profile.email,
          balance: profile.balance,
        });

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);

        const res = await listTransactions({
          page: 1,
          limit: 50,
          startDate: start.toISOString(),
          endDate: now.toISOString(),
        });

        const items = (res && res.data) || [];
        this.monthlyCount = (res && res.total) || items.length;

        let inc = 0;
        let exp = 0;
        const byCat = {};
        CATEGORIES.forEach((c) => (byCat[c] = 0));
        items.forEach((t) => {
          if (t.type === "INCOME") inc += Number(t.amount) || 0;
          else if (t.type === "EXPENSE") {
            exp += Number(t.amount) || 0;
            byCat[t.category] = (byCat[t.category] || 0) + Number(t.amount);
          }
        });
        this.monthlyIncome = inc;
        this.monthlyExpense = exp;
        this.byCategory = byCat;
        this.recent = items.slice(0, 5);

        // Últimos 6 meses para el gráfico de barras
        try {
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          const historicRes = await listTransactions({
            page: 1,
            limit: 500,
            startDate: sixMonthsAgo.toISOString(),
            endDate: now.toISOString(),
          });
          const historicItems = (historicRes && historicRes.data) || [];
          const monthMap = {};
          historicItems.forEach((t) => {
            const d = new Date(t.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
            if (t.type === "INCOME") monthMap[key].income += Number(t.amount) || 0;
            else if (t.type === "EXPENSE") monthMap[key].expense += Number(t.amount) || 0;
          });
          this.monthlyChartData = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return {
              label: d.toLocaleString("es-ES", { month: "short", year: "2-digit" }),
              income: (monthMap[key] && monthMap[key].income) || 0,
              expense: (monthMap[key] && monthMap[key].expense) || 0,
            };
          });
        } catch (_) {
          // Los gráficos son opcionales; no romper el dashboard si fallan
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          window.location.replace("signin.html");
          return;
        }
        this.error =
          e instanceof ApiError ? e.message : "Error al cargar el panel.";
      } finally {
        this.loading = false;
      }

      await this.$nextTick();
      this._initCharts();
    },

    get balance() {
      return this.profile ? Number(this.profile.balance) || 0 : 0;
    },

    get categoryEntries() {
      const total = Object.values(this.byCategory).reduce((a, b) => a + b, 0);
      return CATEGORIES.map((c) => {
        const value = this.byCategory[c] || 0;
        return {
          key: c,
          label: CATEGORY_LABELS[c],
          value,
          pct: total > 0 ? Math.round((value / total) * 100) : 0,
        };
      }).sort((a, b) => b.value - a.value);
    },

    _initCharts() {
      const COLORS = ["#465fff", "#f97316", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4"];

      // Gráfico dona — gastos por categoría
      const donutEl = document.getElementById("chart-category-donut");
      if (donutEl) {
        donutEl.innerHTML = "";
        const entries = this.categoryEntries.filter((e) => e.value > 0);
        if (entries.length > 0) {
          new ApexCharts(donutEl, {
            series: entries.map((e) => e.value),
            labels: entries.map((e) => e.label),
            chart: {
              type: "donut",
              height: 220,
              fontFamily: "Outfit, sans-serif",
              toolbar: { show: false },
            },
            colors: COLORS,
            legend: {
              position: "bottom",
              fontFamily: "Outfit, sans-serif",
              fontSize: "12px",
            },
            dataLabels: { enabled: false },
            tooltip: { y: { formatter: (val) => formatCurrency(val) } },
            plotOptions: { pie: { donut: { size: "60%" } } },
            stroke: { width: 0 },
          }).render();
        }
      }

      // Gráfico de barras — ingresos vs gastos últimos 6 meses
      const barEl = document.getElementById("chart-monthly-bar");
      if (barEl && this.monthlyChartData.length) {
        barEl.innerHTML = "";
        new ApexCharts(barEl, {
          series: [
            { name: "Ingresos", data: this.monthlyChartData.map((m) => m.income) },
            { name: "Gastos", data: this.monthlyChartData.map((m) => m.expense) },
          ],
          chart: {
            type: "bar",
            height: 260,
            fontFamily: "Outfit, sans-serif",
            toolbar: { show: false },
          },
          colors: ["#22c55e", "#ef4444"],
          xaxis: {
            categories: this.monthlyChartData.map((m) => m.label),
            axisBorder: { show: false },
            axisTicks: { show: false },
          },
          plotOptions: {
            bar: {
              columnWidth: "45%",
              borderRadius: 4,
              borderRadiusApplication: "end",
            },
          },
          dataLabels: { enabled: false },
          legend: {
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit, sans-serif",
          },
          grid: { yaxis: { lines: { show: true } } },
          stroke: { show: true, width: 2, colors: ["transparent"] },
          tooltip: { y: { formatter: (val) => formatCurrency(val) } },
        }).render();
      }
    },
  };
}

// ---------------------------------------------------------------------------
//  Transacciones (CRUD): x-data="transactionsPage()"
// ---------------------------------------------------------------------------
export function transactionsPage() {
  return {
    loading: false,
    error: "",
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,

    // filtros
    filterType: "",
    filterCategory: "",
    filterStart: "",
    filterEnd: "",

    categories: CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
    types: TYPES,
    typeLabels: TYPE_LABELS,
    formatCurrency,
    formatDate,

    // modal
    showModal: false,
    modalMode: "create", // "create" | "edit"
    form: { _id: "", amount: "", category: "FOOD", type: "EXPENSE" },
    saving: false,
    saveError: "",

    async init() {
      await this.refresh();
    },

    async refresh() {
      this.loading = true;
      this.error = "";
      try {
        const res = await listTransactions({
          page: this.page,
          limit: this.limit,
          type: this.filterType || undefined,
          category: this.filterCategory || undefined,
          startDate: this.filterStart
            ? new Date(this.filterStart).toISOString()
            : undefined,
          endDate: this.filterEnd
            ? new Date(this.filterEnd).toISOString()
            : undefined,
        });
        this.items = (res && res.data) || [];
        this.total = (res && res.total) || 0;
        this.totalPages = (res && res.totalPages) || 1;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          window.location.replace("signin.html");
          return;
        }
        this.error =
          e instanceof ApiError ? e.message : "Error al cargar transacciones.";
      } finally {
        this.loading = false;
      }
    },

    applyFilters() {
      this.page = 1;
      this.refresh();
    },

    clearFilters() {
      this.filterType = "";
      this.filterCategory = "";
      this.filterStart = "";
      this.filterEnd = "";
      this.page = 1;
      this.refresh();
    },

    prevPage() {
      if (this.page > 1) {
        this.page -= 1;
        this.refresh();
      }
    },
    nextPage() {
      if (this.page < this.totalPages) {
        this.page += 1;
        this.refresh();
      }
    },

    openCreate() {
      this.modalMode = "create";
      this.form = { _id: "", amount: "", category: "FOOD", type: "EXPENSE" };
      this.saveError = "";
      this.showModal = true;
    },

    openEdit(t) {
      this.modalMode = "edit";
      this.form = {
        _id: t._id,
        amount: t.amount,
        category: t.category,
        type: t.type,
      };
      this.saveError = "";
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async save() {
      this.saveError = "";
      const amount = Number(this.form.amount);
      if (!amount || amount <= 0) {
        this.saveError = "El monto debe ser mayor a 0.";
        return;
      }
      if (!CATEGORIES.includes(this.form.category)) {
        this.saveError = "Categoría inválida.";
        return;
      }
      if (!TYPES.includes(this.form.type)) {
        this.saveError = "Tipo inválido.";
        return;
      }
      this.saving = true;
      try {
        if (this.modalMode === "create") {
          await createTransaction({
            amount,
            category: this.form.category,
            type: this.form.type,
          });
        } else {
          await updateTransaction(this.form._id, {
            amount,
            category: this.form.category,
            type: this.form.type,
          });
        }
        this.showModal = false;
        await this.refresh();
      } catch (e) {
        this.saveError =
          e instanceof ApiError ? e.message : "Error al guardar.";
      } finally {
        this.saving = false;
      }
    },

    async remove(t) {
      if (!confirm("¿Eliminar esta transacción?")) return;
      try {
        await deleteTransaction(t._id);
        await this.refresh();
      } catch (e) {
        alert(
          e instanceof ApiError ? e.message : "Error al eliminar.",
        );
      }
    },
  };
}

// ---------------------------------------------------------------------------
//  Profile: x-data="profilePage()"
// ---------------------------------------------------------------------------
export function profilePage() {
  return {
    loading: true,
    error: "",
    saving: false,
    saveOk: false,
    saveErr: "",
    profile: null,
    form: { name: "", email: "" },
    formatCurrency,

    async init() {
      try {
        const p = await getProfile();
        this.profile = p;
        this.form = { name: p.name || "", email: p.email || "" };
        setStoredUser({
          id: p._id,
          name: p.name,
          email: p.email,
          balance: p.balance,
        });
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          window.location.replace("signin.html");
          return;
        }
        this.error =
          e instanceof ApiError ? e.message : "Error al cargar el perfil.";
      } finally {
        this.loading = false;
      }
    },

    async save() {
      this.saveErr = "";
      this.saveOk = false;
      if (!this.form.name || !this.form.email) {
        this.saveErr = "Nombre y email son obligatorios.";
        return;
      }
      this.saving = true;
      try {
        const updated = await updateProfile({
          name: this.form.name,
          email: this.form.email,
        });
        this.profile = updated;
        setStoredUser({
          id: updated._id,
          name: updated.name,
          email: updated.email,
          balance: updated.balance,
        });
        this.saveOk = true;
        setTimeout(() => (this.saveOk = false), 2500);
      } catch (e) {
        this.saveErr =
          e instanceof ApiError ? e.message : "Error al guardar.";
      } finally {
        this.saving = false;
      }
    },
  };
}

// Registro global para que los x-data="..." puedan encontrarlos
export function registerAlpineComponents(Alpine) {
  Alpine.data("appShell", appShell);
  Alpine.data("signinForm", signinForm);
  Alpine.data("signupForm", signupForm);
  Alpine.data("dashboardPage", dashboardPage);
  Alpine.data("transactionsPage", transactionsPage);
  Alpine.data("profilePage", profilePage);
}
