from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.users.router import router as users_router
from app.views.router import router as views_router
from app.place.router import router as place_router
from app.event.router import router as event_router
from app.invitelist.router import router as invite_list_router
from app.reports.router import router as reports_router

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

allowed_origins = [
    "http://localhost",
    "http://localhost/*",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5173/*",
]

# Adding CORSMiddleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from these origins
    allow_credentials=True,  # Allows cookies to be sent with requests
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers in requests
)

app.include_router(users_router, prefix='/api')
app.include_router(views_router, prefix='/api')
app.include_router(place_router, prefix='/api')
app.include_router(event_router, prefix='/api')
app.include_router(invite_list_router, prefix='/api')
app.include_router(reports_router, prefix='/api')
