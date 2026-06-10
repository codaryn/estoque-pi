from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
app = Flask(__name__)

CSV_FILE = "estoque.csv"

def init_csv():
    if not os.path.exists(CSV_FILE):
        df = pd.DataFrame(columns=["id", "produto", "quantidade", "preco_unitario"])
        df.to_csv(CSV_FILE, index=False)

init_csv()

def get_df():
    return pd.read_csv(CSV_FILE)
def save_df(df):
    df.to_csv(CSV_FILE, index=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/apresentacao')
def apresentacao():
    return render_template('apresentacao.html')

@app.route('/api/estoque', methods=['GET'])
def get_estoque():
    try:
        df = get_df()
        return jsonify(df.to_dict('records'))
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/produto/<nome>', methods=['GET'])
def get_produto(nome):
    try:
        df = get_df()
        produto = df[df['produto'] == nome.lower().replace(' ', '_')]
        if produto.empty:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        return jsonify(produto.to_dict('records')[0])
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/adicionar', methods=['POST'])
def adicionar_produto():
    try:
        data = request.json
        df = get_df()
        
        produto = data.get('produto', '').strip().replace(' ', '_').lower()
        quantidade = int(data.get('quantidade', 0))
        preco = float(data.get('preco', 0))
        
        if not produto:
            return jsonify({'erro': 'Nome do produto inválido'}), 400
        if quantidade <= 0:
            return jsonify({'erro': 'Quantidade deve ser maior que 0'}), 400
        if preco <= 0:
            return jsonify({'erro': 'Preço deve ser maior que 0'}), 400
        
        produto_existe = produto in df['produto'].values
        
        if produto_existe:
            df.loc[df['produto'] == produto, 'quantidade'] += quantidade
            mensagem = f"Estoque de '{produto}' atualizado com sucesso!"
        else:
            id_prod = int(df['id'].max()) + 1 if not df.empty else 1
            nova_linha = pd.DataFrame([{
                'id': id_prod,
                'produto': produto,
                'quantidade': quantidade,
                'preco_unitario': preco
            }])
            df = pd.concat([df, nova_linha], ignore_index=True)
            mensagem = f"Produto '{produto}' adicionado com sucesso!"
        
        save_df(df)
        return jsonify({'mensagem': mensagem, 'estoque': df.to_dict('records')})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/deletar', methods=['POST'])
def deletar_produto():
    try:
        data = request.json
        produto = data.get('produto', '').strip().replace(' ', '_').lower()
        modo = data.get('modo', 1)  # 1 = tudo, 2 = fragmento
        quantidade = int(data.get('quantidade', 0)) if modo == 2 else 0
        
        df = get_df()
        
        if produto not in df['produto'].values:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        
        if modo == 1:
            df = df[df['produto'] != produto]
            mensagem = f"Produto '{produto}' deletado com sucesso!"
        else:
            qnt_atual = df.loc[df['produto'] == produto, 'quantidade'].values[0]
            if quantidade <= 0 or quantidade > qnt_atual:
                return jsonify({'erro': f'Quantidade inválida. Disponível: {qnt_atual}'}), 400
            df.loc[df['produto'] == produto, 'quantidade'] -= quantidade
            df = df[df['quantidade'] > 0]
            mensagem = f"{quantidade} unidades removidas de '{produto}'!"
        
        save_df(df)
        return jsonify({'mensagem': mensagem, 'estoque': df.to_dict('records')})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/atualizar-preco', methods=['POST'])
def atualizar_preco():
    try:
        data = request.json
        produto = data.get('produto', '').strip().replace(' ', '_').lower()
        novo_preco = float(data.get('preco', 0))
        
        if novo_preco <= 0:
            return jsonify({'erro': 'Preço deve ser maior que 0'}), 400
        
        df = get_df()
        
        if produto not in df['produto'].values:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        
        df.loc[df['produto'] == produto, 'preco_unitario'] = novo_preco
        save_df(df)
        
        return jsonify({'mensagem': f"Preço de '{produto}' atualizado!", 'estoque': df.to_dict('records')})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/limpar', methods=['POST'])
def limpar_estoque():
    try:
        df = pd.DataFrame(columns=['id', 'produto', 'quantidade', 'preco_unitario'])
        save_df(df)
        return jsonify({'mensagem': 'Estoque esvaziado com sucesso!'})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/ordenar', methods=['POST'])
def ordenar_estoque():
    try:
        data = request.json
        campo = data.get('campo', 'id')
        ordem = data.get('ordem', 'asc')

        df = get_df()
        ascending = ordem == 'asc'
        df = df.sort_values(by=campo, ascending=ascending)
        save_df(df)

        return jsonify({'mensagem': f'Estoque ordenado por {campo}!', 'estoque': df.to_dict('records')})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/editar', methods=['POST'])
def editar_produto():
    try:
        data = request.json
        produto_id = int(data.get('id'))
        novo_nome = data.get('produto', '').strip().replace(' ', '_').lower()
        nova_quantidade = int(data.get('quantidade', 0))
        novo_preco = float(data.get('preco_unitario', 0))

        if not novo_nome:
            return jsonify({'erro': 'Nome do produto inválido'}), 400
        if nova_quantidade <= 0:
            return jsonify({'erro': 'Quantidade deve ser maior que 0'}), 400
        if novo_preco <= 0:
            return jsonify({'erro': 'Preço deve ser maior que 0'}), 400

        df = get_df()
        df['id'] = df['id'].astype(int)

        if produto_id not in df['id'].values:
            return jsonify({'erro': 'Produto não encontrado'}), 404

        df.loc[df['id'] == produto_id, 'produto'] = novo_nome
        df.loc[df['id'] == produto_id, 'quantidade'] = nova_quantidade
        df.loc[df['id'] == produto_id, 'preco_unitario'] = novo_preco

        save_df(df)
        return jsonify({'mensagem': 'Produto atualizado com sucesso!', 'estoque': df.to_dict('records')})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
