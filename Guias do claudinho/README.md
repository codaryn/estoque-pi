# 📦 Sistema de Estoque para Microempresas

Um aplicativo web moderno e responsivo para gerenciar estoque de microempresas. Desenvolvido com Flask (backend) e HTML/CSS/JavaScript (frontend).

## 🎯 Funcionalidades

- ✅ Adicionar produtos com quantidade e preço
- ✅ Pesquisar produtos
- ✅ Visualizar estoque completo
- ✅ Remover produtos (total ou parcial)
- ✅ Atualizar preços
- ✅ Ordenar por ID, nome, quantidade ou preço
- ✅ Esvaziar estoque
- ✅ Interface responsiva e moderna

## 🚀 Instalação

### Pré-requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

### Windows (PowerShell)

1. Clone ou baixe o projeto:

```powershell
cd caminho/do/projeto
```

2. Criar ambiente virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Instalar dependências:

```powershell
pip install -r requirements.txt
```

4. Executar a aplicação:

```powershell
python app.py
```

5. Abrir no navegador:

```
http://localhost:5000
```

### macOS/Linux

```bash
# Criar ambiente virtual
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Rodar a aplicação
python app.py

# Abrir http://localhost:5000 no navegador
```

## 📁 Estrutura de Arquivos

```
projeto/
├── app.py                  # Backend Flask (API REST)
├── config.py              # Configurações da aplicação
├── requirements.txt       # Dependências Python
├── estoque.csv           # Banco de dados (CSV)
├── templates/
│   └── index.html        # Interface web
├── static/
│   ├── style.css         # Estilos CSS
│   └── script.js         # Lógica JavaScript
└── README.md             # Este arquivo
```

## 🛠️ API REST Endpoints

### GET `/api/estoque`
Retorna todo o estoque

### GET `/api/produto/<nome>`
Pesquisa um produto específico

### POST `/api/adicionar`
```json
{
  "produto": "nome_do_produto",
  "quantidade": 10,
  "preco": 99.90
}
```

### POST `/api/deletar`
```json
{
  "produto": "nome_do_produto",
  "modo": 1,  // 1 = deletar tudo, 2 = remover quantidade
  "quantidade": 5
}
```

### POST `/api/atualizar-preco`
```json
{
  "produto": "nome_do_produto",
  "preco": 149.90
}
```

### POST `/api/ordenar`
```json
{
  "campo": "id",  // id, produto, quantidade, preco_unitario
  "ordem": "asc"
}
```

### POST `/api/limpar`
Esvazia todo o estoque

## 🚀 Deploy em Plataformas

### Heroku
1. Instale o Heroku CLI
2. Crie um arquivo `Procfile`:
```
web: gunicorn app:app
```
3. Faça o deploy:
```bash
heroku create seu-app-name
git push heroku main
```

### Railway
1. Conecte seu repositório GitHub a Railway
2. Railway detectará automaticamente que é uma app Python
3. Defina a variável de ambiente `FLASK_ENV=production`
4. Deploy automático!

### Vercel/Netlify (com API backend em outro lugar)
- Coloque os arquivos da pasta `static/` e `templates/` em um servidor
- Configure a URL da API no `script.js`

### PythonAnywhere
1. Faça upload dos arquivos
2. Configure o Web App
3. Aponte para o arquivo `app.py`

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` (opcional):

```
FLASK_ENV=development
FLASK_DEBUG=True
```

## 📊 Dados

Os dados são armazenados em um arquivo CSV (`estoque.csv`) para simplificar o deploy. Para aplicações maiores, recomenda-se usar um banco de dados como PostgreSQL.

## 🤝 Contribuindo

Sinta-se livre para fazer melhorias e compartilhar suas ideias!

## 📝 Licença

Este projeto é de código aberto e gratuito para uso pessoal e comercial.

---

Desenvolvido com ❤️ para microempresas

