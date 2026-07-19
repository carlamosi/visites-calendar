import io
from datetime import datetime, date
from openpyxl import load_workbook
from typing import List

from backend.utils.config import settings
from backend.utils.exceptions import InvalidFileException, EmptyWorkbookException, ParsingException
from backend.models.data_models import CalendarEvent

class ExcelParserService:
    def parse_excel_bytes(self, file_bytes: bytes) -> List[CalendarEvent]:
        """
        Parses the Excel file bytes into a list of CalendarEvent objects
        matching the original business logic.
        """
        try:
            wb = load_workbook(io.BytesIO(file_bytes), data_only=True)
        except Exception as e:
            raise InvalidFileException(f"Failed to read Excel file: {str(e)}")

        events = []
        has_valid_data = False

        try:
            for ws in wb.worksheets:
                estudio = ws.title  # nombre del ensayo/estudio

                # Detectar columnas de pacientes: desde C hacia la derecha
                col = settings.COL_INICIO_PACIENTES
                columnas_pacientes = []
                while True:
                    valor_paciente = ws.cell(row=settings.FILA_PACIENTES, column=col).value
                    if valor_paciente is None or str(valor_paciente).strip() == "":
                        break
                    columnas_pacientes.append((col, str(valor_paciente).strip()))
                    col += 1

                if not columnas_pacientes:
                    continue  # esta hoja no tiene pacientes, se salta

                # Última fila con contenido en la hoja
                max_fila = ws.max_row

                for col_idx, num_paciente in columnas_pacientes:
                    for fila in range(settings.FILA_INICIO_VISITAS, max_fila + 1):
                        nombre_visita = ws.cell(row=fila, column=1).value  # columna A
                        fecha_valor = ws.cell(row=fila, column=col_idx).value

                        if nombre_visita is None or fecha_valor is None:
                            continue
                        if not isinstance(fecha_valor, (datetime, date)):
                            continue  # ignora celdas tipo texto ("OK", etc.)

                        if isinstance(fecha_valor, datetime):
                            fecha_valor = fecha_valor.date()
                            
                        has_valid_data = True

                        events.append(
                            CalendarEvent(
                                estudio=estudio,
                                num_paciente=num_paciente,
                                fila=fila,
                                nombre_visita=str(nombre_visita).strip(),
                                fecha=fecha_valor
                            )
                        )
        except Exception as e:
            raise ParsingException(f"Error parsing worksheet data: {str(e)}")

        if not has_valid_data and not events:
            raise EmptyWorkbookException("The workbook contains no valid patient visits.")

        return events
