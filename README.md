# G.A Brasil Store

E-commerce desenvolvido para a G.A Brasil, distribuidora de maquiagens e cosméticos. Plataforma completa com catálogo de produtos, carrinho de compras, sistema de favoritos, fluxo de pedido via WhatsApp e painel administrativo protegido para gestão da loja.

---

## 🛍️ Sobre o projeto

A G.A Brasil Store foi desenvolvida para modernizar a presença digital da distribuidora, oferecendo aos lojistas e revendedores uma forma rápida e prática de consultar o catálogo de produtos, montar pedidos e finalizar a compra diretamente pelo WhatsApp.

## ✨ Funcionalidades

- **Catálogo de produtos** — com filtros, badges de promoção/lançamento e destaque para mais vendidos
- **Carrinho de compras** — adição, remoção e cálculo automático de total
- **Sistema de favoritos** — para o cliente salvar produtos de interesse
- **Cadastro e login obrigatório** — necessário estar autenticado para finalizar o pedido
- **Cálculo de frete por CEP** — com destaque visual para o caráter estimado do valor
- **Valor mínimo de pedido** — bloqueio automático de checkout abaixo do valor configurado
- **Fluxo de pedido via WhatsApp** — pedido finalizado é encaminhado automaticamente para o WhatsApp da loja
- **Painel administrativo protegido** — gestão de produtos, visualização de pedidos com dados do cliente e CEP utilizado
- **Exportação de catálogo** — geração de PDF (com ou sem imagens) e planilha Excel com a lista completa de produtos

## 🛠️ Tecnologias

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/) — banco de dados PostgreSQL, autenticação e storage
- [Vercel](https://vercel.com/) — deploy e hospedagem
- [jsPDF](https://github.com/parallax/jsPDF) — geração de catálogo em PDF
- [SheetJS (xlsx)](https://github.com/SheetJS/sheetjs) — exportação de catálogo em Excel

## 🔐 Variáveis de ambiente

O projeto depende de credenciais do Supabase para funcionar. Crie um arquivo `.env` na raiz com:

```bash
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

> Nunca commitar o arquivo `.env` — ele já deve estar no `.gitignore`. Como este repositório é público, isso é essencial para não expor credenciais do projeto.

## 🚀 Como rodar localmente

```bash
git clone https://github.com/Thurs3003/ga-brasil-store.git
cd ga-brasil-store
npm install
npm run dev
```

Acesse `http://localhost:5173` (ou a porta indicada pelo Vite) para visualizar o projeto.

## 🔑 Acesso ao painel administrativo

O painel admin é protegido por autenticação via Supabase. O acesso é restrito a usuários com permissão de administrador cadastrados previamente no projeto.

## 📦 Build de produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`, prontos para deploy.

## 🌐 Deploy

O projeto é hospedado na [Vercel](https://vercel.com/), com deploy automático a cada push na branch principal.

---

Desenvolvido por **Arthur Matos** para G.A Brasil.