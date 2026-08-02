from dataclasses import dataclass
from datetime import date

@dataclass
class CalendarEvent:
    estudio: str
    num_paciente: str
    fila: int
    nombre_visita: str
    fecha: date

from pydantic import BaseModel
from typing import List

class TableData(BaseModel):
    estudio: str
    rows: List[List[str]]
