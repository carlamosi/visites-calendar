# Visitas Calendar

<p align="center">
  <strong>Turn a patient visit schedule into a calendar in seconds.</strong>
  <br />
  Upload. Review. Export.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/iCalendar-.ics-5B5FC7" alt="iCalendar" />
</p>

<p align="center">
  A focused full-stack tool for transforming structured patient visit schedules from Excel into calendar events that can be imported into Outlook and other calendar clients.
</p>

---

## ✦ Why this exists

A patient visit schedule can be perfectly organised in Excel and still be surprisingly awkward to use day to day.

The original workflow involved a familiar chain of small tasks:

**open the spreadsheet → find the visit → read the details → create the calendar event → repeat**

One event is easy.

Dozens of events are not.

The problem was therefore not really Excel. It was the **gap between the system used to organise the visits and the system used to manage the working day**.

Visitas Calendar was created to close that gap.

> **One structured schedule in. A usable calendar out.**

The result is a small application built around a very practical idea: remove repetitive manual work while keeping the user in control of the final schedule.

---

## ✦ The experience

The entire workflow is designed around three steps.

```text
┌──────────────────┐
│  01  UPLOAD      │
│                  │
│  Select the      │
│  Excel schedule  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  02  REVIEW      │
│                  │
│  Inspect and     │
│  edit the visits │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  03  EXPORT      │
│                  │
│  Generate a      │
│  ready-to-import │
│  calendar file   │
└──────────────────┘
```

The application also supports generating a calendar directly from the structured data used by the interactive grid.

The interface stays simple because the complexity belongs underneath it.

---

# ✦ What it does

### Excel → Calendar

The application accepts `.xlsx` schedules, extracts the relevant visit information, and transforms it into standard iCalendar events.

### Interactive review

Instead of treating the spreadsheet as a black box, the application exposes the visit data through an interactive grid.

This creates a useful checkpoint before export:

**import → inspect → correct → generate**

### Standard `.ics` output

The generated calendar uses the iCalendar format, making it suitable for import into Outlook and other compatible calendar applications.

Each event can include:

- Visit name
- Study
- Patient number
- Date
- Start time
- End time
- Unique event identifier
- Category information
- Calendar metadata

---

# ✦ From spreadsheet to calendar

At a high level, the application performs one transformation:

```text
                    DATA
                      │
                      ▼
             ┌─────────────────┐
             │      Excel      │
             │      .xlsx      │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │     Parsing     │
             │   & validation  │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │  Structured     │
             │  visit data     │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │    Calendar     │
             │    service      │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   iCalendar     │
             │      .ics       │
             └────────┬────────┘
                      │
                      ▼
                 OUTLOOK /
                 CALENDAR
```

This separation is intentional.

The source format may change. The interface may change. The destination calendar may evolve.

The core transformation can remain the same.

---

# ✦ Architecture

Visitas Calendar uses a modern full-stack architecture with a clear boundary between presentation, API concerns and business logic.

```text
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│                                                     │
│              Next.js 15 + React                     │
│          TypeScript + Tailwind CSS                  │
│              Framer Motion                          │
│                                                     │
│              Interactive Grid                       │
└───────────────────────┬─────────────────────────────┘
                        │
                        │ HTTP / JSON
                        ▼
┌─────────────────────────────────────────────────────┐
│                     API                             │
│                                                     │
│                    FastAPI                           │
│                                                     │
│       Routes  →  Services  →  Models                │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                 CALENDAR ENGINE                     │
│                                                     │
│              Python + iCalendar                     │
│                                                     │
│        Visit data → Calendar events                 │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
                     .ics
```

## Frontend

Built with:

- **Next.js 15**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**

The frontend is responsible for the user experience, interactive visit editing and communication with the backend API.

## Backend

Built with:

- **Python**
- **FastAPI**
- **Pydantic/data models**
- **icalendar**
- **BytesIO**

The backend is intentionally lightweight. Uploaded data can be processed in memory without requiring persistent temporary files for the conversion workflow.

## Deployment

The project is configured for **Vercel**, with the Next.js application and Python serverless API functions deployed as part of the same project.

---

# ✦ API design

The API deliberately exposes only the operations needed by the workflow.

| Endpoint | Purpose |
|---|---|
| `POST /generate` | Convert an uploaded Excel schedule into an `.ics` calendar |
| `POST /generate-from-json` | Convert structured grid data into an `.ics` calendar |

This keeps the backend focused on its actual responsibility:

> **Take structured visit data and produce calendar events.**

---

# ✦ Calendar generation

The calendar layer lives independently from the HTTP routes.

For each visit, the service creates an iCalendar event containing the information required by calendar clients.

Conceptually:

```text
Calendar
 ├── Event
 │    ├── SUMMARY
 │    ├── DTSTART
 │    ├── DTEND
 │    ├── DTSTAMP
 │    ├── UID
 │    └── CATEGORIES
 │
 ├── Event
 │    ├── SUMMARY
 │    ├── DTSTART
 │    ├── DTEND
 │    └── ...
 │
 └── ...
```

Every event receives a unique identifier.

