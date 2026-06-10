# 🔧 Guia de Customização

Este arquivo mostra como customizar a aplicação para suas necessidades.

## 🎨 Alterar Cores e Tema

Edite [static/style.css](static/style.css):

```css
:root {
    --primary-color: #2563eb;      /* Azul */
    --secondary-color: #1e40af;    /* Azul Escuro */
    --success-color: #16a34a;      /* Verde */
    --danger-color: #dc2626;       /* Vermelho */
    --warning-color: #ea580c;      /* Laranja */
}
```

## 📱 Adicionar Novo Campo

Exemplo: Adicionar campo "Categoria"

### 1. Modificar [app.py](app.py):

```python
# Em init_csv():
if not os.path.exists(CSV_FILE):
    df = pd.DataFrame(columns=["id", "produto", "quantidade", "preco_unitario", "categoria"])
    df.to_csv(CSV_FILE, index=False)

# Em adicionar_produto():
nova_linha = pd.DataFrame([{
    "id": id_prod,
    "produto": produto,
    "quantidade": quantidade,
    "preco_unitario": preco,
    "categoria": data.get('categoria', '')  # Adicionar
}])
```

### 2. Modificar [templates/index.html](templates/index.html):

```html
<div class="form-group">
    <label for="categoriaProduto">Categoria:</label>
    <input type="text" id="categoriaProduto" placeholder="Ex: Eletrônicos" required>
</div>
```

### 3. Modificar [static/script.js](static/script.js):

```javascript
body: JSON.stringify({
    produto: produto,
    quantidade: quantidade,
    preco: preco,
    categoria: document.getElementById('categoriaProduto').value  // Adicionar
})
```

## 🔐 Adicionar Autenticação (Login)

### 1. Instalar Flask-Login:
```bash
pip install flask-login
```

### 2. Criar [auth.py](auth.py):

```python
from flask_login import LoginManager, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

login_manager = LoginManager()

class User(UserMixin):
    def __init__(self, id, username, password_hash):
        self.id = id
        self.username = username
        self.password_hash = password_hash
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Usuários hardcoded (substitua por banco de dados depois)
USERS = {
    'admin': User(1, 'admin', generate_password_hash('senha123'))
}

@login_manager.user_loader
def load_user(user_id):
    return USERS.get(user_id)
```

### 3. Adicionar rota de login em [app.py](app.py):

```python
from flask_login import login_user, logout_user, login_required

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = USERS.get(data.get('username'))
    
    if user and user.check_password(data.get('password')):
        login_user(user)
        return jsonify({'mensagem': 'Login realizado'})
    
    return jsonify({'erro': 'Credenciais inválidas'}), 401
```

## 📊 Usar PostgreSQL ao invés de CSV

### 1. Instalar dependências:
```bash
pip install sqlalchemy psycopg2-binary flask-sqlalchemy
```

### 2. Criar modelo em [models.py](models.py):

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    produto = db.Column(db.String(100), unique=True, nullable=False)
    quantidade = db.Column(db.Integer, default=0)
    preco_unitario = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'produto': self.produto,
            'quantidade': self.quantidade,
            'preco_unitario': self.preco_unitario
        }
```

### 3. Atualizar [app.py](app.py):

```python
from models import db, Produto

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://user:password@localhost/estoque'
)
db.init_app(app)

@app.route('/api/estoque', methods=['GET'])
def get_estoque():
    produtos = Produto.query.all()
    return jsonify([p.to_dict() for p in produtos])
```

## 🎯 Adicionar Relatórios

### Exemplo: Relatório de Lucro

```python
@app.route('/api/relatorio/lucro', methods=['GET'])
def relatorio_lucro():
    df = get_df()
    df['total'] = df['quantidade'] * df['preco_unitario']
    
    return jsonify({
        'total_investido': df['total'].sum(),
        'total_itens': df['quantidade'].sum(),
        'produto_mais_caro': df.loc[df['preco_unitario'].idxmax(), 'produto']
    })
```

## 🔔 Adicionar Notificações por Email

### 1. Instalar Flask-Mail:
```bash
pip install flask-mail
```

### 2. Configurar em [app.py](app.py):

```python
from flask_mail import Mail, Message

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

def notificar_estoque_baixo(produto, quantidade):
    msg = Message(
        f'Aviso: {produto} com estoque baixo',
        recipients=['seu@email.com']
    )
    msg.body = f'Produto {produto} tem apenas {quantidade} unidades'
    mail.send(msg)
```

## 🌙 Modo Escuro

Adicione em [static/style.css](static/style.css):

```css
@media (prefers-color-scheme: dark) {
    body {
        background: #1f2937;
        color: #f3f4f6;
    }
    
    .container {
        background: #111827;
    }
}
```

## 📱 Aplicativo Móvel

Use Electron ou React Native:

```bash
# Electron (desktop app)
npm install -g electron

# React Native (mobile)
npm install -g react-native-cli
```

## 🚀 Melhorias Futuras

- [ ] Autenticação com Google/GitHub
- [ ] Dashboard com gráficos
- [ ] Histórico de movimentações
- [ ] Importar/Exportar Excel
- [ ] QR Code para produtos
- [ ] Integração com e-commerce
- [ ] App mobile nativa
- [ ] Notificações em tempo real (WebSockets)

---

**Dicas:**
1. Sempre faça backup do `estoque.csv`
2. Teste mudanças localmente antes de fazer deploy
3. Use `.env` para variáveis sensíveis
4. Comente seu código

Bom desenvolvimento! 🚀
