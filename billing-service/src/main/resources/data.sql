-- Initialize pricing for resources
INSERT INTO prices (metric, price) VALUES ('CPU_HOURS', 0.10)
    ON CONFLICT (metric) DO NOTHING;
INSERT INTO prices (metric, price) VALUES ('MEMORY_GB_HOURS', 0.05)
    ON CONFLICT (metric) DO NOTHING;
INSERT INTO prices (metric, price) VALUES ('STORAGE_GB', 0.02)
    ON CONFLICT (metric) DO NOTHING;