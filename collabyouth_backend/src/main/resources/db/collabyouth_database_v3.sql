-- ============================================================
--  CollabYouth — Script de création de base de données v3
--  Base : PostgreSQL 15+
--  Encodage : UTF-8
--  Changement v3 : organizations est une table indépendante
--                  séparée de users
-- ============================================================

-- ──────────────────────────────────────────────────────────────
--  EXTENSIONS
-- ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────
--  TYPES ÉNUMÉRÉS
-- ──────────────────────────────────────────────────────────────

-- Rôle d'un utilisateur (personne physique) sur la plateforme
CREATE TYPE user_role AS ENUM (
    'STUDENT',
    'ADMIN'         -- admin plateforme uniquement
);

-- Statut d'un compte (users et organizations)
CREATE TYPE account_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PENDING'
);

-- Rôle d'un membre au sein d'une équipe
CREATE TYPE team_role AS ENUM (
    'ADMIN',
    'MEMBER'
);

-- Statut d'une invitation à une équipe
CREATE TYPE invitation_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'CANCELLED'
);

-- Statut d'une demande d'inscription d'équipe à un hackathon
CREATE TYPE registration_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED'
);

-- Type d'événement
CREATE TYPE event_type AS ENUM (
    'HACKATHON',
    'CHALLENGE'
);

-- Statut d'un événement
CREATE TYPE event_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ONGOING',
    'CLOSED',
    'ARCHIVED'
);

