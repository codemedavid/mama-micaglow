-- FAQ Categories Table
CREATE TABLE faq_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Questions Table
CREATE TABLE faq_questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Tags Table (for better searchability)
CREATE TABLE faq_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#8b5cf6', -- Default purple color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Question Tags Junction Table
CREATE TABLE faq_question_tags (
    question_id INTEGER NOT NULL REFERENCES faq_questions(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES faq_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

-- FAQ Feedback Table (for user feedback on questions)
CREATE TABLE faq_feedback (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES faq_questions(id) ON DELETE CASCADE,
    user_id VARCHAR(255), -- Optional, for logged-in users
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'suggestion')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert FAQ Categories
INSERT INTO faq_categories (name, description, icon, sort_order) VALUES
('General Questions', 'Basic information about peptides and research protocols', '❓', 1),
('Dosing and Administration', 'Questions about proper dosing and administration methods', '💉', 2),
('Benefits and Effects', 'Information about peptide benefits and expected effects', '✨', 3),
('Side Effects and Contraindications', 'Safety information and contraindications', '⚠️', 4),
('Stacking and Combinations', 'Questions about combining different peptides', '🔗', 5),
('Safety and Precautions', 'Safety guidelines and precautionary measures', '🛡️', 6);

-- Insert FAQ Tags
INSERT INTO faq_tags (name, description, color) VALUES
('peptides', 'General peptide information', '#8b5cf6'),
('dosing', 'Dosing and administration questions', '#10b981'),
('safety', 'Safety and side effects', '#ef4444'),
('stacking', 'Peptide combinations and stacking', '#f59e0b'),
('research', 'Research protocols and guidelines', '#6366f1'),
('administration', 'Injection and administration methods', '#06b6d4'),
('contraindications', 'Medical contraindications', '#dc2626'),
('benefits', 'Peptide benefits and effects', '#059669'),
('side-effects', 'Potential side effects', '#dc2626'),
('protocols', 'Research protocols and procedures', '#7c3aed');

-- Insert FAQ Questions
INSERT INTO faq_questions (category_id, question, answer, sort_order) VALUES
-- General Questions
(1, 'What are peptides, and how are they used in research?', 'Peptides are short chains of amino acids researched for their potential effects on metabolism, tissue repair, anti-aging, neuroprotection, and more. The information provided is for laboratory and educational purposes only, compiled from clinical trials and research protocols as of September 25, 2025.', 1),
(1, 'Is this guide intended for human or veterinary use?', 'No, this guide is not intended for human or veterinary use unless prescribed by a licensed medical professional. It is for research purposes only.', 2),
(1, 'Where can I find instructions for preparing and injecting peptides?', 'Refer to the Prep & Injection Guide linked in the peptide dosing guide for proper reconstitution, syringe sizing, and injection protocols.', 3),

-- Dosing and Administration
(2, 'How should I dose Semaglutide for weight loss research?', 'For Semaglutide (3MG), mix with 0.6mL BAC water and dose once weekly subcutaneously, starting at 4 units (0.25mg) and increasing up to 40 units (2.5mg) over 4-week intervals.', 1),
(2, 'What is the typical dosing schedule for BPC-157 in tissue repair studies?', 'For BPC-157 (5MG), mix with 2mL BAC water and dose 250-500mcg (25-50 units) daily subcutaneously.', 2),
(2, 'How often should Retatrutide be administered?', 'Retatrutide (6MG) should be mixed with 1.2mL BAC water and dosed weekly subcutaneously, titrating from 20 units (1mg) over 4 weeks up to 120 units (6mg).', 3),

-- Benefits and Effects
(3, 'What are the benefits of using Ipamorelin in research?', 'Ipamorelin increases growth hormone for muscle growth, improves sleep, metabolism, and energy, based on research data.', 1),
(3, 'Can Melanotan 2 help with tanning?', 'Yes, Melanotan 2 promotes skin pigmentation for UV protection, as shown in research models.', 2),
(3, 'What does NAD+ do in anti-aging studies?', 'NAD+ enhances energy, DNA repair, and supports anti-aging and metabolic functions by boosting sirtuins and mitochondrial activity.', 3),

-- Side Effects and Contraindications
(4, 'What are common side effects of Tirzepatide?', 'Common side effects include nausea, vomiting, diarrhea, and injection site reactions, with rare risks like pancreatitis or thyroid tumors.', 1),
(4, 'Who should avoid using HGH Fragment 176-191?', 'Avoid use if hypersensitive, as it may cause mild head rush or injection pain.', 2),
(4, 'Are there contraindications for Thymosin Alpha-1?', 'Yes, avoid in cases of autoimmune disease due to its immune-enhancing effects.', 3),

-- Stacking and Combinations
(5, 'Can I stack Semaglutide with other peptides?', 'Yes, it can be stacked with Tirzepatide for enhanced weight loss, Cagrilintide for satiety, AOD-9604 for lipolysis, or BPC-157 to mitigate GI side effects.', 1),
(5, 'What peptides pair well with BPC-157 for repair?', 'BPC-157 stacks well with TB-500 for comprehensive healing and GHK-Cu for skin and connective tissue support.', 2),
(5, 'Is stacking Ipamorelin and CJC-1295 effective?', 'Yes, combining Ipamorelin with CJC-1295 (NO dac or With dac) provides synergistic growth hormone release.', 3),

-- Safety and Precautions
(6, 'What should I do if I experience side effects?', 'Discontinue use and consult research protocols or a professional, as side effects vary (e.g., nausea with Tirzepatide, flushing with NAD+).', 1),
(6, 'Are there peptides to avoid with certain conditions?', 'Yes, avoid EPO if you have cancer or cardiovascular disease, and avoid Dermorphin if sensitive to opioids due to respiratory depression risks.', 2),
(6, 'How often should I cycle peptides like Epitalon?', 'Epitalon (10MG) is dosed 5-10mg daily for 10-20 days, cycled twice a year.', 3);

-- Link questions to tags
INSERT INTO faq_question_tags (question_id, tag_id) VALUES
-- General Questions
(1, 1), (1, 5), (1, 10), -- peptides, research, protocols
(2, 1), (2, 5), -- peptides, research
(3, 6), (3, 10), -- administration, protocols

-- Dosing and Administration
(4, 2), (4, 6), (4, 1), -- dosing, administration, peptides
(5, 2), (5, 6), (5, 1), -- dosing, administration, peptides
(6, 2), (6, 6), (6, 1), -- dosing, administration, peptides

-- Benefits and Effects
(7, 8), (7, 1), (7, 5), -- benefits, peptides, research
(8, 8), (8, 1), (8, 5), -- benefits, peptides, research
(9, 8), (9, 1), (9, 5), -- benefits, peptides, research

-- Side Effects and Contraindications
(10, 3), (10, 9), (10, 1), -- safety, side-effects, peptides
(11, 3), (11, 7), (11, 1), -- safety, contraindications, peptides
(12, 3), (12, 7), (12, 1), -- safety, contraindications, peptides

-- Stacking and Combinations
(13, 4), (13, 1), (13, 5), -- stacking, peptides, research
(14, 4), (14, 1), (14, 5), -- stacking, peptides, research
(15, 4), (15, 1), (15, 5), -- stacking, peptides, research

-- Safety and Precautions
(16, 3), (16, 9), (16, 1), -- safety, side-effects, peptides
(17, 3), (17, 7), (17, 1), -- safety, contraindications, peptides
(18, 2), (18, 1), (18, 5); -- dosing, peptides, research

-- Create indexes for better performance
CREATE INDEX idx_faq_questions_category_id ON faq_questions(category_id);
CREATE INDEX idx_faq_questions_active ON faq_questions(is_active);
CREATE INDEX idx_faq_questions_sort_order ON faq_questions(sort_order);
CREATE INDEX idx_faq_categories_active ON faq_categories(is_active);
CREATE INDEX idx_faq_categories_sort_order ON faq_categories(sort_order);
CREATE INDEX idx_faq_feedback_question_id ON faq_feedback(question_id);
CREATE INDEX idx_faq_feedback_type ON faq_feedback(feedback_type);
CREATE INDEX idx_faq_question_tags_question_id ON faq_question_tags(question_id);
CREATE INDEX idx_faq_question_tags_tag_id ON faq_question_tags(tag_id);

-- Create a view for easy FAQ retrieval with category information
CREATE VIEW faq_with_categories AS
SELECT 
    q.id,
    q.question,
    q.answer,
    q.sort_order as question_sort_order,
    q.is_active as question_active,
    q.view_count,
    q.helpful_count,
    q.created_at as question_created_at,
    q.updated_at as question_updated_at,
    c.id as category_id,
    c.name as category_name,
    c.description as category_description,
    c.icon as category_icon,
    c.sort_order as category_sort_order,
    c.is_active as category_active
FROM faq_questions q
JOIN faq_categories c ON q.category_id = c.id
WHERE q.is_active = true AND c.is_active = true
ORDER BY c.sort_order, q.sort_order;

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION increment_faq_view_count(question_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE faq_questions 
    SET view_count = view_count + 1 
    WHERE id = question_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to record feedback
CREATE OR REPLACE FUNCTION record_faq_feedback(
    question_id_param INTEGER,
    user_id_param VARCHAR(255),
    feedback_type_param VARCHAR(20),
    comment_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO faq_feedback (question_id, user_id, feedback_type, comment)
    VALUES (question_id_param, user_id_param, feedback_type_param, comment_param);
    
    -- Update helpful count if feedback is helpful
    IF feedback_type_param = 'helpful' THEN
        UPDATE faq_questions 
        SET helpful_count = helpful_count + 1 
        WHERE id = question_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql;
