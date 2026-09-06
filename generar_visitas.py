"""
Generador automático de calendario de visitas de pacientes (.ics)
------------------------------------------------------------------
Lee un Excel donde:
  - Cada HOJA = un ensayo/estudio (el nombre de la hoja se usa como "ESTUDIO")
  - Columna A (desde fila 4)  = nombre de la visita (WEEK, Basal, etc.)
  - Fila 2, desde columna C en adelante = número de paciente (una columna por paciente)
  - Filas 4+ de cada columna de paciente = fecha de esa visita para ese paciente
  - Los eventos se crean de 08:30 a 10:00

Uso:
    python generar_visitas.py

Por defecto busca el Excel en la carpeta de Descargas del usuario y busca
cualquier archivo .xlsx que empiece por "datos" (puedes cambiar EXCEL_NAME).
El .ics resultante se guarda también en Descargas.
"""

import os
import glob
import uuid
from datetime import datetime, date, time
from openpyxl import load_workbook
from icalendar import Calendar, Event

# ----------------------- CONFIGURACIÓN -----------------------
DOWNLOADS_DIR = os.path.join(os.path.expanduser("~"), "Downloads")
EXCEL_PATTERN = "datos*.xlsx"          # patrón para localizar el Excel en Descargas
OUTPUT_NAME = "visitas_pacientes.ics"  # nombre del archivo generado
HORA_INICIO = time(8, 30)
HORA_FIN = time(10, 0)
FILA_PACIENTES = 2      # fila donde están los números de paciente
FILA_INICIO_VISITAS = 4 # fila donde empiezan las visitas
COL_INICIO_PACIENTES = 3 # columna C = 3 (A=1, B=2, C=3...)
# ---------------------------------------------------------------


def encontrar_excel():
    """Busca el Excel de datos en la carpeta de Descargas."""
    patrones = glob.glob(os.path.join(DOWNLOADS_DIR, EXCEL_PATTERN))
    if not patrones:
        raise FileNotFoundError(
            f"No se ha encontrado ningún archivo que coincida con "
            f"'{EXCEL_PATTERN}' en {DOWNLOADS_DIR}"
        )
    # Si hay varios, coge el modificado más recientemente
    return max(patrones, key=os.path.getmtime)


def generar_calendario(ruta_excel, ruta_salida):
    wb = load_workbook(ruta_excel, data_only=True)
    cal = Calendar()
    cal.add('prodid', '-//Visitas Pacientes//ES')
    cal.add('version', '2.0')
    # Outlook extension: enable category colours
    cal.add('X-MICROSOFT-CALSCALE', 'Gregorian')

    total_eventos = 0

    for ws in wb.worksheets:
        estudio = ws.title  # nombre del ensayo/estudio

        # Detectar columnas de pacientes: desde C hacia la derecha,
        # mientras la fila de pacientes tenga contenido
        col = COL_INICIO_PACIENTES
        columnas_pacientes = []
        while True:
            valor_paciente = ws.cell(row=FILA_PACIENTES, column=col).value
            if valor_paciente is None or str(valor_paciente).strip() == "":
                break
            columnas_pacientes.append((col, str(valor_paciente).strip()))
            col += 1

        if not columnas_pacientes:
            continue  # esta hoja no tiene pacientes, se salta

        # Última fila con contenido en la hoja
        max_fila = ws.max_row

        for col_idx, num_paciente in columnas_pacientes:
            for fila in range(FILA_INICIO_VISITAS, max_fila + 1):
                nombre_visita = ws.cell(row=fila, column=1).value  # columna A
                fecha_valor = ws.cell(row=fila, column=col_idx).value

                if nombre_visita is None or fecha_valor is None:
                    continue
                if not isinstance(fecha_valor, (datetime, date)):
                    continue  # ignora celdas tipo texto ("OK", etc.)

                if isinstance(fecha_valor, datetime):
                    fecha_valor = fecha_valor.date()

                titulo = f"{nombre_visita} - {estudio} - {num_paciente}"

                dtstart = datetime.combine(fecha_valor, HORA_INICIO)
                dtend = datetime.combine(fecha_valor, HORA_FIN)

                event = Event()
                event.add('summary', titulo)
                event.add('dtstart', dtstart)
                event.add('dtend', dtend)
                event.add('dtstamp', datetime.now())
                event.add('uid', f"{estudio}-{num_paciente}-{fila}-{uuid.uuid4()}@visitas-pacientes")
                # Outlook yellow category & colour index (6 = Yellow)
                event.add('categories', ['Yellow category', 'Categoría amarilla', 'Categoria groga', 'Yellow Category', 'Categoria Groga'])
                event['X-MICROSOFT-CDO-ALLDAYEVENT'] = 'FALSE'
                event['X-MICROSOFT-CDO-BUSYSTATUS'] = 'BUSY'
                event['X-MICROSOFT-CDO-IMPORTANCE'] = '1'
                event['X-OUTLOOK-COLOR'] = '6'
                event['COLOR'] = '#FDD835'
                cal.add_component(event)
                total_eventos += 1

    with open(ruta_salida, 'wb') as f:
        f.write(cal.to_ical())

    return total_eventos


def main():
    ruta_excel = encontrar_excel()
    ruta_salida = os.path.join(DOWNLOADS_DIR, OUTPUT_NAME)
    total = generar_calendario(ruta_excel, ruta_salida)
    print(f"Excel leído: {ruta_excel}")
    print(f"Eventos generados: {total}")
    print(f"Archivo .ics guardado en: {ruta_salida}")
    print("Ahora impórtalo en Outlook: Calendario > Agregar calendario > Cargar desde archivo")


if __name__ == "__main__":
    main()