-- Format d'un événement
CREATE TYPE event_format AS ENUM (
    'IN_PERSON',
    'ONLINE',
    'HYBRID'
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : users
--  Personnes physiques : étudiants + admins plateforme
--  Les organisateurs sont dans la table organizations (séparée)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            user_role       NOT NULL DEFAULT 'STUDENT',
    status          account_status  NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_not_empty CHECK (TRIM(email) <> '')
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : user_profiles
--  Profil étendu d'un étudiant (1-1 avec users)
--  Champs spécifiques aux étudiants uniquement
-- ──────────────────────────────────────────────────────────────
CREATE TABLE user_profiles (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio             TEXT,
    domain          VARCHAR(150),
    study_year      SMALLINT        CHECK (study_year BETWEEN 1 AND 8),
    institution     VARCHAR(200),
    availability    VARCHAR(100),
    github_url      VARCHAR(255),
    linkedin_url    VARCHAR(255),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : skills
--  Référentiel partagé de compétences
-- ──────────────────────────────────────────────────────────────
CREATE TABLE skills (
    id      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(100)    NOT NULL UNIQUE
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : user_skills
--  Compétences d'un étudiant (N-N entre user_profiles et skills)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE user_skills (
    user_profile_id UUID    NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    skill_id        UUID    NOT NULL REFERENCES skills(id)        ON DELETE CASCADE,
    PRIMARY KEY (user_profile_id, skill_id)
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : organizations
--  Entité indépendante de users
--  Possède ses propres credentials (email + password_hash)
--  Crée et gère les événements (hackathons, challenges)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE organizations (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    description     TEXT,
    website_url     VARCHAR(255),
    location        VARCHAR(200),
    logo_url        VARCHAR(255),
    status          account_status  NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT org_name_not_empty  CHECK (TRIM(name)  <> ''),
    CONSTRAINT org_email_not_empty CHECK (TRIM(email) <> '')
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : teams
--  Créée par un étudiant (user) qui devient automatiquement ADMIN
-- ──────────────────────────────────────────────────────────────
CREATE TABLE teams (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200)    NOT NULL,
    description TEXT,
    created_by  UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT teams_name_not_empty CHECK (TRIM(name) <> '')
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : team_members
--  Membres d'une équipe avec leur rôle
-- ──────────────────────────────────────────────────────────────
CREATE TABLE team_members (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id     UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_role   team_role   NOT NULL DEFAULT 'MEMBER',
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (team_id, user_id)
);

-- ──────────────────────────────────────────────────────────────
--  TRIGGER : créateur d'une équipe → ADMIN automatique
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_team_creator_becomes_admin()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, team_role)
    VALUES (NEW.id, NEW.created_by, 'ADMIN');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_team_creator_becomes_admin
AFTER INSERT ON teams
FOR EACH ROW EXECUTE FUNCTION fn_team_creator_becomes_admin();

-- ──────────────────────────────────────────────────────────────
--  TABLE : team_invitations
--  Invitation envoyée par un ADMIN d'équipe à un étudiant
--  Contient un message personnalisé obligatoire
-- ──────────────────────────────────────────────────────────────
CREATE TABLE team_invitations (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id         UUID                NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    invited_user_id UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by      UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT                NOT NULL,
    status          invitation_status   NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    responded_at    TIMESTAMPTZ,

    -- Une seule invitation PENDING par équipe et par utilisateur
    CONSTRAINT uq_one_pending_invite UNIQUE NULLS NOT DISTINCT (team_id, invited_user_id, status),

    -- L'inviteur ne peut pas s'inviter lui-même
    CONSTRAINT chk_no_self_invite CHECK (invited_by <> invited_user_id),

    -- Message obligatoire et non vide
    CONSTRAINT chk_message_not_empty CHECK (TRIM(message) <> '')
);

-- Trigger : seul un ADMIN de l'équipe peut envoyer une invitation
CREATE OR REPLACE FUNCTION fn_check_inviter_is_team_admin()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id  = NEW.team_id
          AND user_id  = NEW.invited_by
          AND team_role = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'Seul un ADMIN de l''équipe peut inviter des membres.';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_inviter_is_team_admin
BEFORE INSERT ON team_invitations
FOR EACH ROW EXECUTE FUNCTION fn_check_inviter_is_team_admin();

-- Trigger : acceptation → insertion automatique dans team_members
CREATE OR REPLACE FUNCTION fn_accept_team_invitation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 'ACCEPTED' AND OLD.status = 'PENDING' THEN
        INSERT INTO team_members (team_id, user_id, team_role)
        VALUES (NEW.team_id, NEW.invited_user_id, 'MEMBER')
        ON CONFLICT (team_id, user_id) DO NOTHING;
        NEW.responded_at = NOW();
    END IF;

    IF NEW.status IN ('DECLINED', 'CANCELLED') AND OLD.status = 'PENDING' THEN
        NEW.responded_at = NOW();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_accept_team_invitation
BEFORE UPDATE ON team_invitations
FOR EACH ROW EXECUTE FUNCTION fn_accept_team_invitation();

-- ──────────────────────────────────────────────────────────────
--  TABLE : events
--  Créés par une organization (pas un user)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE events (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID            NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title           VARCHAR(300)    NOT NULL,
    description     TEXT,
    event_type      event_type      NOT NULL,
    event_status    event_status    NOT NULL DEFAULT 'DRAFT',
    event_format    event_format    NOT NULL DEFAULT 'IN_PERSON',
    location        VARCHAR(255),
    starts_at       TIMESTAMPTZ     NOT NULL,
    ends_at         TIMESTAMPTZ     NOT NULL,
    max_teams       INT,
    min_team_size   SMALLINT        NOT NULL DEFAULT 2,
    max_team_size   SMALLINT        NOT NULL DEFAULT 5,
    prize           VARCHAR(200),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_event_dates     CHECK (ends_at > starts_at),
    CONSTRAINT chk_team_sizes      CHECK (max_team_size >= min_team_size),
    CONSTRAINT chk_min_size_pos    CHECK (min_team_size >= 1),
    CONSTRAINT chk_max_teams_pos   CHECK (max_teams IS NULL OR max_teams > 0),
    CONSTRAINT chk_title_not_empty CHECK (TRIM(title) <> '')
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : event_tags
--  Thèmes / compétences ciblées par un événement
-- ──────────────────────────────────────────────────────────────
CREATE TABLE event_tags (
    event_id    UUID            NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tag         VARCHAR(100)    NOT NULL,
    PRIMARY KEY (event_id, tag)
);

-- ──────────────────────────────────────────────────────────────
--  TABLE : hackathon_registrations
--  Demande d'inscription d'une équipe à un événement
--
--  Règles :
--    - Seul l'ADMIN de l'équipe peut soumettre la demande
--    - Le message de motivation est obligatoire
--    - Une seule demande PENDING par équipe et par événement
--    - Pas d'inscription individuelle : tout passe par une équipe
-- ──────────────────────────────────────────────────────────────
CREATE TABLE hackathon_registrations (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID                NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id         UUID                NOT NULL REFERENCES teams(id)  ON DELETE CASCADE,
    requested_by    UUID                NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    motivation_msg  TEXT                NOT NULL,
    status          registration_status NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID                REFERENCES organizations(id),  -- l'organisation valide

    CONSTRAINT uq_one_pending_reg      UNIQUE NULLS NOT DISTINCT (event_id, team_id, status),
    CONSTRAINT chk_motivation_not_empty CHECK (TRIM(motivation_msg) <> '')
);

-- Trigger : seul l'ADMIN de l'équipe peut soumettre une inscription
CREATE OR REPLACE FUNCTION fn_check_registration_requester()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id  = NEW.team_id
          AND user_id  = NEW.requested_by
          AND team_role = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'Seul l''ADMIN de l''équipe peut inscrire l''équipe à un hackathon.';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_registration_requester
BEFORE INSERT ON hackathon_registrations
FOR EACH ROW EXECUTE FUNCTION fn_check_registration_requester();

-- ──────────────────────────────────────────────────────────────
--  TABLE : event_teams
--  Équipes officiellement acceptées dans un événement
--  Alimentée automatiquement lors de l'acceptation d'une demande
-- ──────────────────────────────────────────────────────────────
CREATE TABLE event_teams (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id         UUID        NOT NULL REFERENCES teams(id)  ON DELETE CASCADE,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (event_id, team_id)
);

-- Trigger : acceptation d'une inscription → insertion dans event_teams
CREATE OR REPLACE FUNCTION fn_accept_hackathon_registration()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_max_teams INT;
    v_current   INT;
BEGIN
    IF NEW.status = 'ACCEPTED' AND OLD.status = 'PENDING' THEN

        SELECT max_teams INTO v_max_teams
        FROM events WHERE id = NEW.event_id;

        IF v_max_teams IS NOT NULL THEN
            SELECT COUNT(*) INTO v_current
            FROM event_teams WHERE event_id = NEW.event_id;

            IF v_current >= v_max_teams THEN
                RAISE EXCEPTION 'Le nombre maximum d''équipes pour cet événement est atteint.';
            END IF;
        END IF;

        INSERT INTO event_teams (event_id, team_id)
        VALUES (NEW.event_id, NEW.team_id)
        ON CONFLICT (event_id, team_id) DO NOTHING;

        NEW.reviewed_at = NOW();
    END IF;

    IF NEW.status = 'REJECTED' AND OLD.status = 'PENDING' THEN
        NEW.reviewed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_accept_hackathon_registration
BEFORE UPDATE ON hackathon_registrations
FOR EACH ROW EXECUTE FUNCTION fn_accept_hackathon_registration();

-- ──────────────────────────────────────────────────────────────
--  TABLE : notifications
--  Notifications in-app pour les utilisateurs (étudiants)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(80) NOT NULL,
    title       VARCHAR(200),
    body        TEXT,
    is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
    ref_id      UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
--  TRIGGERS : updated_at automatique
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ──────────────────────────────────────────────────────────────
--  INDEX
-- ──────────────────────────────────────────────────────────────

-- users
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_users_status         ON users(status);

-- user_profiles
CREATE INDEX idx_user_profiles_user   ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_domain ON user_profiles(domain);

-- user_skills
CREATE INDEX idx_user_skills_skill    ON user_skills(skill_id);
CREATE INDEX idx_user_skills_profile  ON user_skills(user_profile_id);

-- organizations
CREATE INDEX idx_orgs_email           ON organizations(email);
CREATE INDEX idx_orgs_status          ON organizations(status);

-- teams
CREATE INDEX idx_teams_created_by     ON teams(created_by);

-- team_members
CREATE INDEX idx_tm_team              ON team_members(team_id);
CREATE INDEX idx_tm_user              ON team_members(user_id);
CREATE INDEX idx_tm_admin             ON team_members(team_id, team_role) WHERE team_role = 'ADMIN';

-- team_invitations
CREATE INDEX idx_tinv_team            ON team_invitations(team_id);
CREATE INDEX idx_tinv_invited         ON team_invitations(invited_user_id);
CREATE INDEX idx_tinv_status          ON team_invitations(status);

-- events
CREATE INDEX idx_events_org           ON events(organization_id);
CREATE INDEX idx_events_status        ON events(event_status);
CREATE INDEX idx_events_type          ON events(event_type);
CREATE INDEX idx_events_dates         ON events(starts_at, ends_at);

-- event_tags
CREATE INDEX idx_etags_event          ON event_tags(event_id);
CREATE INDEX idx_etags_tag            ON event_tags(tag);

-- hackathon_registrations
CREATE INDEX idx_hreg_event           ON hackathon_registrations(event_id);
CREATE INDEX idx_hreg_team            ON hackathon_registrations(team_id);
CREATE INDEX idx_hreg_status          ON hackathon_registrations(status);

-- event_teams
CREATE INDEX idx_eteams_event         ON event_teams(event_id);
CREATE INDEX idx_eteams_team          ON event_teams(team_id);

-- notifications
CREATE INDEX idx_notif_user_unread    ON notifications(user_id, is_read);
CREATE INDEX idx_notif_created        ON notifications(created_at DESC);

-- ──────────────────────────────────────────────────────────────
--  DONNÉES DE BASE (seed)
-- ──────────────────────────────────────────────────────────────

-- Compétences de base
INSERT INTO skills (name) VALUES
    ('Java'), ('Spring Boot'), ('React'), ('Angular'), ('Vue.js'),
    ('Python'), ('Django'), ('FastAPI'), ('Node.js'), ('TypeScript'),
    ('Docker'), ('Kubernetes'), ('AWS'), ('DevOps'), ('CI/CD'),
    ('PostgreSQL'), ('MongoDB'), ('Redis'),
    ('Machine Learning'), ('TensorFlow'), ('PyTorch'), ('Data Science'),
    ('Flutter'), ('Kotlin'), ('Swift'),
    ('Linux'), ('Cybersecurity'), ('Blockchain'),
    ('UI/UX Design'), ('Figma');

-- Admin plateforme (user, pas organization)
INSERT INTO users (first_name, last_name, email, password_hash, role, status)
VALUES (
    'Admin', 'CollabYouth',
    'admin@collabyouth.ma',
    '$2a$12$remplacerParUnVraiHashBCrypt',
    'ADMIN',
    'ACTIVE'
);

-- ──────────────────────────────────────────────────────────────
--  RÉSUMÉ DES TABLES ET RESPONSABILITÉS
-- ──────────────────────────────────────────────────────────────
--
--  AUTHENTIFICATION
--  ├── users          → étudiants + admin plateforme  (POST /api/auth/login)
--  └── organizations  → organisateurs d'événements    (POST /api/org/auth/login)
--
--  PROFILS
--  ├── user_profiles  → profil étendu étudiant (bio, GitHub, domaine...)
--  ├── user_skills    → compétences de l'étudiant
--  └── skills         → référentiel partagé
--
--  ÉQUIPES
--  ├── teams          → créée par un étudiant → trigger ADMIN auto
--  ├── team_members   → membres + rôles (ADMIN / MEMBER)
--  └── team_invitations → invitation avec message, seul ADMIN peut inviter
--
--  ÉVÉNEMENTS
--  ├── events         → créés par organizations uniquement
--  └── event_tags     → thèmes de l'événement
--
--  INSCRIPTIONS HACKATHON
--  ├── hackathon_registrations → demande équipe + message motivation
--  │                             seul ADMIN peut demander
--  └── event_teams             → équipes acceptées (auto via trigger)
--
--  NOTIFICATIONS
--  └── notifications  → in-app pour les étudiants
--
-- ──────────────────────────────────────────────────────────────
