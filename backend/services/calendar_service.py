from backend.services.excel_parser import ExcelParserService
from backend.services.calendar_generator import CalendarGeneratorService

class CalendarService:
    def __init__(self):
        self.parser = ExcelParserService()
        self.generator = CalendarGeneratorService()

    def process_excel_to_ics(self, file_bytes: bytes) -> bytes:
        """
        Orchestrates the process of reading Excel bytes and returning ICS bytes.
        """
        events = self.parser.parse_excel_bytes(file_bytes)
        ics_bytes = self.generator.generate_ics(events)
        return ics_bytes
