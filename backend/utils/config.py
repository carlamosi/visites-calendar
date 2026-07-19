import os
from datetime import time

class Settings:
    # Generador Config
    HORA_INICIO = time(8, 30)
    HORA_FIN = time(10, 0)
    FILA_PACIENTES = 2      # Fila donde están los números de paciente
    FILA_INICIO_VISITAS = 4 # Fila donde empiezan las visitas
    COL_INICIO_PACIENTES = 3 # Columna C = 3 (A=1, B=2, C=3...)
    
    # Validation Config
    MAX_FILE_SIZE_MB = 10
    MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
    ALLOWED_EXTENSIONS = {".xlsx"}

settings = Settings()
