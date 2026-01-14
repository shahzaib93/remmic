-- REMMIC Management Database Tables
-- This script sets up tables for Development Management and Real Estate Management modules

-- Create management schema
CREATE SCHEMA IF NOT EXISTS management;

-- ============================================================================
-- DEVELOPMENT MANAGEMENT MODEL TABLES
-- ============================================================================

-- Development Projects table
CREATE TABLE IF NOT EXISTS management.development_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    project_status VARCHAR(50) DEFAULT 'under_evaluation',
    -- Status flow: under_evaluation -> evaluated -> project_structured -> funding_open -> funded -> under_development -> completed

    -- Landowner information
    landowner_id VARCHAR(255),
    landowner_name VARCHAR(255),
    landowner_contact VARCHAR(100),

    -- Financial information
    total_budget DECIMAL(15,2),
    capital_required DECIMAL(15,2),
    funding_raised DECIMAL(15,2) DEFAULT 0,

    -- Timeline
    estimated_start_date DATE,
    estimated_completion_date DATE,
    actual_start_date DATE,
    actual_completion_date DATE,

    -- Developer/Contractor info
    developer_info JSONB,

    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feasibility Reports table
CREATE TABLE IF NOT EXISTS management.feasibility_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES management.development_projects(id) ON DELETE CASCADE,
    report_status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved

    -- Market Analysis
    market_potential_score INTEGER CHECK (market_potential_score >= 0 AND market_potential_score <= 100),
    market_analysis TEXT,
    demand_assessment TEXT,
    competition_analysis TEXT,

    -- Cost Estimates
    land_cost DECIMAL(15,2),
    construction_cost DECIMAL(15,2),
    infrastructure_cost DECIMAL(15,2),
    legal_fees DECIMAL(15,2),
    marketing_cost DECIMAL(15,2),
    contingency_cost DECIMAL(15,2),
    total_estimated_cost DECIMAL(15,2),

    -- ROI Scenarios (non-guaranteed)
    roi_scenarios JSONB, -- Array of {scenario_name, projected_revenue, projected_roi, timeframe, risk_level}

    -- Development Suitability
    legal_disclosure_status VARCHAR(50), -- clear, pending, issues_found
    zoning_compliance BOOLEAN,
    environmental_assessment TEXT,

    -- Admin Notes
    admin_notes TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Drawings table
CREATE TABLE IF NOT EXISTS management.project_drawings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES management.development_projects(id) ON DELETE CASCADE,
    drawing_type VARCHAR(100) NOT NULL, -- architectural, structural, electrical, plumbing, site_plan
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    version INTEGER DEFAULT 1,
    approval_status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, under_review, approved, rejected
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Financials table
CREATE TABLE IF NOT EXISTS management.project_financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES management.development_projects(id) ON DELETE CASCADE,
    capital_required DECIMAL(15,2) NOT NULL,
    minimum_investment DECIMAL(15,2),
    maximum_investment DECIMAL(15,2),
    funding_progress DECIMAL(5,2) DEFAULT 0, -- Percentage
    investor_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- active, closed

    -- Fee structure (REMMIC fees)
    structuring_fee DECIMAL(15,2),
    management_fee_percentage DECIMAL(5,2),

    -- Distribution info
    distribution_schedule JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Milestones table
