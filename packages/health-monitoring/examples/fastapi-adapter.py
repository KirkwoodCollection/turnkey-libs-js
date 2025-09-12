# FastAPI Python adapter example for health endpoints
# This shows how to implement the same health endpoints in Python services

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
import asyncio
import psutil
import time
import aioredis
import asyncpg

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded" 
    UNHEALTHY = "unhealthy"

class DependencyType(str, Enum):
    DATABASE = "database"
    CACHE = "cache"
    MESSAGE_QUEUE = "message_queue"
    EXTERNAL_API = "external_api"
    STORAGE = "storage"

class HealthResponse(BaseModel):
    status: HealthStatus
    timestamp: str
    service: str
    version: Optional[str] = None

class MemoryUsage(BaseModel):
    used: int
    total: int
    percentage: float

class ServiceMetrics(BaseModel):
    request_count: int
    error_rate: float
    average_response_time: float
    last_request_timestamp: Optional[str] = None
    custom_metrics: Optional[Dict[str, Any]] = None

class DetailedHealthResponse(HealthResponse):
    uptime: int
    memory: MemoryUsage
    cpu: Optional[float] = None
    metrics: ServiceMetrics
    environment: Optional[str] = None
    build: Optional[str] = None

class DependencyHealth(BaseModel):
    name: str
    type: DependencyType
    status: HealthStatus
    response_time: Optional[float] = None
    last_checked: str
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DependenciesHealthResponse(HealthResponse):
    dependencies: List[DependencyHealth]

class IntegrationTestResult(BaseModel):
    name: str
    status: HealthStatus
    duration: float
    error: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class TestSummary(BaseModel):
    total: int
    passed: int
    failed: int
    skipped: int

class IntegrationTestResponse(HealthResponse):
    tests: List[IntegrationTestResult]
    summary: TestSummary

