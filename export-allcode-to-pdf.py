import os
from fpdf import FPDF

# Caminho para o diretório do projeto
project_dir = os.path.dirname(os.path.abspath(__file__))
# project_dir = r"D:\REACT-SAAS-PROJETOS\portifolio-pablo-v03"

# Lista de diretórios a serem ignorados
ignored_dirs = {"node_modules", ".next", ".git"}

# Inicializa o PDF
pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)

# Itera sobre arquivos no projeto
for root, dirs, files in os.walk(project_dir):
    # Remove os diretórios ignorados da lista de diretórios a explorar
    dirs[:] = [d for d in dirs if d not in ignored_dirs]

    for file in files:
        if file.endswith(('.tsx', '.ts', '.json', '.py', '.js', '.html', '.css')):  # Ajuste para as extensões desejadas
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.readlines()
            
            # Adiciona uma nova página para cada arquivo
            pdf.add_page()
            """ pdf.set_font("Courier", size=10) """
            pdf.set_font("Courier", style="BI", size=10)
            pdf.cell(0, 10, txt=f"File: {filepath}", ln=True)
            pdf.set_font("Courier", size=10)
            for line in content:
                # Substituir caracteres incompatíveis por '?'
                sanitized_line = line.encode("latin-1", "replace").decode("latin-1")
                pdf.multi_cell(0, 2, txt=sanitized_line)

# Salva o PDF no diretório atual
output_file = "projeto_completo.pdf"
pdf.output(output_file)

print(f"PDF gerado com sucesso: {output_file}")