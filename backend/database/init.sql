DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "project_collaborators" CASCADE;
DROP TABLE IF EXISTS "status" CASCADE;
DROP TABLE IF EXISTS "priority" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "task_assignees" CASCADE;
DROP TABLE IF EXISTS "task_comments" CASCADE;

CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "projects" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    active BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE "project_collaborators" (
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE "status" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE "priority" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE "notifications" (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    notification TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE "tasks" (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    owner_id INT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status INT NOT NULL,
    priority INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    deadline TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (status) REFERENCES status(id),
    FOREIGN KEY (priority) REFERENCES priority(id)
);

CREATE TABLE "task_assignees" (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE "task_comments" (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
