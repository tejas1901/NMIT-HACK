import os
import sys
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import settings
from .models import (
    DemurragePredictRequest,
    DemurragePredictResponse,
    DemurrageTrainRequest,
    ModelMetrics,
    RouteWaypointsRequest,
    RouteWeatherResponse,
    CarrierOptimizeRequest,
    CarrierOptimizeResponse,
    CorridorMetricsResponse,
    LLMInsightRequest,
    LLMInsightResponse
)
from .services import (
    demurrage_service,
    weather_service,
    quantum_service,
    corridor_service,
    llm_service
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("freightiq.ml")

app = FastAPI(
    title="FREIGHTIQ ML & Quantum Microservice",
    version=settings.version,
    description="Production Machine Learning, Quantum QUBO Optimization & Open-Meteo Weather Sentinel Service",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS: Restricted to Gateway by default, configurable
allowed_origins = [
    settings.gateway_url,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Invalid request schema", "code": "VALIDATION_ERROR", "details": exc.errors()}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "ML Service Internal Error", "code": "ML_INTERNAL_ERROR", "message": str(exc)}
    )

# ── Health Check ─────────────────────────────────────────────────────────────
@app.get("/ml/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.service_name,
        "version": settings.version,
        "timestamp": datetime.now().isoformat(),
        "models_loaded": {
            "xgboost": demurrage_service.classifier is not None,
            "quantum_sdk": quantum_service.has_qpiai_sdk,
            "open_meteo": True,
            "ollama_ready": True
        }
    }

# ── Demurrage Endpoints ───────────────────────────────────────────────────────
@app.post("/ml/demurrage/predict", response_model=DemurragePredictResponse, tags=["Demurrage"])
async def predict_demurrage(req: DemurragePredictRequest):
    """Predict container demurrage probability, dwell days, estimated penalty, and top SHAP feature importances."""
    try:
        return demurrage_service.predict(req)
    except Exception as e:
        logger.error(f"Demurrage prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Demurrage prediction error: {str(e)}")

@app.post("/ml/demurrage/train", response_model=ModelMetrics, tags=["Demurrage"])
async def train_demurrage(req: DemurrageTrainRequest):
    """Retrain XGBoost demurrage classification & regression models on fresh supply chain data."""
    try:
        return demurrage_service.train(req)
    except Exception as e:
        logger.error(f"Demurrage model retraining failed: {e}")
        raise HTTPException(status_code=500, detail=f"Model retraining error: {str(e)}")

@app.get("/ml/demurrage/metrics", response_model=ModelMetrics, tags=["Demurrage"])
async def get_demurrage_metrics():
    """Retrieve production evaluation metrics (AUC, RMSE, MAE) and feature importances."""
    return demurrage_service.get_metrics()

# ── Weather Waypoint Endpoint ─────────────────────────────────────────────────
@app.post("/ml/weather/waypoints", response_model=RouteWeatherResponse, tags=["Weather"])
async def route_weather_forecast(req: RouteWaypointsRequest):
    """Fetch live Open-Meteo forecasts per waypoint and calculate composite highway corridor risk score."""
    try:
        return await weather_service.get_route_forecast(req)
    except Exception as e:
        logger.error(f"Weather forecast query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

# ── Quantum Carrier Allocation Endpoint ───────────────────────────────────────
@app.post("/ml/optimize/carriers", response_model=CarrierOptimizeResponse, tags=["Optimization"])
async def optimize_carriers(req: CarrierOptimizeRequest):
    """Formulate multi-carrier allocation as a QUBO/assignment problem. Solves via QpiAI Quantum QCloud or classical fallback."""
    try:
        return quantum_service.optimize(req)
    except Exception as e:
        logger.error(f"Carrier optimization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Carrier optimization error: {str(e)}")

# ── Corridor KPIs Endpoint ────────────────────────────────────────────────────
@app.get("/ml/fleet/corridors", response_model=CorridorMetricsResponse, tags=["Fleet"])
async def get_corridor_kpis():
    """Compute aggregated corridor KPIs (transit times, bottleneck severity, delay rate, capacity utilization)."""
    return corridor_service.get_corridor_metrics()

# ── LLM Insight Endpoint ──────────────────────────────────────────────────────
@app.post("/ml/llm/insight", response_model=LLMInsightResponse, tags=["GenAI"])
async def generate_llm_insight(req: LLMInsightRequest):
    """Generate professional, grounded incident triage reports using local Ollama (with Gemini / deterministic fallback)."""
    try:
        return await llm_service.generate_insight(req)
    except Exception as e:
        logger.error(f"LLM insight generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"LLM insight error: {str(e)}")
