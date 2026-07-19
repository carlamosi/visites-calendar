import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

from backend.utils.config import settings
from backend.utils.exceptions import CalendarAppException
from backend.services.calendar_service import CalendarService

router = APIRouter()
calendar_service = CalendarService()

@router.post("/generate")
async def generate_calendar(file: UploadFile = File(...)):
    if not file.filename.endswith(tuple(settings.ALLOWED_EXTENSIONS)):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .xlsx files are allowed.")
    
    file_bytes = await file.read()
    
    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
        
    try:
        ics_bytes = calendar_service.process_excel_to_ics(file_bytes)
        
        # Create a StreamingResponse
        response = StreamingResponse(io.BytesIO(ics_bytes), media_type="text/calendar")
        response.headers["Content-Disposition"] = "attachment; filename=visitas_pacientes.ics"
        return response
        
    except CalendarAppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred during processing.")
