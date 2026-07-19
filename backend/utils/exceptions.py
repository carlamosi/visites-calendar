class CalendarAppException(Exception):
    """Base exception for Calendar App"""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class InvalidFileException(CalendarAppException):
    """Raised when the uploaded file is invalid or not an Excel file."""
    pass

class EmptyWorkbookException(CalendarAppException):
    """Raised when the workbook contains no valid patient data."""
    pass

class ParsingException(CalendarAppException):
    """Raised when there is an error parsing the Excel data."""
    pass
