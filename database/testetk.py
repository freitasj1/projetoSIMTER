#Teste de funcionamento do banco de dados com TKINTER

import tkinter as tk
from tkinter import messagebox
import mysql.connector

# Function that inserto datas into Database
def inserir_dados():
    nome = entry_nome.get() # if I want to input my data here, change to "input"
    id_dispositivo = entry_id.get() # here too

    if nome and id_dispositivo:
        try:
            # try to connect in the database
            conn = mysql.connector.connect(
                host="localhost", #127.0.0.1 works too, try with another host later 
                user="root",  # root or simter(it doesn't works yet)
                password="projetoSimter",  # temporary password
                database="devices" # database's name
            )
            cursor = conn.cursor()

            # Inserindo os dados na tabela
            sql = "INSERT INTO devices (nome, id) VALUES (%s, %s)" # Insert datas into devices' table, in name and id
            valores = (nome, id_dispositivo) #values that I will put
            cursor.execute(sql, valores)
            conn.commit()

            messagebox.showinfo("Sucesso", "Dados inseridos com sucesso!") 
        except mysql.connector.Error as err:
            messagebox.showerror("Erro", f"Erro ao conectar ao banco de dados: {err}")
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()
    else:
        messagebox.showwarning("Atenção", "Por favor, preencha todos os campos!")

# creating the tkinter interface
root = tk.Tk()
root.title("Inserir Dados no Banco de Dados")

# CHATGPT
label_nome = tk.Label(root, text="Nome:")
label_nome.grid(row=0, column=0, padx=10, pady=10)
entry_nome = tk.Entry(root)
entry_nome.grid(row=0, column=1, padx=10, pady=10)

label_id = tk.Label(root, text="ID:")
label_id.grid(row=1, column=0, padx=10, pady=10)
entry_id = tk.Entry(root)
entry_id.grid(row=1, column=1, padx=10, pady=10)

# CHATGPT
botao_inserir = tk.Button(root, text="Inserir Dados", command=inserir_dados)
botao_inserir.grid(row=2, columnspan=2, padx=10, pady=10)

# run the interface
root.mainloop()
