import tkinter as tk
from tkinter import ttk
import mysql.connector
from mysql.connector import Error


def fetch_data():
    try:
        connection = mysql.connector.connect(
            host="localhost", #127.0.0.1 works too, try with another host later 
            user="root",  # root or simter(it doesn't works yet)
            password="projetoSimter",  # temporary password
            database="devices" # database's name  # substitua pela sua senha
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT nome, ID, LAB FROM devices")
            records = cursor.fetchall()
            
            for i, (col1, col2, col3) in enumerate(records, start=1):
                tree.insert("", "end", values=(col1, col2, col3))
                
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Configuração da interface Tkinter
root = tk.Tk()
root.title("Consulta de Dispositivos")

frame = ttk.Frame(root, padding="10")
frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

tree = ttk.Treeview(frame, columns=("Column1", "Column2", "Column3"), show='headings')
tree.heading("Column1", text="Column1")
tree.heading("Column2", text="Column2")
tree.heading("Column3", text="Column3")

tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

scrollbar = ttk.Scrollbar(frame, orient=tk.VERTICAL, command=tree.yview)
tree.configure(yscroll=scrollbar.set)
scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))

# Button  
fetch_button = ttk.Button(root, text="Buscar Dados", command=fetch_data)
fetch_button.grid(row=1, column=0, pady=10)


root.mainloop()
