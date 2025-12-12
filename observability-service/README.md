# Observability Service (Prometheus Metrics API)

A microservice that provides REST API endpoints to query and aggregate Prometheus metrics for Kubernetes clusters and system observability.

## Description

This service acts as an intermediary between frontend applications and Prometheus, providing structured, easy-to-consume metrics data. It follows hexagonal architecture principles with clear separation of concerns between adapters, core business logic, and ports.

## Features

- **Cluster Overview**: Get comprehensive cluster health metrics including nodes, pods, namespaces, and resource utilization
- **Resource Metrics**: Query CPU and memory utilization with historical data and trends
- **Infrastructure Metrics**: Retrieve metrics for pods, nodes, and tenants
- **Database I/O Metrics**: Monitor disk and network I/O operations
- **Time-series Data**: Support for historical data with configurable time ranges
- **Health Checks**: Built-in health endpoint for monitoring service status
- **CORS Support**: Configured for cross-origin requests from specified domains

## Architecture

The service follows Clean Architecture/Hexagonal Architecture:

- **Adapters**: HTTP handlers and Prometheus client integration
- **Core**: Domain models and business logic services
- **Ports**: Interfaces defining contracts between layers

## Prerequisites

- Go 1.21 or later
- Access to a Prometheus instance
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd observability-service
```

2. Install dependencies:
```bash
go mod download
```

3. Build the application:
```bash
go build -o prometheus-metrics-api cmd/api/main.go
```

## Configuration

The service can be configured using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | Port on which the server will listen |
| `PROMETHEUS_URL` | `http://localhost:9090` | URL of the Prometheus instance |
| `ENVIRONMENT` | `development` | Environment (development/production) |

## Usage

### Running Locally

```bash
# With default configuration
./prometheus-metrics-api

# With custom environment variables
PROMETHEUS_URL=http://prometheus.example.com:9090 SERVER_PORT=8081 ./prometheus-metrics-api
```

### API Endpoints

All API endpoints are prefixed with `/api/v1/systems`. Time-series endpoints support an optional `duration` query parameter (default: `1h`, e.g., `?duration=24h`).

#### Health Check
- **GET /health**
  - **Description**: Service health status
  - **Response**: `{"status": "healthy"}`

#### Cluster Overview
- **GET /api/v1/systems/overview**
  - **Description**: Comprehensive cluster health metrics
  - **Response**:
```json
{
  "totalNodes": 5,
  "runningNodes": 5,
  "totalPods": 42,
  "totalNamespaces": 8,
  "cpuUsagePercent": 67.5,
  "memoryUsagePercent": 73.2
}
```

#### Metric Cards (Time-series)
- **GET /api/v1/systems/requests-metric**
- **GET /api/v1/systems/pods-metric**
- **GET /api/v1/systems/nodes-metric**
- **GET /api/v1/systems/tenants-metric**
  - **Description**: Time-series metrics with sparkline data
  - **Response**:
```json
{
  "title": "Total Requests",
  "value": "1.2K",
  "rawValue": 1200,
  "changePercent": "+5.2%",
  "changeLabel": "vs last hour",
  "status": "up",
  "sparkline": [
    {"timestamp": 1703126400, "value": 1100},
    {"timestamp": 1703126460, "value": 1150},
    {"timestamp": 1703126520, "value": 1200}
  ]
}
```

#### Resource Utilization (Time-series)
- **GET /api/v1/systems/cpu**
- **GET /api/v1/systems/memory**
  - **Description**: CPU/Memory utilization with historical trends
  - **Response**:
```json
{
  "currentValue": 67.5,
  "changePercent": 5.2,
  "trend": "up",
  "history": [
    {"timestamp": 1703126400, "value": 62.3},
    {"timestamp": 1703126460, "value": 65.1},
    {"timestamp": 1703126520, "value": 67.5}
  ]
}
```

#### Infrastructure Lists
- **GET /api/v1/systems/nodes**
  - **Description**: List of cluster nodes with current metrics
  - **Response**: Array of node metrics
```json
[
  {
    "name": "node-1",
    "cpuUsagePercent": 45.2,
    "memoryUsagePercent": 78.3,
    "podCount": 15,
    "status": "Ready"
  }
]
```

- **GET /api/v1/systems/namespaces**
  - **Description**: List of namespaces with resource usage
  - **Response**: Array of namespace metrics
```json
[
  {
    "name": "default",
    "podCount": 5,
    "cpuUsage": 2.1,
    "memoryUsage": 1.8
  }
]
```

#### Database I/O Metrics
- **GET /api/v1/systems/database-io**
  - **Description**: Database disk and network I/O metrics
  - **Response**:
```json
{
  "diskReadBytesPerSec": 1024000,
  "diskWriteBytesPerSec": 512000,
  "diskReadOpsPerSec": 150,
  "diskWriteOpsPerSec": 75,
  "networkReceiveBytesPerSec": 2048000,
  "networkTransmitBytesPerSec": 1024000,
  "networkReceiveOpsPerSec": 200,
  "networkTransmitOpsPerSec": 100,
  "diskReadHistory": [{"timestamp": 1703126400, "value": 900000}],
  "diskWriteHistory": [{"timestamp": 1703126400, "value": 450000}],
  "networkReceiveHistory": [{"timestamp": 1703126400, "value": 1800000}],
  "networkTransmitHistory": [{"timestamp": 1703126400, "value": 900000}],
  "source": "postgresql"
}
```

## Docker

Build and run using Docker:

```bash
# Build the image
docker build -t prometheus-metrics-api .

# Run the container
docker run -p 8080:8080 \
  -e PROMETHEUS_URL=http://host.docker.internal:9090 \
  prometheus-metrics-api
```

## Development

### Running Tests
```bash
go test ./...
```

### Building for Production
```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o prometheus-metrics-api cmd/api/main.go
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