class HealthMonitor:
    def __init__(self, service_name: str, service_version: str = "1.0.0"):
        self.service_name = service_name
        self.service_version = service_version
        self.start_time = time.time()
        self.dependencies = {}
        self.integration_tests = {}
        self.metrics = ServiceMetrics(
            request_count=0,
            error_rate=0.0,
            average_response_time=0.0
        )

    def register_dependency(self, name: str, dep_type: DependencyType, checker_func):
        """Register a dependency with its health checker function"""
        self.dependencies[name] = {
            'type': dep_type,
            'checker': checker_func
        }

    def register_integration_test(self, name: str, test_func):
        """Register an integration test"""
        self.integration_tests[name] = test_func

    def update_metrics(self, metrics_update: Dict[str, Any]):
        """Update service metrics"""
        for key, value in metrics_update.items():
            if hasattr(self.metrics, key):
                setattr(self.metrics, key, value)

    async def get_basic_health(self) -> HealthResponse:
        """Get basic health status"""
        status = await self._determine_overall_health()
        
        return HealthResponse(
            status=status,
            timestamp=datetime.utcnow().isoformat() + "Z",
            service=self.service_name,
            version=self.service_version
        )

    async def get_detailed_health(self) -> DetailedHealthResponse:
        """Get detailed health information"""
        basic_health = await self.get_basic_health()
        uptime = int(time.time() - self.start_time)
        memory = self._get_memory_usage()
        cpu = self._get_cpu_usage()

        return DetailedHealthResponse(
            **basic_health.dict(),
            uptime=uptime,
            memory=memory,
            cpu=cpu,
            metrics=self.metrics,
            environment=os.getenv("ENVIRONMENT"),
            build=os.getenv("BUILD_VERSION")
        )

    async def get_dependencies_health(self) -> DependenciesHealthResponse:
        """Check all registered dependencies"""
        basic_health = await self.get_basic_health()
        dependencies = []

        for name, dep_info in self.dependencies.items():
            try:
                dep_health = await dep_info['checker']()
                dependencies.append(dep_health)
            except Exception as e:
                dependencies.append(DependencyHealth(
                    name=name,
                    type=dep_info['type'],
                    status=HealthStatus.UNHEALTHY,
                    last_checked=datetime.utcnow().isoformat() + "Z",
                    error=str(e)
                ))

        overall_status = self._determine_dependencies_status(dependencies)

        return DependenciesHealthResponse(
            **basic_health.dict(),
            status=overall_status,
            dependencies=dependencies
        )

    async def get_integration_test_health(self) -> IntegrationTestResponse:
        """Run all registered integration tests"""
        basic_health = await self.get_basic_health()
        tests = []
        passed = failed = skipped = 0

        for name, test_func in self.integration_tests.items():
            try:
                result = await test_func()
                tests.append(result)
                
                if result.status == HealthStatus.HEALTHY:
                    passed += 1
                elif result.status == HealthStatus.UNHEALTHY:
                    failed += 1
                else:
                    skipped += 1
                    
            except Exception as e:
                failed += 1
                tests.append(IntegrationTestResult(
                    name=name,
                    status=HealthStatus.UNHEALTHY,
                    duration=0.0,
                    error=str(e)
                ))

        overall_status = HealthStatus.UNHEALTHY if failed > 0 else \
                        HealthStatus.DEGRADED if skipped > 0 else HealthStatus.HEALTHY

        return IntegrationTestResponse(
            **basic_health.dict(),
            status=overall_status,
            tests=tests,
            summary=TestSummary(
                total=len(tests),
                passed=passed,
                failed=failed,
                skipped=skipped
            )
        )

    async def _determine_overall_health(self) -> HealthStatus:
        """Determine overall service health"""
        memory = self._get_memory_usage()
        cpu = self._get_cpu_usage()

        if memory.percentage > 90 or (cpu and cpu > 90):
            return HealthStatus.UNHEALTHY
        
        if memory.percentage > 80 or (cpu and cpu > 80):
            return HealthStatus.DEGRADED
            
        if self.metrics.error_rate > 0.5:
            return HealthStatus.UNHEALTHY
            
        if self.metrics.error_rate > 0.1:
            return HealthStatus.DEGRADED

        return HealthStatus.HEALTHY

    def _get_memory_usage(self) -> MemoryUsage:
        """Get current memory usage"""
        memory = psutil.virtual_memory()
        return MemoryUsage(
            used=memory.used,
            total=memory.total,
            percentage=memory.percent
        )

    def _get_cpu_usage(self) -> Optional[float]:
        """Get current CPU usage"""
        try:
            return psutil.cpu_percent(interval=0.1)
        except:
            return None

    def _determine_dependencies_status(self, dependencies: List[DependencyHealth]) -> HealthStatus:
        """Determine overall status based on dependencies"""
        critical_unhealthy = any(dep.status == HealthStatus.UNHEALTHY for dep in dependencies)
        if critical_unhealthy:
            return HealthStatus.UNHEALTHY
            
        any_unhealthy_or_degraded = any(
            dep.status in [HealthStatus.UNHEALTHY, HealthStatus.DEGRADED] 
            for dep in dependencies
        )
        if any_unhealthy_or_degraded:
            return HealthStatus.DEGRADED
            
        return HealthStatus.HEALTHY

# Example FastAPI application
app = FastAPI(title="User Service", version="1.2.0")

# Initialize health monitor
health_monitor = HealthMonitor("user-service", "1.2.0")

# Example dependency checkers
async def check_postgres():
    """Check PostgreSQL database connection"""
    start_time = time.time()
    try:
        # Mock database check - replace with actual connection
        await asyncio.sleep(0.05)  # Simulate DB query
        response_time = (time.time() - start_time) * 1000
        
        return DependencyHealth(
            name="postgres-db",
            type=DependencyType.DATABASE,
            status=HealthStatus.HEALTHY,
            response_time=response_time,
            last_checked=datetime.utcnow().isoformat() + "Z",
            metadata={
                "connection_pool": {"active": 8, "idle": 12, "total": 20},
                "query_stats": {"slow_queries": 1, "avg_query_time": 25}
            }
        )
    except Exception as e:
        return DependencyHealth(
            name="postgres-db",
            type=DependencyType.DATABASE,
            status=HealthStatus.UNHEALTHY,
            response_time=(time.time() - start_time) * 1000,
            last_checked=datetime.utcnow().isoformat() + "Z",
            error=str(e)
        )

