import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    service_name: str = "FREIGHTIQ ML Service"
    version: str = "3.2.0"
    port: int = int(os.getenv("ML_PORT", "8000"))
    host: str = os.getenv("ML_HOST", "0.0.0.0")
    gateway_url: str = os.getenv("GATEWAY_URL", "http://localhost:3001")
    
    # QpiAI Configuration
    qpiai_api_key: str = os.getenv("QPIAI_API_KEY", "")
    qpiai_base_url: str = os.getenv("QPIAI_BASE_URL", "https://qcloud.qpiai.tech")
    qpiai_device: str = os.getenv("QPIAI_DEFAULT_DEVICE", "QpiAI-QSV-Simulator")
    qpiai_experiment: str = os.getenv("QPIAI_EXPERIMENT_NAME", "Carrier QUBO Allocation")
    
    # Ollama Configuration
    ollama_host: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.1")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    # Paths
    models_dir: str = os.path.join(os.path.dirname(__file__), "..", "models")
    data_dir: str = os.path.join(os.path.dirname(__file__), "..", "..", "data")

settings = Settings()
