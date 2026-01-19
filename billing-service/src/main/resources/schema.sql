CREATE TABLE IF NOT EXISTS reserved_allocations (
        allocation_id UUID PRIMARY KEY,
        user_id UUID,
        workspace_id UUID,
        project_id UUID,
        cpu_cores DOUBLE PRECISION,
        memory_gb DOUBLE PRECISION,
        storage_gb DOUBLE PRECISION,
        container_limit INT,
        monthly_price DOUBLE PRECISION,
        start_date DATE,
        end_date DATE
);

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id UUID PRIMARY KEY,
    workspace_id UUID,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),
    total_cpu DECIMAL(19,2),
    total_ram DECIMAL(19,2),
    total_storage DECIMAL(19,2),
    subtotal DECIMAL(19,2),
    taxes DECIMAL(19,2),
    total DECIMAL(19,2),
    total_paid DECIMAL(19,2)
    );

CREATE TABLE IF NOT EXISTS prices(
    metric VARCHAR(20) PRIMARY KEY,
    price DOUBLE PRECISION
);

-- Initialize pricing for resources
INSERT INTO prices (metric, price) VALUES ('CPU_HOURS', 0.10)
    ON CONFLICT (metric) DO NOTHING;
INSERT INTO prices (metric, price) VALUES ('MEMORY_GB_HOURS', 0.05)
    ON CONFLICT (metric) DO NOTHING;
INSERT INTO prices (metric, price) VALUES ('STORAGE_GB', 0.02)
    ON CONFLICT (metric) DO NOTHING;