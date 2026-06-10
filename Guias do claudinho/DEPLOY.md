# 🌐 Guia de Deploy - Sistema de Estoque

Este guia mostra como colocar sua aplicação na internet em diferentes plataformas.

## 🚀 Opções de Deploy Recomendadas

### 1. **Railway** ⭐ (Recomendado - Mais fácil)

Railway é a opção mais simples e rápida para iniciantes.

#### Passos:

1. Acesse [railway.app](https://railway.app)
2. Clique em "Start a New Project"
3. Selecione "Deploy from GitHub"
4. Conecte sua conta do GitHub e selecione o repositório
5. Railway detectará automaticamente e criará o deploy
6. Defina a variável de ambiente `PYTHON_VERSION=3.11`
7. Pronto! Sua app estará online em poucos minutos

**Vantagens:**
- Muito fácil de usar
- Banco de dados integrado (PostgreSQL grátis)
- Deploy automático ao fazer push
- 500 horas/mês grátis

---

### 2. **Heroku**

Heroku é uma plataforma clássica para deploy de apps Python.

#### Passos:

1. Instale Heroku CLI: [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

2. Faça login:
```bash
heroku login
```

3. Crie a app:
```bash
heroku create seu-app-nome
```

4. Deploy:
```bash
git push heroku main
```

5. Visualize os logs:
```bash
heroku logs --tail
```

**Nota:** Heroku está descontinuando planos gratuitos. Alternativas melhores: Railway ou Render.

---

### 3. **Render**

Render é similar ao Railway com planos grátis.

#### Passos:

1. Acesse [render.com](https://render.com)
2. Clique em "New +"
3. Selecione "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
6. Deploy!

**Vantagens:**
- Plano gratuito com limite
- Fácil de usar
- Suporte a PostgreSQL

---

### 4. **PythonAnywhere**

Opção voltada especificamente para Python.

#### Passos:

1. Registre-se em [pythonanywhere.com](https://www.pythonanywhere.com)
2. Faça upload dos seus arquivos
3. Crie uma Web App:
   - Selecione "Flask"
   - Escolha versão Python
4. Edite `WSGI configuration file`:
```python
import sys
path = '/home/seu_usuario/seu_projeto'
sys.path.append(path)
from app import app as application
```
5. Reload e pronto!

---

### 5. **Vercel + Serverless Backend**

Se preferir separar frontend e backend.

**Frontend (Vercel):**
1. Faça upload da pasta `static/`
2. Defina a API URL em `script.js`

**Backend (Railway/Render):**
1. Coloque apenas `app.py` e `requirements.txt`
2. Deploy como descrito acima

---

## 📝 Preparação para Deploy

Antes de fazer deploy, verifique:

### 1. Arquivo `Procfile` ✅ (já criado)
```
web: gunicorn app:app
```

### 2. Arquivo `requirements.txt` ✅ (já criado)
```
pandas==2.2.0
flask==3.0.0
werkzeug==3.0.1
gunicorn==21.2.0
python-dotenv==1.0.0
```

### 3. Variáveis de Ambiente
```
FLASK_ENV=production
FLASK_DEBUG=False
```

### 4. Teste localmente
```bash
gunicorn app:app
```

---

## 🔗 Configurar Domínio Personalizado

Depois que sua app estiver online:

### Railway
1. Vá para Settings → Domains
2. Clique em "Generate Domain" ou adicione custom domain

### Heroku
```bash
heroku domains:add www.seu-dominio.com
```

### Render
1. Dashboard → Environment
2. Custom Domains
3. Aponte CNAME para seu domínio

---

## 💾 Banco de Dados na Nuvem (Opcional)

Para usar PostgreSQL ao invés de CSV:

### 1. Criar Banco no Railway/Render
- Cria automaticamente

### 2. Atualizar `app.py`:
```python
import os
from sqlalchemy import create_engine

# Usar variável de ambiente
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
```

### 3. Instalar SQLAlchemy:
```bash
pip install sqlalchemy psycopg2-binary
```

---

## ❌ Resolução de Problemas

### App não inicia
```bash
# Ver logs
heroku logs --tail
# ou
railway logs
```

### Port já em uso
```bash
# Mudar porta em app.py
app.run(port=8000)
```

### Módulos não encontrados
Verifique se `requirements.txt` está correto:
```bash
pip install -r requirements.txt
```

### CORS (Cross-Origin) error
Adicione em `app.py`:
```python
from flask_cors import CORS
CORS(app)
```

---

## 🎉 Pronto!

Sua aplicação está na web! 

Próximos passos:
- [ ] Configurar domínio personalizado
- [ ] Adicionar autenticação (login/senha)
- [ ] Usar banco de dados real
- [ ] Implementar backup automático
- [ ] Monitorar performance

---

**Precisa de ajuda?** Consulte a documentação das plataformas ou abra uma issue!
