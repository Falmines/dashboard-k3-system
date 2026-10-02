SELECT column_name,data_type FROM information_schema.columns WHERE table_name='reports' ORDER BY ordinal_position;
SELECT DISTINCT type FROM reports ORDER BY type;
SELECT DISTINCT status FROM reports ORDER BY status;
