

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
    status VARCHAR(10),
    subtotal Double,
    taxes Double,
    total Double,

);
CREATE TABLE if NOT EXISTS invoice_items(
    item_id UUID PRIMARY KEY,
    invoice_id UUID,
    project_id UUID,
    description VARCHAR(255),
    pricing_model VARCHAR(20),
    metric VARCHAR(20),
    quantity Double,
    unit_price Double,
    amount Double
);
CREATE TABLE if NOT EXISTS prices(
    metric VARCHAR(20) PRIMARY KEY,
    price Double
    );