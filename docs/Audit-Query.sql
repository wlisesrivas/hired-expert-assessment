/**
Metodo	Total     Mas Reciente
DELETE	12            abr/20/2026 4:42:13
LIST	4             abr/20/2026 4:39:13
PUT		5              abr/20/2026 4:45:13
GET		6              abr/20/2026 3:38:13
POST	7             abr/20/2026 2:38:13
*/

select distinct method as Metodo,
(
	select count(*) from PUBLIC.AUDIT_AUDITLOG where method = a.method
) as Total,
(
	select created_at from PUBLIC.AUDIT_AUDITLOG where method = a.method order by 1 desc limit 1
) as "Mas Reciente"
from PUBLIC.AUDIT_AUDITLOG a;
