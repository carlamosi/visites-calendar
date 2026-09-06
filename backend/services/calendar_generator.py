import uuid
from datetime import datetime
from icalendar import Calendar, Event, vText
from typing import List

from backend.models.data_models import CalendarEvent
from backend.utils.config import settings

class CalendarGeneratorService:
    def generate_ics(self, events: List[CalendarEvent]) -> bytes:
        """
        Generates the raw .ics bytes from a list of CalendarEvent objects.
        """
        cal = Calendar()
        cal.add('prodid', '-//Visitas Pacientes//ES')
        cal.add('version', '2.0')
        # Outlook extension: enable category colours
        cal.add('X-MICROSOFT-CALSCALE', 'Gregorian')

        for ev in events:
            titulo = f"{ev.nombre_visita} - {ev.estudio} - {ev.num_paciente}"

            dtstart = datetime.combine(ev.fecha, settings.HORA_INICIO)
            dtend = datetime.combine(ev.fecha, settings.HORA_FIN)

            event_ical = Event()
            event_ical.add('summary', titulo)
            event_ical.add('dtstart', dtstart)
            event_ical.add('dtend', dtend)
            event_ical.add('dtstamp', datetime.now())
            event_ical.add('uid', f"{ev.estudio}-{ev.num_paciente}-{ev.fila}-{uuid.uuid4()}@visitas-pacientes")

            # RFC-5545 standard categories (supports both English and Spanish Outlook locale defaults)
            event_ical.add('categories', ['Yellow category', 'Categoría amarilla', 'Yellow Category'])
            # Outlook / Exchange color index (6 = Yellow category in Outlook)
            event_ical['X-MICROSOFT-CDO-ALLDAYEVENT'] = 'FALSE'
            event_ical['X-MICROSOFT-CDO-BUSYSTATUS'] = 'BUSY'
            event_ical['X-MICROSOFT-CDO-IMPORTANCE'] = '1'
            # Outlook 2016/2019/365 specific category color tag
            event_ical['X-OUTLOOK-COLOR'] = '6'
            # Modern Calendar CSS / Hex color hint (Yellow #FDD835 / #F1C40F)
            event_ical['COLOR'] = '#FDD835'

            cal.add_component(event_ical)

        return cal.to_ical()