async def check_redis():
    """Check Redis cache connection"""
    start_time = time.time()
    try:
        # Mock Redis check - replace with actual connection
        await asyncio.sleep(0.02)  # Simulate Redis ping
        response_time = (time.time() - start_time) * 1000
        
        return DependencyHealth(
            name="redis-cache",
            type=DependencyType.CACHE,
            status=HealthStatus.HEALTHY,
            response_time=response_time,
            last_checked=datetime.utcnow().isoformat() + "Z",
            metadata={
                "hit_rate": 0.92,
                "miss_rate": 0.08,
                "evictions": 45,
                "key_count": 15000
            }
        )
    except Exception as e:
        return DependencyHealth(
            name="redis-cache",
            type=DependencyType.CACHE,
            status=HealthStatus.UNHEALTHY,
            response_time=(time.time() - start_time) * 1000,
            last_checked=datetime.utcnow().isoformat() + "Z",
            error=str(e)
        )

# Register dependencies
health_monitor.register_dependency("postgres-db", DependencyType.DATABASE, check_postgres)
health_monitor.register_dependency("redis-cache", DependencyType.CACHE, check_redis)

# Example integration test
async def test_user_creation_flow():
    """Test user creation end-to-end flow"""
    start_time = time.time()
    try:
        # Mock integration test
        await asyncio.sleep(0.15)  # Simulate test execution
        duration = (time.time() - start_time) * 1000
        
        # 95% success rate
        if time.time() % 20 < 1:  # Occasional failure
            raise Exception("User creation validation failed")
            
        return IntegrationTestResult(
            name="user-creation-flow",
            status=HealthStatus.HEALTHY,
            duration=duration,
            details={
                "steps": ["validate_input", "create_user", "send_notification"],
                "performance": "good"
            }
        )
    except Exception as e:
        return IntegrationTestResult(
            name="user-creation-flow",
            status=HealthStatus.UNHEALTHY,
            duration=(time.time() - start_time) * 1000,
            error=str(e)
        )

# Register integration test
health_monitor.register_integration_test("user-creation-flow", test_user_creation_flow)

# Health endpoints
@app.get("/health", response_model=HealthResponse)
async def get_health():
    """Basic health check endpoint"""
    try:
        health = await health_monitor.get_basic_health()
        status_code = 503 if health.status == HealthStatus.UNHEALTHY else 200
        return JSONResponse(content=health.dict(), status_code=status_code)
    except Exception as e:
        return JSONResponse(
            content={
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": "user-service",
                "error": "Health check failed"
            },
            status_code=503
        )

@app.get("/health/detailed", response_model=DetailedHealthResponse)
async def get_detailed_health():
    """Detailed health check endpoint"""
    try:
        health = await health_monitor.get_detailed_health()
        status_code = 503 if health.status == HealthStatus.UNHEALTHY else 200
        return JSONResponse(content=health.dict(), status_code=status_code)
    except Exception as e:
        return JSONResponse(
            content={
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": "user-service",
                "error": "Detailed health check failed"
            },
            status_code=503
        )

@app.get("/health/dependencies", response_model=DependenciesHealthResponse)  
async def get_dependencies_health():
    """Dependencies health check endpoint"""
    try:
        health = await health_monitor.get_dependencies_health()
        status_code = 503 if health.status == HealthStatus.UNHEALTHY else 200
        return JSONResponse(content=health.dict(), status_code=status_code)
    except Exception as e:
        return JSONResponse(
            content={
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": "user-service",
                "dependencies": [],
                "error": "Dependencies health check failed"
            },
            status_code=503
        )

@app.get("/health/integration-test", response_model=IntegrationTestResponse)
async def get_integration_test_health():
    """Integration test endpoint"""
    try:
        health = await health_monitor.get_integration_test_health()
        status_code = 503 if health.status == HealthStatus.UNHEALTHY else 200
        return JSONResponse(content=health.dict(), status_code=status_code)
    except Exception as e:
        return JSONResponse(
            content={
                "status": "unhealthy", 
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": "user-service",
                "tests": [],
                "summary": {"total": 0, "passed": 0, "failed": 0, "skipped": 0},
                "error": "Integration tests failed"
            },
            status_code=503
        )

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)