CREATE TABLE IF NOT EXISTS management.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES management.development_projects(id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    description TEXT,
    sequence_order INTEGER,
    target_date DATE,
    completion_date DATE,
    percentage_complete INTEGER DEFAULT 0 CHECK (percentage_complete >= 0 AND percentage_complete <= 100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, delayed
    assigned_to VARCHAR(255),
    verification_notes TEXT,
    verification_photos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Expenses table
CREATE TABLE IF NOT EXISTS management.project_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES management.development_projects(id) ON DELETE CASCADE,
    expense_type VARCHAR(100) NOT NULL, -- construction, material, labor, permit, legal, marketing, management_fee, other
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PKR',
    vendor_name VARCHAR(255),
    vendor_contact VARCHAR(100),
    invoice_number VARCHAR(100),
    invoice_date DATE,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Reports table
CREATE TABLE IF NOT EXISTS management.project_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES management.development_projects(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL, -- progress, financial, milestone, completion
    report_period VARCHAR(50), -- monthly, quarterly, annual
    report_date DATE NOT NULL,
    content TEXT,
    attachments JSONB,
    is_published BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REAL ESTATE MANAGEMENT MODULE TABLES
-- ============================================================================

-- Tenants table
CREATE TABLE IF NOT EXISTS management.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    identification_number VARCHAR(50), -- CNIC/Passport
    identification_type VARCHAR(50), -- cnic, passport
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    monthly_rent DECIMAL(15,2) NOT NULL,
    security_deposit DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive
    deactivated_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rent Records table
CREATE TABLE IF NOT EXISTS management.rent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES management.tenants(id) ON DELETE SET NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    amount_due DECIMAL(15,2) NOT NULL,
    amount_received DECIMAL(15,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'due', -- paid, partial, due
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(50), -- bank, cash, cheque, transfer
    transaction_reference VARCHAR(100),
    remarks TEXT,
    recorded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Requests table
CREATE TABLE IF NOT EXISTS management.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    request_type VARCHAR(100) NOT NULL, -- plumbing, electrical, general, hvac, painting, roofing, other
    description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, assigned, in_progress, completed
    reported_by VARCHAR(255),
    reporter_contact VARCHAR(100),
    assigned_to VARCHAR(255),
    assigned_to_name VARCHAR(255),
    assigned_at TIMESTAMP WITH TIME ZONE,
    estimated_cost DECIMAL(15,2),
    final_cost DECIMAL(15,2),
    completion_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    photos_before JSONB,
    photos_after JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Vault table
CREATE TABLE IF NOT EXISTS management.documents_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- ownership, lease, utility, tax, management, other
    doc_name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES management.documents_vault(id),
    access_status VARCHAR(50) DEFAULT 'active', -- active, archived
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs table (Immutable audit trail)
CREATE TABLE IF NOT EXISTS management.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- property, tenant, rent, maintenance, document, project
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- created, updated, deleted, status_changed, assigned, completed
    details JSONB,
    changed_by VARCHAR(255),
    changed_by_name VARCHAR(255),
    changed_by_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Managers table
CREATE TABLE IF NOT EXISTS management.property_managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive
    assigned_properties_count INTEGER DEFAULT 0,
    hire_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Manager Assignments table
CREATE TABLE IF NOT EXISTS management.property_manager_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES management.property_managers(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unassigned_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (property_id, manager_id, is_active)
);

-- Evaluators table
CREATE TABLE IF NOT EXISTS management.evaluators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    specialization VARCHAR(100), -- residential, commercial, agricultural, mixed
    status VARCHAR(50) DEFAULT 'active', -- active, inactive
    completed_evaluations INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluation Assignments table
CREATE TABLE IF NOT EXISTS management.evaluation_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id VARCHAR(255) NOT NULL,
    evaluator_id UUID REFERENCES management.evaluators(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'assigned', -- assigned, in_progress, completed, cancelled
    notes TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Development Projects indexes
CREATE INDEX IF NOT EXISTS idx_dev_projects_property_id ON management.development_projects(property_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON management.development_projects(project_status);
CREATE INDEX IF NOT EXISTS idx_dev_projects_landowner ON management.development_projects(landowner_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_created_at ON management.development_projects(created_at);

-- Feasibility Reports indexes
CREATE INDEX IF NOT EXISTS idx_feasibility_project_id ON management.feasibility_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_feasibility_status ON management.feasibility_reports(report_status);

-- Project Drawings indexes
CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON management.project_drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_drawings_type ON management.project_drawings(drawing_type);
CREATE INDEX IF NOT EXISTS idx_drawings_status ON management.project_drawings(approval_status);

-- Project Milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON management.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON management.project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON management.project_milestones(target_date);

-- Project Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON management.project_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON management.project_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON management.project_expenses(status);

-- Tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON management.tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON management.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_lease_end ON management.tenants(lease_end_date);

-- Rent Records indexes
CREATE INDEX IF NOT EXISTS idx_rent_property_id ON management.rent_records(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_tenant_id ON management.rent_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_month ON management.rent_records(month);
CREATE INDEX IF NOT EXISTS idx_rent_status ON management.rent_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_rent_due_date ON management.rent_records(due_date);

-- Maintenance Requests indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON management.maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON management.maintenance_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON management.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_urgency ON management.maintenance_requests(urgency);

-- Documents Vault indexes
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON management.documents_vault(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON management.documents_vault(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON management.documents_vault(access_status);

-- Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_entity ON management.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON management.activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_changed_by ON management.activity_logs(changed_by);

-- Property Manager indexes
CREATE INDEX IF NOT EXISTS idx_pm_assignments_property ON management.property_manager_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_assignments_manager ON management.property_manager_assignments(manager_id);
CREATE INDEX IF NOT EXISTS idx_pm_assignments_active ON management.property_manager_assignments(is_active);

-- Evaluator indexes
CREATE INDEX IF NOT EXISTS idx_eval_assignments_evaluator ON management.evaluation_assignments(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_eval_assignments_status ON management.evaluation_assignments(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to management tables
CREATE TRIGGER update_dev_projects_updated_at BEFORE UPDATE ON management.development_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feasibility_updated_at BEFORE UPDATE ON management.feasibility_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON management.project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON management.project_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financials_updated_at BEFORE UPDATE ON management.project_financials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON management.tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rent_records_updated_at BEFORE UPDATE ON management.rent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON management.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_managers_updated_at BEFORE UPDATE ON management.property_managers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluators_updated_at BEFORE UPDATE ON management.evaluators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Property Management Summary
CREATE OR REPLACE VIEW management.property_management_summary AS
SELECT
    p.id as property_id,
    p.title as property_title,
    p.location,
    p.status as property_status,
    COUNT(DISTINCT t.id) as tenant_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'active') as active_tenants,
    COALESCE(SUM(rr.amount_due), 0) as total_rent_due,
    COALESCE(SUM(rr.amount_received), 0) as total_rent_collected,
    COUNT(DISTINCT mr.id) as total_maintenance_requests,
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.status IN ('submitted', 'assigned', 'in_progress')) as open_maintenance,
    COUNT(DISTINCT dv.id) as document_count
FROM properties p
LEFT JOIN management.tenants t ON p.id = t.property_id
LEFT JOIN management.rent_records rr ON p.id = rr.property_id
LEFT JOIN management.maintenance_requests mr ON p.id = mr.property_id
LEFT JOIN management.documents_vault dv ON p.id = dv.property_id
GROUP BY p.id, p.title, p.location, p.status;

-- View: Development Project Overview
CREATE OR REPLACE VIEW management.development_project_overview AS
SELECT
    dp.id as project_id,
    dp.project_name,
    dp.location,
    dp.project_status,
    dp.total_budget,
    dp.funding_raised,
    CASE WHEN dp.total_budget > 0
        THEN ROUND((dp.funding_raised / dp.total_budget) * 100, 2)
        ELSE 0
    END as funding_percentage,
    dp.estimated_completion_date,
    COUNT(DISTINCT pm.id) as milestone_count,
    COUNT(DISTINCT pm.id) FILTER (WHERE pm.status = 'completed') as completed_milestones,
    COALESCE(SUM(pe.amount) FILTER (WHERE pe.status = 'paid'), 0) as total_expenses_paid,
    dp.created_at
FROM management.development_projects dp
LEFT JOIN management.project_milestones pm ON dp.id = pm.project_id
LEFT JOIN management.project_expenses pe ON dp.id = pe.project_id
GROUP BY dp.id;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA management TO remmic_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA management TO remmic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA management TO remmic_user;
GRANT SELECT ON management.property_management_summary TO remmic_user;
GRANT SELECT ON management.development_project_overview TO remmic_user;
