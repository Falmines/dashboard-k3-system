SELECT lower(username) AS username, count(*) FROM users GROUP BY lower(username) HAVING count(*) > 1;
SELECT lower(email) AS email, count(*) FROM users GROUP BY lower(email) HAVING count(*) > 1;
SELECT id, name FROM roles ORDER BY id;
