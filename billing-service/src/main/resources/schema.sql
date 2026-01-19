

CREATE TABLE if NOT EXISTS reserved_allocations (
        allocation_id UUID PRIMARY KEY,
        user_id UUID,
        workspace_id UUID,
        project_id UUID,
        cpu_cores Double,
        memory_gb Double,
        storage_gb Double,
        container_limit int,
        monthly_price Double,
        start_date Date,
        end_date Date
);

CREATE TABLE if NOT EXISTS invoices (
    invoice_id UUID PRIMARY KEY,
    workspace_id UUID,
    start_date Date,
    end_date Date,
    status VARCHAR(20),
    total_cpu DECIMAL(19,2),
    total_ram DECIMAL(19,2),
    total_storage DECIMAL(19,2),
    subtotal DECIMAL(19,2),
    taxes DECIMAL(19,2),
    total DECIMAL(19,2),
    total_paid DECIMAL(19,2)
    );

CREATE TABLE if NOT EXISTS prices(
    metric VARCHAR(20) PRIMARY KEY,
    price Double
    );

-- Initialize pricing for resources
INSERT INTO prices (metric, price) VALUES ('CPU_HOURS', 0.10)
    ON CONFLICT (metric) DO NOTHING;
INSERT INTO prices (metric, price) VALUES ('MEMORY_GB_HOURS', 0.05)
    ON CONFLICT (metric) DO NOTHING;
INSERT INTO prices (metric, price) VALUES ('STORAGE_GB', 0.02)
    ON CONFLICT (metric) DO NOTHING;