That detail matters because calendar events are entities, not simply rows exported from a spreadsheet.

---

# ✦ The Outlook lesson

One of the most interesting technical discoveries in this project came from something that initially looked trivial:

**calendar colours.**

It is tempting to assume that adding a yellow category to an `.ics` file means Outlook will necessarily display the event as yellow.

In practice, calendar interoperability is more subtle.

The iCalendar file can contain a category name, while Outlook maintains its own category system and colour mapping.

That distinction led to an important lesson:

> **A standards-compliant file and an identical user experience across calendar clients are two different engineering problems.**

The project therefore treats calendar metadata as an interoperability concern rather than assuming that one property will behave identically everywhere.

This is a small example of a much larger principle:

**standards provide the contract; individual platforms decide how they implement and extend it.**

---

# ✦ What I learned

This project started as a practical automation task, but it became a useful exercise in full-stack engineering.

### 01 · Understand the workflow before the technology

The best solution was not determined by the framework.

It started by understanding where the repetitive work actually happened.

Once the workflow was clear, the technical architecture became much easier to define.

### 02 · Separate transport from business logic

FastAPI routes should not be responsible for understanding how a calendar is constructed.

The route receives the request.

The service understands the business operation.

The calendar layer generates the output.

That separation makes the system easier to test, reason about and extend.

### 03 · Standards are necessary, but not sufficient

iCalendar provides a standard way to represent calendar information.

Real-world applications such as Outlook may add their own behaviour on top.

Testing the actual destination is therefore just as important as producing technically valid output.

### 04 · Privacy starts with architecture

For this type of workflow, unnecessary persistence is undesirable.

Processing spreadsheet contents in memory reduces the amount of data that needs to be written to disk during conversion.

This is not a replacement for a complete security model, but it is a useful example of how architectural decisions can reduce unnecessary data handling.

### 05 · Good UX hides complexity

Behind a three-step workflow there is file parsing, data transformation, validation, API communication and calendar generation.

The user does not need to see all of that.

A strong interface makes the system feel simple without making the system itself simplistic.

---

# ✦ Project structure

```text
visites-calendar/
│
├── src/
│   └── components/
│       └── GridEditor.tsx
│
├── backend/
│   ├── main.py
│   │
│   ├── models/
│   │
│   ├── routes/
│   │   └── calendar.py
│   │
│   ├── services/
│   │   └── calendar_generator.py
│   │
│   ├── tests/
│   │
│   └── utils/
│
├── public/
│
├── package.json
├── requirements.txt
├── vercel.json
└── README.md
```

The repository follows a simple responsibility-based structure:

```text
UI
 ↓
API
 ↓
Services
 ↓
Models / Utilities
```

No unnecessary abstraction layers. No giant monolithic handler.

Just enough structure to keep the application maintainable.

---

# ✦ Run it locally

## Requirements

- Node.js 18+
- Python 3.9+

## Frontend

```bash
npm install
npm run dev
```

The Next.js development server will be available at:

```text
http://localhost:3000
```

## Backend

Create a virtual environment:

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

---

# ✦ Deployment

The project is configured for deployment on Vercel.

The intended deployment flow is straightforward:

```text
Git repository
      │
      ▼
    Vercel
      │
      ├── Next.js frontend
      │
      └── Python serverless API
```

The `vercel.json` configuration connects the application structure with the deployment environment.

---

# ✦ Design principles

A few principles shaped the project from the beginning.

| Principle | Why it matters |
|---|---|
| **Simple workflow** | The user should not need technical knowledge |
| **Separation of concerns** | Each layer has one clear responsibility |
| **In-memory processing** | Avoid unnecessary temporary data persistence |
| **Standards-based output** | Keep the generated calendar portable |
| **Unique event IDs** | Treat calendar entries as real entities |
| **Human review** | Give users a chance to validate data before export |
| **Platform awareness** | Account for differences between calendar clients |

---

# ✦ Where it could go next

The current architecture leaves room for several natural extensions:

- More robust Outlook category handling
- Additional calendar providers
- More advanced validation
- Custom event templates
- More flexible scheduling rules
- Calendar synchronisation
- Authentication and multi-user workflows
- Automated interoperability tests
- Expanded import and export formats

The important part is that these features can build on the existing separation between the UI, API and calendar generation service.

---

# ✦ The bigger idea

Visitas Calendar is a small project.

That is intentional.

It does not try to replace the systems already used to manage studies or patient information.

It focuses on one frustrating gap and solves it well:

```text
        BEFORE                         AFTER

   Excel schedule                 Excel schedule
         │                              │
         ▼                              ▼
   Find each visit                 Upload once
         │                              │
         ▼                              ▼
   Create event                    Review visits
         │                              │
         ▼                              ▼
   Repeat...                       Export .ics
         │                              │
         ▼                              ▼
   Manual calendar                 Calendar
```

The value is not in generating a file.

**The value is in removing the repetitive work around it.**

---

<p align="center">
  <strong>Built to make a small workflow noticeably better.</strong>
  <br />
  <sub>Less copying. Less repetition. More time for the work that actually matters.</sub>
</p>
