export type Peptide = {
  id: string;
  name: string;
  category: string;
  mechanism: string;
  benefits: string[];
  sideEffects: string[];
  contraindications: string[];
  dosing: {
    vialSize: string;
    reconstitution: string;
    frequency: string;
    subcutaneous: string;
    notes?: string;
  }[];
  stacking: string[];
  icon: string;
  description: string;
  halfLife?: string;
  storage?: string;
};

export const peptides: Peptide[] = [
  // Weight Loss & Metabolic Peptides
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    category: 'Weight Loss & Metabolic',
    description: 'A GLP-1 receptor agonist originally developed for type 2 diabetes management but widely researched for obesity due to its potent appetite suppression and metabolic effects.',
    mechanism: 'GLP-1 receptor agonist that suppresses appetite via hypothalamic signaling, slows gastric emptying, and promotes insulin release while inhibiting glucagon.',
    halfLife: '7 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Average weight loss of 15-20% over 68 weeks in trials',
      'Improves glycemic control and cardiovascular risk factors',
      'Enhances satiety and reduces cravings',
      'Supports fat oxidation and insulin sensitivity',
    ],
    sideEffects: [
      'Injection site reactions (redness, swelling)',
      'Nausea, vomiting, diarrhea, constipation',
      'Fatigue, abdominal pain, decreased appetite',
      'Rare: Pancreatitis, gallbladder disease, thyroid tumors',
    ],
    contraindications: [
      'Do not use if pregnant, breastfeeding, or history of medullary thyroid carcinoma/MEN 2',
      'Avoid in type 1 diabetes, severe GI disease, or hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '3MG',
        reconstitution: 'Mix with 0.6mL (60 units) BAC water',
        frequency: 'Dose once weekly subcutaneously. Stay 4 weeks per dose before increasing',
        subcutaneous: '4 units = 0.25mg; 8 units = 0.5mg; 12 units = 0.75mg; 16 units = 1mg; 24 units = 1.5mg; 32 units = 2mg; 40 units = 2.5mg',
      },
      {
        vialSize: '6MG',
        reconstitution: 'Mix with 1.2mL (120 units) BAC water',
        frequency: 'Dose once weekly subcutaneously',
        subcutaneous: '8 units = 0.5mg; 16 units = 1mg; 24 units = 1.5mg; 32 units = 2mg; 40 units = 2.5mg; 48 units = 3mg',
      },
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL (200 units) BAC water',
        frequency: 'Dose once weekly subcutaneously',
        subcutaneous: '10 units = 0.5mg; 20 units = 1mg; 30 units = 1.5mg; 40 units = 2mg; 50 units = 2.5mg; 60 units = 3mg',
      },
    ],
    stacking: [
      'Tirzepatide: Dual GLP-1/GIP for enhanced weight loss',
      'Cagrilintide: Amylin analog for amplified satiety',
      'AOD-9604: Boosts lipolysis',
      'BPC-157: Mitigates GI side effects',
    ],
    icon: '💊',
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'Weight Loss & Metabolic',
    description: 'A dual agonist of the GLP-1 and GIP receptors originally developed to treat Type-2 diabetes but has since become a leading anti-obesity medication.',
    mechanism: 'Dual agonist of GLP-1 and GIP receptors. GLP-1 suppresses appetite and increases feelings of fullness. GIP promotes insulin secretion and supports energy balance.',
    halfLife: '5 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Average weight loss of 24.7% after 72 weeks',
      'Reduces appetite and cravings',
      'Enhances satiety and energy balance',
      'Supports fat oxidation and metabolism',
      'Improves insulin sensitivity and blood sugar control',
    ],
    sideEffects: [
      'Injection site reaction (redness, swelling, itching)',
      'Nausea, vomiting, diarrhea, constipation',
      'Decreased appetite, fatigue, dyspepsia',
      'Abdominal pain, burping (may have sulfur smell)',
      'Hair loss',
      'Rare: Thyroid C-Cell Tumors, Pancreatitis, Gastroparesis',
    ],
    contraindications: [
      'Do not use if pregnant or breastfeeding',
      'Do not use with personal or family history of Medullary Thyroid Carcinoma or MEN 2',
      'Do not use if you have Type-1 diabetes, diabetic retinopathy, or severe GI disease',
      'Do not use if allergic or hypersensitive to Tirzepatide',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 0.5mL (or 50 units) of BAC water',
        frequency: 'Dose 1 day of each week (once every 7 days), always on the same day of the week. Stay on each dose for a minimum of 4 weeks before raising',
        subcutaneous: '12 units = 2.5mg; 25 units = 5mg; 38 units = 7.5mg; 50 units = 10mg',
        notes: 'Those transferring from another GLP peptide should start at 5mg, NOT 2.5mg',
      },
      {
        vialSize: '30MG',
        reconstitution: 'Mix with 1.5mL (or 150 units) of BAC water',
        frequency: 'Dose 1 day of each week (once every 7 days), always on the same day of the week. Stay on each dose for a minimum of 4 weeks before increasing',
        subcutaneous: '12 units = 2.5mg; 25 units = 5mg; 38 units = 7.5mg; 50 units = 10mg; 63 units = 12.5mg; 75 units = 15mg',
        notes: 'Those transferring from another GLP peptide should start at 5mg, NOT 2.5mg',
      },
    ],
    stacking: [
      'AOD-9604: enhances fat breakdown and further accelerates weight loss',
      'Tesamorelin: synergistic for fat reduction, especially visceral fat',
      'Semax or Selank: manage mood and cognitive function',
      'NAD+ or MOTS-C: support energy and mitochondrial efficiency',
      'BPC-157: beneficial for gut repair if experiencing GI discomfort',
      'CJC-1295 / Ipamorelin: for muscle maintenance and enhanced metabolic recovery',
    ],
    icon: '💊',
  },
  {
    id: 'retatrutide',
    name: 'Retatrutide',
    category: 'Weight Loss & Metabolic',
    description: 'A powerful triple agonist peptide that targets GLP-1, GIP, and glucagon receptors—making it the most comprehensive metabolic peptide in its class.',
    mechanism: 'Triple agonist peptide targeting GLP-1, GIP, and glucagon receptors. GLP-1 suppresses appetite and enhances satiety. GIP boosts insulin secretion and fat metabolism. Glucagon increases energy expenditure and hepatic fat oxidation.',
    halfLife: '6 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Superior weight loss (up to 24% in 48 weeks)',
      'Improves glycemic control and liver fat reduction',
      'Enhances metabolic rate and cardiovascular health',
      'Rapid and sustained fat loss',
    ],
    sideEffects: [
      'Gastrointestinal issues (nausea, diarrhea)',
      'Injection site reactions',
      'Fatigue, mild heart rate increase',
      'Rare: Pancreatitis, thyroid concerns',
    ],
    contraindications: [
      'Avoid in pregnancy, breastfeeding, or thyroid cancer history',
      'Not for type 1 diabetes or severe GI disorders',
      'Hypersensitivity to components',
    ],
    dosing: [
      {
        vialSize: '6MG',
        reconstitution: 'Mix with 1.2mL (120 units) BAC water',
        frequency: 'Dose weekly subcutaneously, titrate from 1mg over 4 weeks',
        subcutaneous: '20 units = 1mg; 40 units = 2mg; 60 units = 3mg; 80 units = 4mg; 100 units = 5mg; 120 units = 6mg',
      },
      {
        vialSize: '12MG',
        reconstitution: 'Mix with 2.4mL (240 units) BAC water',
        frequency: 'Dose weekly subcutaneously',
        subcutaneous: '40 units = 2mg; 80 units = 4mg; 120 units = 6mg; 160 units = 8mg; 200 units = 10mg; 240 units = 12mg',
      },
      {
        vialSize: '16MG',
        reconstitution: 'Mix with 3.2mL (320 units) BAC water',
        frequency: 'Dose weekly subcutaneously',
        subcutaneous: '40 units = 2mg; 80 units = 4mg; 120 units = 6mg; 160 units = 8mg; 200 units = 10mg; 240 units = 12mg; 280 units = 14mg; 320 units = 16mg',
      },
    ],
    stacking: [
      'Semaglutide: For dual GLP-1 enhancement',
      'Glutathione: For detox support and liver optimization',
      'LIPO-C: To enhance energy and fat breakdown',
      'BPC-157: Gut protection from GI effects',
    ],
    icon: '💊',
  },
  // Tissue Repair & Healing Peptides
  {
    id: 'bpc157',
    name: 'BPC-157',
    category: 'Tissue Repair & Healing',
    description: 'A synthetic peptide derived from a protein in human gastric juice, researched for its regenerative effects on tissues throughout the body.',
    mechanism: 'Synthetic peptide derived from a protein in human gastric juice. Upregulates growth factors, enhances angiogenesis, and protects GI mucosa.',
    halfLife: '4-6 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Accelerates tendon, ligament, muscle, and GI healing',
      'Reduces inflammation',
      'Systemic repair support',
    ],
    sideEffects: [
      'Minimal; possible injection site reactions',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 2mL (200 units) BAC water',
        frequency: 'Dose daily subcutaneously',
        subcutaneous: '250-500mcg (25-50 units) daily',
      },
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 4mL (400 units) BAC water',
        frequency: 'Dose daily subcutaneously',
        subcutaneous: '250-500mcg (10-20 units) daily',
      },
    ],
    stacking: [
      'TB-500: Synergistic repair',
      'GHK-Cu: Skin and connective tissue',
    ],
    icon: '🩹',
  },
  {
    id: 'tb500',
    name: 'TB-500',
    category: 'Tissue Repair & Healing',
    description: 'A synthetic version of Thymosin Beta-4, a peptide involved in actin regulation for tissue repair and healing.',
    mechanism: 'Synthetic version of Thymosin Beta-4, a peptide involved in actin regulation for tissue repair. Promotes actin polymerization for cell migration, angiogenesis, and anti-inflammatory effects.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Accelerates muscle, tendon, and wound healing',
      'Improves flexibility and reduces scarring',
      'Enhances recovery',
    ],
    sideEffects: [
      'Headaches, nausea, injection site reactions',
    ],
    contraindications: [
      'Cancer history (angiogenesis risk)',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 1mL (100 units) BAC water',
        frequency: 'Loading: 4-8mg/week divided 2-3x; maintenance: 2-6mg/week',
        subcutaneous: 'Loading: 4-8mg/week divided 2-3x; maintenance: 2-6mg/week',
      },
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 2.5mL (250 units) BAC water',
        frequency: 'Loading: 4-8mg/week divided 2-3x',
        subcutaneous: 'Loading: 4-8mg/week (8-16 units 2x/week)',
      },
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 5mL (500 units) BAC water',
        frequency: 'Loading: 4-8mg/week divided 2-3x',
        subcutaneous: 'Loading: 4-8mg/week (4-8 units 2x/week)',
      },
    ],
    stacking: [
      'BPC-157: Comprehensive healing',
      'GHK-Cu: Collagen support',
    ],
    icon: '🩹',
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    category: 'Tissue Repair & Healing',
    description: 'A selective growth hormone secretagogue and ghrelin receptor agonist, promoting GH release without cortisol/prolactin spikes.',
    mechanism: 'Selective growth hormone secretagogue and ghrelin receptor agonist, promoting GH release without cortisol/prolactin spikes.',
    halfLife: '2 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Increases GH for muscle growth and recovery',
      'Improves sleep and metabolism',
      'Enhances energy',
    ],
    sideEffects: [
      'Mild hunger, flushing',
      'Injection site reactions',
    ],
    contraindications: [
      'Hypersensitivity, active malignancy',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 0.4mL (40 units) BAC water',
        frequency: 'Dose nightly subcutaneously, 5 days/week',
        subcutaneous: '100-300mcg (5-15 units) nightly',
      },
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL (100 units) BAC water',
        frequency: 'Dose nightly subcutaneously, 5 days/week',
        subcutaneous: '100-300mcg (2-6 units) nightly',
      },
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL (200 units) BAC water',
        frequency: 'Dose nightly subcutaneously, 5 days/week',
        subcutaneous: '100-300mcg (2-6 units) nightly',
      },
    ],
    stacking: [
      'CJC-1295: Synergistic GH release',
      'Tesamorelin: Fat reduction',
    ],
    icon: '🩹',
  },
  {
    id: 'cjc1295',
    name: 'CJC-1295 With DAC',
    category: 'Tissue Repair & Healing',
    description: 'A long-acting growth hormone-releasing hormone (GHRH) analog, designed to extend the half-life of GH stimulation compared to its non-DAC counterpart.',
    mechanism: 'Long-acting growth hormone-releasing hormone (GHRH) analog, designed to extend the half-life of GH stimulation via albumin binding.',
    halfLife: '7-8 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Sustained GH/IGF-1 increase for muscle growth and fat loss',
      'Improves recovery, sleep, and metabolism',
      'Long-term anabolic effects',
    ],
    sideEffects: [
      'Injection site reactions, water retention',
      'Headaches, flushing, mild hypoglycemia',
    ],
    contraindications: [
      'Active malignancy, hypersensitivity, pituitary disorders',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 0.5mL (50 units) BAC water',
        frequency: 'Dose once or twice weekly subcutaneously',
        subcutaneous: '1-2mg (50-100 units) once or twice weekly',
      },
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1.25mL (125 units) BAC water',
        frequency: 'Dose once or twice weekly subcutaneously',
        subcutaneous: '1-2mg (25-50 units) once or twice weekly',
      },
    ],
    stacking: [
      'Ipamorelin: Synergistic GH pulse',
      'Tesamorelin: Fat reduction',
      'BPC-157: Tissue repair support',
    ],
    icon: '🩹',
  },
  // Anti-Aging & Longevity Peptides
  {
    id: 'ghkcu',
    name: 'GHK-Cu (Copper Tripeptide)',
    category: 'Anti-Aging & Longevity',
    description: 'A copper-binding peptide found in human plasma, researched for anti-aging and regeneration properties.',
    mechanism: 'Copper-binding peptide found in human plasma. Binds copper to stimulate collagen/elastin, reduce oxidative stress, and promote healing.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Wound healing, collagen production',
      'Anti-inflammatory, skin elasticity improvement',
      'Tissue remodeling',
    ],
    sideEffects: [
      'Injection pain, copper sensitivity',
    ],
    contraindications: [
      'Copper allergy',
    ],
    dosing: [
      {
        vialSize: '50MG',
        reconstitution: 'Mix with 5mL (500 units) BAC water',
        frequency: 'Dose daily subcutaneously or topical',
        subcutaneous: '1-2mg (10-20 units) daily subcutaneously or topical',
      },
      {
        vialSize: '200MG (TOPICAL)',
        reconstitution: 'Mix as cream',
        frequency: 'Apply daily',
        subcutaneous: 'Apply daily',
      },
    ],
    stacking: [
      'BPC-157/TB-500: Repair synergy',
      'Glow blend: Anti-aging',
    ],
    icon: '✨',
  },
  {
    id: 'epitalon',
    name: 'Epitalon',
    category: 'Anti-Aging & Longevity',
    description: 'A synthetic tetrapeptide that activates telomerase for longevity research and cellular health.',
    mechanism: 'Synthetic tetrapeptide that activates telomerase for longevity research. Stimulates telomerase to elongate telomeres, enhancing cellular longevity.',
    halfLife: '30 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Telomere lengthening',
      'Antioxidant defense, anti-aging effects',
    ],
    sideEffects: [
      'Minimal reported',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose daily subcutaneously for 10-20 days, cycle 2x/year',
        subcutaneous: '5-10mg daily subcutaneously for 10-20 days, cycle 2x/year',
      },
      {
        vialSize: '50MG',
        reconstitution: 'Mix with 10mL BAC water',
        frequency: 'Dose daily subcutaneously for 10-20 days, cycle 2x/year',
        subcutaneous: '5-10mg (1-2 units) daily',
      },
    ],
    stacking: [
      'GHK-Cu: Anti-aging synergy',
      'NAD+: Cellular energy',
    ],
    icon: '✨',
  },
  {
    id: 'nad',
    name: 'NAD+',
    category: 'Anti-Aging & Longevity',
    description: 'A coenzyme for cellular energy and DNA repair in anti-aging research, essential for mitochondrial function.',
    mechanism: 'Coenzyme for cellular energy and DNA repair in anti-aging research. Boosts sirtuins and mitochondrial function for longevity pathways.',
    halfLife: '1-2 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Enhances energy, DNA repair',
      'Anti-aging, metabolic support',
    ],
    sideEffects: [
      'Flushing, nausea at high doses',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '100MG',
        reconstitution: 'Mix with 10mL saline for IV or 1mL BAC for subcutaneous',
        frequency: 'Dose 1-3x/week IV/subcutaneous',
        subcutaneous: '100-500mg 1-3x/week IV/subcutaneous',
      },
      {
        vialSize: '500MG',
        reconstitution: 'Mix with 50mL saline for IV',
        frequency: 'Dose per session',
        subcutaneous: '100-500mg per session',
      },
    ],
    stacking: [
      'Glutathione: Antioxidant synergy',
      'Epitalon: Longevity',
    ],
    icon: '✨',
  },
  // Neuroprotection & Cognitive Peptides
  {
    id: 'semax',
    name: 'Semax',
    category: 'Neuroprotection & Cognitive',
    description: 'An ACTH analog for neuroprotection and cognition enhancement, researched for its neuroprotective properties.',
    mechanism: 'ACTH analog for neuroprotection and cognition. Upregulates BDNF/NGF, enhances dopamine/serotonin.',
    halfLife: '20-30 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves memory, learning',
      'Stress resilience, neuroprotection',
    ],
    sideEffects: [
      'Nasal irritation',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '30MG (NASAL)',
        reconstitution: 'Mix for nasal spray',
        frequency: 'Dose daily intranasal',
        subcutaneous: '200-600mcg/day intranasal',
      },
    ],
    stacking: [
      'Selank: Mood/cognition',
      'Cerebrolysin: Brain repair',
    ],
    icon: '🧠',
  },
  {
    id: 'selank',
    name: 'Selank',
    category: 'Neuroprotection & Cognitive',
    description: 'A synthetic tuftsin analog for anxiety and cognitive enhancement, researched for its anxiolytic properties.',
    mechanism: 'Synthetic tuftsin analog for anxiety and cognitive enhancement. Modulates GABA/serotonin, enhances BDNF.',
    halfLife: '30-40 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Reduces anxiety without sedation',
      'Improves cognition, stress resilience',
    ],
    sideEffects: [
      'Nasal irritation (intranasal)',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL for nasal spray or BAC for subcutaneous',
        frequency: 'Dose daily intranasal or subcutaneous',
        subcutaneous: '200-600mcg/day intranasal or subcutaneous',
      },
    ],
    stacking: [
      'Semax: Cognitive synergy',
      'Cerebrolysin: Neuroprotection',
    ],
    icon: '🧠',
  },
  {
    id: 'mazdutide',
    name: 'Mazdutide',
    category: 'Weight Loss & Metabolic',
    description: 'A dual agonist of the GLP-1 and glucagon receptors, originally designed to treat type 2 diabetes and obesity with minimal side effects.',
    mechanism: 'GLP-1: Suppresses appetite, enhances satiety. Glucagon: Boosts energy expenditure and fat oxidation.',
    halfLife: '5-7 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Significant weight loss and calorie burning',
      'Improves glycemic control',
      'Metabolic boost with low GI impact',
    ],
    sideEffects: [
      'Mild nausea, GI upset',
      'Injection site reactions',
    ],
    contraindications: [
      'Pregnancy, hypersensitivity, severe GI disease',
    ],
    dosing: [
      {
        vialSize: '9MG',
        reconstitution: 'Mix with 1.8mL (180 units) BAC water',
        frequency: 'Dose weekly subcutaneously, minimum 4 weeks per level',
        subcutaneous: '20 units = 1mg; 30 units = 1.5mg; 45 units = 2.25mg; 60 units = 3mg; 90 units = 4.5mg; 120 units = 6mg; 180 units = 9mg',
      },
    ],
    stacking: [
      'AOD-9604: Enhances fat breakdown',
      'BPC-157: GI support',
    ],
    icon: '💊',
  },
  {
    id: 'cagrilintide',
    name: 'Cagrilintide',
    category: 'Weight Loss & Metabolic',
    description: 'A long-acting amylin analog peptide for appetite suppression and weight management, often combined with GLP-1 agonists.',
    mechanism: 'Mimics amylin to slow gastric emptying, reduce appetite, and enhance satiety signaling in the brain.',
    halfLife: '6-8 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Amplifies weight loss (up to 10.8% in 26 weeks)',
      'Reduces food intake and supports sustained management',
      'Improves glycemic balance when stacked',
    ],
    sideEffects: [
      'Nausea, bloating, injection site reactions',
      'Constipation or mild GI discomfort',
    ],
    contraindications: [
      'Severe GI disease, pregnancy, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL (100 units) BAC water',
        frequency: 'Dose weekly subcutaneously, titrate slowly',
        subcutaneous: '20 units = 1mg; 40 units = 2mg; 60 units = 3mg; 80 units = 4mg; 100 units = 5mg',
      },
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL (200 units) BAC water',
        frequency: 'Dose weekly subcutaneously',
        subcutaneous: '40 units = 2mg; 80 units = 4mg; 120 units = 6mg; 160 units = 8mg; 200 units = 10mg',
      },
    ],
    stacking: [
      'Semaglutide/Tirzepatide: Synergistic weight loss (CagriSema combo)',
      'BPC-157: Mitigates GI effects',
    ],
    icon: '💊',
  },
  {
    id: 'survodutide',
    name: 'Survodutide',
    category: 'Weight Loss & Metabolic',
    description: 'A dual GLP-1/glucagon agonist for diabetes and obesity research, similar to Mazdutide.',
    mechanism: 'GLP-1: Reduces appetite, enhances satiety. Glucagon: Promotes fat oxidation and energy expenditure.',
    halfLife: '5-6 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Weight management and glycemic control',
      'Enhances metabolic rate',
      'Liver fat reduction',
    ],
    sideEffects: [
      'Nausea, vomiting, injection site reactions',
    ],
    contraindications: [
      'Pregnancy, hypersensitivity, severe GI issues',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL (200 units) BAC water',
        frequency: 'Start at 24 units (1.2mg) weekly; stay 4 weeks before increasing',
        subcutaneous: '24 units = 1.2mg; 48 units = 2.4mg; 72 units = 3.6mg; 96 units = 4.8mg; 120 units = 6mg; 200 units = 10mg',
      },
    ],
    stacking: [
      'AOD-9604: Fat loss synergy',
      'BPC-157: GI health',
    ],
    icon: '💊',
  },
  {
    id: 'lemonbottle',
    name: 'Lemon Bottle',
    category: 'Weight Loss & Metabolic',
    description: 'A proprietary fat-dissolving solution with riboflavin, lecithin, and bromelain for targeted fat elimination.',
    mechanism: 'Disrupts adipocyte membranes to release and metabolize fat locally.',
    benefits: [
      'Non-surgical fat reduction in targeted areas',
      'Body contouring',
    ],
    sideEffects: [
      'Swelling, bruising, mild discomfort',
    ],
    contraindications: [
      'Hypersensitivity to ingredients',
    ],
    dosing: [
      {
        vialSize: 'STANDARD VIAL',
        reconstitution: 'No reconstitution needed; inject 0.2-0.5mL per site, 1-3 sessions spaced 1 week apart',
        frequency: '1-3 sessions spaced 1 week apart',
        subcutaneous: 'Inject 0.2-0.5mL per site',
      },
    ],
    stacking: [
      'Tirzepatide: Overall fat loss enhancement',
    ],
    icon: '💊',
  },
  {
    id: 'amino1mq',
    name: '5-Amino-1MQ',
    category: 'Weight Loss & Metabolic',
    description: 'A small molecule NNMT inhibitor to boost metabolism and NAD+ levels.',
    mechanism: 'Inhibits NNMT to increase NAD+, enhancing fat oxidation and mitochondrial function.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Fat loss and muscle preservation',
      'Metabolic efficiency',
      'Energy expenditure increase',
    ],
    sideEffects: [
      'Mild GI upset',
    ],
    contraindications: [
      'Pregnancy, cardiovascular/liver/kidney issues, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '50MG',
        reconstitution: 'Oral capsules or mix with 1mL BAC water for subcutaneous',
        frequency: 'Dose 50-150mg/day, 8-12 week cycles',
        subcutaneous: '50-150mg/day oral or subcutaneous',
      },
    ],
    stacking: [
      'Tirzepatide: Fat loss synergy',
      'NAD+: Metabolic boost',
    ],
    icon: '💊',
  },
  {
    id: 'adipotide',
    name: 'Adipotide',
    category: 'Weight Loss & Metabolic',
    description: 'A peptidomimetic that targets white fat cells for obesity research.',
    mechanism: 'Binds to prohibitin on blood vessels supplying white adipose tissue, inducing apoptosis.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Selective white fat reduction',
      'Potential for rapid weight loss in models',
    ],
    sideEffects: [
      'Kidney toxicity, dehydration',
      'Injection site pain',
    ],
    contraindications: [
      'Renal impairment, pregnancy',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 0.25mg/kg 5 days/week subcutaneously',
        subcutaneous: '0.25mg/kg 5 days/week subcutaneously',
      },
    ],
    stacking: [
      'AOD-9604: Fat targeting',
      'BPC-157: Organ protection',
    ],
    icon: '💊',
  },
  // Tissue Repair & Healing Peptides (continued)
  {
    id: 'hcg',
    name: 'HCG (Human Chorionic Gonadotropin)',
    category: 'Reproductive & Hormone',
    description: 'A glycoprotein hormone mimicking LH for fertility and hormone research.',
    mechanism: 'Stimulates Leydig cells for testosterone production and gonadal function.',
    halfLife: '24-36 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Maintains testicular function in cycles',
      'Supports fertility and hormone balance',
    ],
    sideEffects: [
      'Gynecomastia, water retention',
      'Injection site pain',
    ],
    contraindications: [
      'Prostate issues, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5000IU',
        reconstitution: 'Mix with 5mL BAC water',
        frequency: 'Dose 500-2000IU 2-3x/week subcutaneously or IM',
        subcutaneous: '500-2000IU 2-3x/week subcutaneously or IM',
      },
    ],
    stacking: [
      'Kisspeptin: Reproductive synergy',
      'Tesamorelin: Hormonal balance',
    ],
    icon: '❤️',
  },
  {
    id: 'pt141',
    name: 'PT-141 (Bremelanotide)',
    category: 'Reproductive & Hormone',
    description: 'A melanocortin agonist for sexual dysfunction research.',
    mechanism: 'Activates MC4R in the CNS to enhance arousal and libido.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves sexual desire and performance',
      'Potential for erectile dysfunction',
    ],
    sideEffects: [
      'Nausea, flushing, headache',
      'Hyperpigmentation with chronic use',
    ],
    contraindications: [
      'Cardiovascular disease, pregnancy',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 1-2mg (10-20 units) subcutaneously as needed, 45 min before activity',
        subcutaneous: '1-2mg (10-20 units) subcutaneously as needed, 45 min before activity',
      },
    ],
    stacking: [
      'Melanotan 2: Libido enhancement',
      'Kisspeptin: Reproductive support',
    ],
    icon: '❤️',
  },
  {
    id: 'klow',
    name: 'KLOW (Multi-Peptide Repair Blend)',
    category: 'Tissue Repair & Healing',
    description: 'A blend of 50mg GHK-Cu, 10mg TB-500, 10mg BPC-157, and 10mg KPV for comprehensive repair.',
    mechanism: 'GHK-Cu/TB-500/BPC-157: Tissue repair and angiogenesis. KPV: Anti-inflammatory.',
    halfLife: '4-6 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Inflammation control, collagen synthesis',
      'Skin/hair quality, GI integrity',
      'Broad repair',
    ],
    sideEffects: [
      'Injection site reactions',
    ],
    contraindications: [
      'Copper sensitivity',
    ],
    dosing: [
      {
        vialSize: '80MG',
        reconstitution: 'Mix with 4mL (400 units) BAC water',
        frequency: 'Dose 8-10 units daily subcutaneously, 6 weeks on/6 off',
        subcutaneous: '8-10 units daily subcutaneously, 6 weeks on/6 off',
      },
    ],
    stacking: [
      'NAD+: Cellular repair',
      'Selank: Cognitive recovery',
    ],
    icon: '🩹',
  },
  {
    id: 'glow',
    name: 'GLOW (Multi-Peptide Blend)',
    category: 'Anti-Aging & Longevity',
    description: 'A blend of 50mg GHK-Cu, 10mg BPC-157, and 10mg TB-500 for anti-aging and skin rejuvenation.',
    mechanism: 'GHK-Cu: Collagen production. BPC-157/TB-500: Repair and angiogenesis.',
    halfLife: '4-6 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves skin elasticity and hydration',
      'Reverses thinning, stimulates elastin',
    ],
    sideEffects: [
      'Copper sensitivity reactions',
    ],
    contraindications: [
      'Copper allergy',
    ],
    dosing: [
      {
        vialSize: '70MG',
        reconstitution: 'Mix with 3mL (300 units) BAC water',
        frequency: 'Dose 7 days/week subcutaneously, 6 weeks on/6 off; dilute with 20-30 units BAC',
        subcutaneous: '7 days/week subcutaneously, 6 weeks on/6 off; dilute with 20-30 units BAC',
      },
    ],
    stacking: [
      'Epitalon: Telomere support',
      'NAD+: Energy enhancement',
    ],
    icon: '✨',
  },
  {
    id: 'lipoc',
    name: 'Lipo-C with Vitamins B12',
    category: 'Weight Loss & Metabolic',
    description: 'A blend of methionine, inositol, choline, L-carnitine, and B vitamins for fat metabolism research.',
    mechanism: 'Lipotropics aid fat transport and breakdown. Carnitine shuttles fatty acids to mitochondria.',
    benefits: [
      'Supports fat metabolism and energy',
      'Detoxification and vascular function',
    ],
    sideEffects: [
      'Mild GI upset, injection pain',
    ],
    contraindications: [
      'Liver disease, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: 'STANDARD VIAL',
        reconstitution: 'No reconstitution; dose 1-2mL IM weekly',
        frequency: 'Dose 1-2mL IM weekly',
        subcutaneous: '1-2mL IM weekly',
      },
    ],
    stacking: [
      'Retatrutide: Metabolic synergy',
    ],
    icon: '💊',
  },
  {
    id: 'lcarnitine',
    name: 'L-Carnitine',
    category: 'Weight Loss & Metabolic',
    description: 'An amino acid derivative for fatty acid transport in energy production.',
    mechanism: 'Transports long-chain fatty acids into mitochondria for β-oxidation.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Enhances fat burning and endurance',
      'Reduces fatigue, supports recovery',
    ],
    sideEffects: [
      'Nausea, diarrhea at high doses',
    ],
    contraindications: [
      'Seizure disorders, hypothyroidism',
    ],
    dosing: [
      {
        vialSize: '500MG',
        reconstitution: 'Mix with 5mL BAC water',
        frequency: 'Dose 500-2000mg daily IM or oral',
        subcutaneous: '500-2000mg daily IM or oral',
      },
    ],
    stacking: [
      'AOD-9604: Fat loss',
      'Ipamorelin: Recovery',
    ],
    icon: '💊',
  },
  // Other Peptides
  {
    id: 'aod9604',
    name: 'AOD-9604',
    category: 'Weight Loss & Metabolic',
    description: 'A fragment of human growth hormone designed for obesity research, targeting fat metabolism without affecting blood sugar.',
    mechanism: 'Fragment of human growth hormone designed for obesity research, targeting fat metabolism without affecting blood sugar. Mimics HGH\'s fat-burning portion to promote lipolysis and inhibit lipogenesis.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Promotes fat metabolism',
      'Preserves lean muscle',
      'No impact on blood glucose',
    ],
    sideEffects: [
      'Mild injection site reactions',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL (100 units) BAC water',
        frequency: 'Dose daily subcutaneously, 5 days/week with 2 rest days',
        subcutaneous: '300mcg (3 units) daily subcutaneously, 5 days/week with 2 rest days. Inject post-wakeup; fast 1 hour after',
      },
    ],
    stacking: [
      'Tirzepatide/Semaglutide: Enhanced fat loss',
      'BPC-157: GI support',
    ],
    icon: '💊',
  },
  {
    id: 'melanotan2',
    name: 'Melanotan 2 Acetate',
    category: 'Other',
    description: 'A synthetic analog of alpha-melanocyte-stimulating hormone (α-MSH), researched for skin tanning and potential libido enhancement.',
    mechanism: 'Synthetic analog of alpha-melanocyte-stimulating hormone (α-MSH), researched for skin tanning and potential libido enhancement via melanocortin receptor activation.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Promotes skin pigmentation for UV protection',
      'Enhances libido and erectile function in research models',
      'Potential appetite suppression',
    ],
    sideEffects: [
      'Nausea, flushing, spontaneous erections',
      'Increased moles or freckles',
      'Rare: Priapism, renal effects',
    ],
    contraindications: [
      'Avoid in pregnancy or hypersensitivity',
      'Not for those with skin cancer history',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL (200 units) BAC water',
        frequency: 'Dose subcutaneously, start low for tolerance',
        subcutaneous: '5 units = 0.25mg; 10 units = 0.5mg (loading: 0.25mg/day for 1-2 weeks; maintenance: 0.5mg 2-3x/week)',
      },
    ],
    stacking: [
      'PT-141: Synergistic for libido',
      'BPC-157: For any injection site irritation',
    ],
    icon: '🔬',
  },
  // Additional Weight Loss & Metabolic Peptides
  {
    id: 'sermorelin',
    name: 'Sermorelin Acetate',
    category: 'Tissue Repair & Healing',
    description: 'A GHRH analog for stimulating endogenous GH release.',
    mechanism: 'Binds pituitary GHRH receptors to pulse GH secretion.',
    halfLife: '15-30 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Boosts energy, metabolism, lean muscle',
      'Reduces fatigue, improves sleep',
    ],
    sideEffects: [
      'Injection site reactions, flushing',
    ],
    contraindications: [
      'Pituitary disorders, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 0.4mL BAC water',
        frequency: 'Dose 200-500mcg nightly subcutaneously',
        subcutaneous: '200-500mcg nightly subcutaneously',
      },
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 200-500mcg (4-10 units) nightly',
        subcutaneous: '200-500mcg (4-10 units) nightly',
      },
      {
        vialSize: '15MG',
        reconstitution: 'Mix with 3mL BAC water',
        frequency: 'Dose 200-500mcg (4-10 units) nightly',
        subcutaneous: '200-500mcg (4-10 units) nightly',
      },
    ],
    stacking: [
      'Ipamorelin: GH synergy',
      'BPC-157: Recovery',
    ],
    icon: '🩹',
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'Tissue Repair & Healing',
    description: 'A GHRH analog for reducing visceral fat in lipodystrophy research.',
    mechanism: 'Stimulates pituitary GH release, increasing IGF-1 for fat metabolism.',
    halfLife: '26 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Reduces visceral fat, improves lipids',
      'Enhances metabolic regulation',
    ],
    sideEffects: [
      'Injection reactions, joint pain',
    ],
    contraindications: [
      'Malignancy, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 0.4mL BAC water',
        frequency: 'Dose 2mg daily subcutaneously at bedtime',
        subcutaneous: '2mg daily subcutaneously at bedtime',
      },
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 2mg (40 units) daily',
        subcutaneous: '2mg (40 units) daily',
      },
    ],
    stacking: [
      'Ipamorelin: GH enhancement',
      'Tirzepatide: Fat loss',
    ],
    icon: '🩹',
  },
  {
    id: 'hgh191aa',
    name: 'HGH 191AA (Somatropin)',
    category: 'Tissue Repair & Healing',
    description: 'A recombinant human growth hormone for growth and metabolic research.',
    mechanism: 'Binds GH receptors to promote IGF-1 production, cell growth, and metabolism.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Increases lean mass, reduces fat',
      'Improves recovery, bone density',
    ],
    sideEffects: [
      'Edema, carpal tunnel, insulin resistance',
    ],
    contraindications: [
      'Active cancer, diabetes complications',
    ],
    dosing: [
      {
        vialSize: '10IU',
        reconstitution: 'Reconstitute per vial instructions',
        frequency: 'Dose 2-4IU daily subcutaneously',
        subcutaneous: '2-4IU daily subcutaneously',
      },
    ],
    stacking: [
      'CJC-1295: Endogenous GH boost',
      'Ipamorelin: Synergy',
    ],
    icon: '🩹',
  },
  {
    id: 'hghfragment',
    name: 'HGH Fragment 176-191',
    category: 'Weight Loss & Metabolic',
    description: 'A modified HGH peptide for fat loss without growth effects.',
    mechanism: 'Stimulates lipolysis and inhibits lipogenesis in adipose tissue.',
    halfLife: '30 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Targeted fat reduction',
      'Preserves muscle',
    ],
    sideEffects: [
      'Mild head rush, injection pain',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 250-500mcg daily subcutaneously before cardio',
        subcutaneous: '250-500mcg daily subcutaneously before cardio',
      },
    ],
    stacking: [
      'AOD-9604: Lipolytic synergy',
      'Tirzepatide: Weight loss',
    ],
    icon: '💊',
  },
  {
    id: 'glutathione',
    name: 'Glutathione',
    category: 'Anti-Aging & Longevity',
    description: 'A tripeptide antioxidant for detoxification and cellular protection.',
    mechanism: 'Scavenges ROS, supports liver detox, enhances immune function.',
    halfLife: '1-2 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Reduces oxidative stress',
      'Supports detox and immunity',
      'Anti-aging effects',
    ],
    sideEffects: [
      'Mild injection reactions',
    ],
    contraindications: [
      'Hypersensitivity to components',
    ],
    dosing: [
      {
        vialSize: '600MG',
        reconstitution: 'Mix with 6mL saline for IV',
        frequency: 'Dose 600mg IV 1-3x/week',
        subcutaneous: '600mg IV 1-3x/week',
      },
    ],
    stacking: [
      'NAD+: Cellular repair',
      'BPC-157: Protection',
    ],
    icon: '✨',
  },
  {
    id: 'snap8',
    name: 'Snap-8',
    category: 'Anti-Aging & Longevity',
    description: 'A synthetic octapeptide mimicking Botox for cosmetic research.',
    mechanism: 'Inhibits acetylcholine release to reduce muscle contractions and wrinkles.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Reduces expression lines',
      'Skin smoothing',
    ],
    sideEffects: [
      'Skin irritation',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix as 0.5% topical cream or with 2mL BAC for injectable',
        frequency: 'Apply topical daily or inject 0.1mL per site',
        subcutaneous: 'Apply topical daily or inject 0.1mL per site',
      },
    ],
    stacking: [
      'GHK-Cu: Skin rejuvenation',
      'Glow: Anti-aging',
    ],
    icon: '✨',
  },
  {
    id: 'pinealon',
    name: 'Pinealon',
    category: 'Anti-Aging & Longevity',
    description: 'A synthetic tripeptide bioregulator for brain health and longevity.',
    mechanism: 'Regulates gene expression in pineal gland for melatonin and neuroprotection.',
    halfLife: '1-2 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves cognition, sleep',
      'Anti-aging brain support',
    ],
    sideEffects: [
      'Minimal',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '20MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 100-200mcg daily subcutaneously for 10 days, cycle monthly',
        subcutaneous: '100-200mcg daily subcutaneously for 10 days, cycle monthly',
      },
    ],
    stacking: [
      'Epitalon: Longevity',
      'Semax: Cognitive',
    ],
    icon: '✨',
  },
  {
    id: 'dsip',
    name: 'DSIP (Delta Sleep-Inducing Peptide)',
    category: 'Neuroprotection & Cognitive',
    description: 'A neuropeptide for sleep regulation and stress reduction research.',
    mechanism: 'Modulates GABA and sleep-wake cycles.',
    halfLife: '30 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves sleep quality',
      'Reduces stress, chronic pain',
    ],
    sideEffects: [
      'Mild headache',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 100-1000mcg before bed subcutaneously',
        subcutaneous: '100-1000mcg before bed subcutaneously',
      },
    ],
    stacking: [
      'Selank: Anxiety reduction',
    ],
    icon: '🧠',
  },
  {
    id: 'oxytocin',
    name: 'Oxytocin',
    category: 'Reproductive & Hormone',
    description: 'A neuropeptide for social bonding and reproductive research.',
    mechanism: 'Binds oxytocin receptors for trust, labor induction.',
    halfLife: '3-4 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Enhances social cognition',
      'Supports fertility, mood',
    ],
    sideEffects: [
      'Nausea, headache',
    ],
    contraindications: [
      'Pregnancy complications',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 10-40IU (5-20 units) intranasal daily',
        subcutaneous: '10-40IU (5-20 units) intranasal daily',
      },
    ],
    stacking: [
      'Kisspeptin: Reproductive',
      'PT-141: Libido',
    ],
    icon: '❤️',
  },
  {
    id: 'cerebrolysin',
    name: 'Cerebrolysin',
    category: 'Neuroprotection & Cognitive',
    description: 'A neurotrophic mixture from porcine brain for neuroprotection.',
    mechanism: 'Promotes neuronal survival, BDNF expression.',
    halfLife: '4-6 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Brain repair, cognitive enhancement',
      'Neurological recovery',
    ],
    sideEffects: [
      'Injection reactions',
    ],
    contraindications: [
      'Epilepsy, renal impairment',
    ],
    dosing: [
      {
        vialSize: '30MG',
        reconstitution: 'Dilute in saline for IM/IV',
        frequency: 'Dose 5-10mL daily IM/IV for 10-20 days',
        subcutaneous: '5-10mL daily IM/IV for 10-20 days',
      },
    ],
    stacking: [
      'Semax/Selank: Cognitive',
    ],
    icon: '🧠',
  },
  {
    id: 'ss31',
    name: 'SS-31 (Elamipretide)',
    category: 'Anti-Aging & Longevity',
    description: 'A mitochondrial-targeted tetrapeptide for cellular protection.',
    mechanism: 'Binds cardiolipin to reduce oxidative stress, enhance ATP.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves mitochondrial function',
      'Reduces oxidative damage',
    ],
    sideEffects: [
      'Minimal',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '25MG',
        reconstitution: 'Mix with 5mL BAC water',
        frequency: 'Dose 0.25-1mg/kg daily subcutaneously',
        subcutaneous: '0.25-1mg/kg daily subcutaneously',
      },
    ],
    stacking: [
      'NAD+: Mitochondrial support',
    ],
    icon: '✨',
  },
  {
    id: 'kisspeptin',
    name: 'Kisspeptin-10',
    category: 'Reproductive & Hormone',
    description: 'A neuropeptide for GnRH regulation and fertility research.',
    mechanism: 'Stimulates GnRH release, increasing LH/FSH.',
    halfLife: '4-5 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Enhances testosterone, fertility',
      'Reproductive hormone support',
    ],
    sideEffects: [
      'Mild hormonal fluctuations',
    ],
    contraindications: [
      'Pregnancy, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 10-100mcg daily subcutaneously',
        subcutaneous: '10-100mcg daily subcutaneously',
      },
    ],
    stacking: [
      'HCG: Gonadal stimulation',
    ],
    icon: '❤️',
  },
  {
    id: 'thymalin',
    name: 'Thymalin',
    category: 'Other',
    description: 'A thymic extract peptide for immune modulation.',
    mechanism: 'Enhances T-cell maturation and immune balance.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Boosts immunity, anti-aging',
      'Reduces inflammation',
    ],
    sideEffects: [
      'Minimal',
    ],
    contraindications: [
      'Autoimmune disorders',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 5-10mg daily for 10 days, cycle quarterly',
        subcutaneous: '5-10mg daily for 10 days, cycle quarterly',
      },
    ],
    stacking: [
      'Thymosin Alpha-1: Immune synergy',
    ],
    icon: '🔬',
  },
  {
    id: 'thymosinalpha1',
    name: 'Thymosin Alpha-1',
    category: 'Other',
    description: 'A thymic peptide for immune modulation.',
    mechanism: 'Enhances T-cell function, cytokine production.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Immune enhancement, antiviral activity',
      'Cancer and infection support',
    ],
    sideEffects: [
      'Mild flu-like symptoms',
    ],
    contraindications: [
      'Autoimmune disease',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 1.6mg 2x/week subcutaneously',
        subcutaneous: '1.6mg 2x/week subcutaneously',
      },
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 1.6mg (3.2 units) 2x/week',
        subcutaneous: '1.6mg (3.2 units) 2x/week',
      },
    ],
    stacking: [
      'Glutathione: Immune support',
    ],
    icon: '🔬',
  },
  {
    id: 'motsc',
    name: 'MOTS-c',
    category: 'Anti-Aging & Longevity',
    description: 'A mitochondrial-derived peptide for metabolic regulation.',
    mechanism: 'Regulates nuclear genes for energy homeostasis.',
    halfLife: '30 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves insulin sensitivity, exercise capacity',
      'Fat loss, longevity',
    ],
    sideEffects: [
      'Minimal',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '15MG',
        reconstitution: 'Mix with 3mL BAC water',
        frequency: 'Dose 5-10mg weekly subcutaneously',
        subcutaneous: '5-10mg weekly subcutaneously',
      },
    ],
    stacking: [
      'NAD+: Mitochondrial',
      'Tirzepatide: Metabolic',
    ],
    icon: '✨',
  },
  {
    id: 'vip',
    name: 'Vasoactive Intestinal Peptide (VIP)',
    category: 'Other',
    description: 'A neuropeptide for vasodilation and immune modulation.',
    mechanism: 'Relaxes smooth muscle, inhibits inflammation.',
    halfLife: '2 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves pulmonary function',
      'Anti-inflammatory',
    ],
    sideEffects: [
      'Flushing, hypotension',
    ],
    contraindications: [
      'Low blood pressure',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 100-200mcg nebulized or subcutaneous daily',
        subcutaneous: '100-200mcg nebulized or subcutaneous daily',
      },
    ],
    stacking: [
      'BPC-157: GI repair',
    ],
    icon: '🔬',
  },
  {
    id: 'll37',
    name: 'LL-37',
    category: 'Other',
    description: 'An antimicrobial peptide for immune defense.',
    mechanism: 'Disrupts bacterial membranes, modulates inflammation.',
    halfLife: '1-2 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Antimicrobial, wound healing',
      'Immune regulation',
    ],
    sideEffects: [
      'Cytotoxicity at high doses',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 50-100mcg daily topical or subcutaneous',
        subcutaneous: '50-100mcg daily topical or subcutaneous',
      },
    ],
    stacking: [
      'KPV: Anti-inflammatory',
    ],
    icon: '🔬',
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    category: 'Other',
    description: 'A hormone peptide for sleep and antioxidant research.',
    mechanism: 'Binds MT1/MT2 receptors for circadian regulation.',
    halfLife: '30-60 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Improves sleep, antioxidant protection',
      'Anti-aging',
    ],
    sideEffects: [
      'Drowsiness, headache',
    ],
    contraindications: [
      'Autoimmune diseases',
    ],
    dosing: [
      {
        vialSize: 'STANDARD',
        reconstitution: 'Oral 0.5-5mg nightly; peptide form subcutaneous 1-3mg',
        frequency: 'Oral 0.5-5mg nightly; peptide form subcutaneous 1-3mg',
        subcutaneous: 'Oral 0.5-5mg nightly; peptide form subcutaneous 1-3mg',
      },
    ],
    stacking: [
      'DSIP: Sleep enhancement',
    ],
    icon: '🔬',
  },
  {
    id: 'dermorphin',
    name: 'Dermorphin',
    category: 'Other',
    description: 'A mu-opioid agonist from frog skin for pain research.',
    mechanism: 'Binds opioid receptors for analgesia.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Potent pain relief',
    ],
    sideEffects: [
      'Respiratory depression',
    ],
    contraindications: [
      'Opioid sensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 0.1-0.5mg as needed subcutaneously (research only)',
        subcutaneous: '0.1-0.5mg as needed subcutaneously (research only)',
      },
    ],
    stacking: [
      'BPC-157: Pain synergy',
    ],
    icon: '🔬',
  },
  {
    id: 'glp1',
    name: 'GLP-1',
    category: 'Weight Loss & Metabolic',
    description: 'An incretin hormone for glucose regulation.',
    mechanism: 'Enhances insulin, suppresses glucagon.',
    halfLife: '2 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Glycemic control, weight loss',
    ],
    sideEffects: [
      'Nausea',
    ],
    contraindications: [
      'Pancreatitis history',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 0.6-1.2mg weekly subcutaneously',
        subcutaneous: '0.6-1.2mg weekly subcutaneously',
      },
    ],
    stacking: [
      'Semaglutide analogs',
    ],
    icon: '💊',
  },
  {
    id: 'insulin',
    name: 'Insulin',
    category: 'Other',
    description: 'A peptide hormone for glucose uptake.',
    mechanism: 'Binds insulin receptors to lower blood sugar.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Glycemic management',
    ],
    sideEffects: [
      'Hypoglycemia',
    ],
    contraindications: [
      'Hypoglycemia risk',
    ],
    dosing: [
      {
        vialSize: 'STANDARD',
        reconstitution: 'Dose per research protocol, subcutaneous',
        frequency: 'Dose per research protocol, subcutaneous',
        subcutaneous: 'Dose per research protocol, subcutaneous',
      },
    ],
    stacking: [
      'Use with caution in metabolic studies',
    ],
    icon: '🔬',
  },
  {
    id: 'hmg',
    name: 'HMG',
    category: 'Reproductive & Hormone',
    description: 'Human menopausal gonadotropin for fertility research.',
    mechanism: 'Contains FSH/LH for ovarian stimulation.',
    halfLife: '24-36 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Supports ovulation',
    ],
    sideEffects: [
      'Ovarian hyperstimulation',
    ],
    contraindications: [
      'Pregnancy, ovarian cysts',
    ],
    dosing: [
      {
        vialSize: 'STANDARD',
        reconstitution: 'Mix per vial instructions',
        frequency: 'Dose 75-225IU daily subcutaneously',
        subcutaneous: '75-225IU daily subcutaneously',
      },
    ],
    stacking: [
      'HCG: Ovulation trigger',
    ],
    icon: '❤️',
  },
  {
    id: 'epo',
    name: 'EPO',
    category: 'Other',
    description: 'Erythropoietin for red blood cell production.',
    mechanism: 'Stimulates erythropoiesis.',
    halfLife: '24-48 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Increases oxygen capacity',
    ],
    sideEffects: [
      'Hypertension, thrombosis',
    ],
    contraindications: [
      'Cancer, CV disease',
    ],
    dosing: [
      {
        vialSize: 'STANDARD',
        reconstitution: 'Dose 50-100IU/kg 3x/week subcutaneous',
        frequency: 'Dose 50-100IU/kg 3x/week subcutaneous',
        subcutaneous: '50-100IU/kg 3x/week subcutaneous',
      },
    ],
    stacking: [
      'Avoid with other performance enhancers',
    ],
    icon: '🔬',
  },
  {
    id: 'ara290',
    name: 'Ara-290',
    category: 'Other',
    description: 'An EPO-derived peptide for neuropathy.',
    mechanism: 'Activates EPO receptors for tissue protection.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Neuropathic pain relief, metabolic control',
    ],
    sideEffects: [
      'Mild injection reactions',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 2mg daily subcutaneously',
        subcutaneous: '2mg daily subcutaneously',
      },
    ],
    stacking: [
      'BPC-157: Nerve repair',
    ],
    icon: '🔬',
  },
  {
    id: 'kpv',
    name: 'KPV',
    category: 'Other',
    description: 'An alpha-MSH fragment for anti-inflammatory research.',
    mechanism: 'Reduces NF-kB, antimicrobial effects.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Inflammation control, wound healing',
    ],
    sideEffects: [
      'Minimal',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 200-500mcg daily orally or subcutaneous',
        subcutaneous: '200-500mcg daily orally or subcutaneous',
      },
      {
        vialSize: '10MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 200-500mcg (4-10 units) daily',
        subcutaneous: '200-500mcg (4-10 units) daily',
      },
    ],
    stacking: [
      'LL-37: Antimicrobial',
      'KLOW blend',
    ],
    icon: '🔬',
  },
  {
    id: 'pnc27',
    name: 'PNC 27',
    category: 'Other',
    description: 'A synthetic peptide targeting cancer cells.',
    mechanism: 'Binds HDM-2 to induce cancer cell necrosis.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Selective tumor cell killing',
    ],
    sideEffects: [
      'Unknown long-term',
    ],
    contraindications: [
      'Not for non-cancer research',
    ],
    dosing: [
      {
        vialSize: '20MG',
        reconstitution: 'Mix with 4mL BAC water',
        frequency: 'Dose 1-5mg daily IV in research',
        subcutaneous: '1-5mg daily IV in research',
      },
    ],
    stacking: [
      'Thymosin Alpha-1: Immune',
    ],
    icon: '🔬',
  },
  {
    id: 'slupp322',
    name: 'SLU-PP-322',
    category: 'Weight Loss & Metabolic',
    description: 'An ERR agonist for metabolic research.',
    mechanism: 'Activates estrogen-related receptors for energy expenditure.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Mimics exercise effects, fat loss',
    ],
    sideEffects: [
      'Unknown',
    ],
    contraindications: [
      'Hypersensitivity',
    ],
    dosing: [
      {
        vialSize: 'STANDARD',
        reconstitution: 'Dose per emerging protocols, oral 100-300mg daily',
        frequency: 'Dose per emerging protocols, oral 100-300mg daily',
        subcutaneous: 'Dose per emerging protocols, oral 100-300mg daily',
      },
    ],
    stacking: [
      'Retatrutide: Metabolic',
    ],
    icon: '💊',
  },
  {
    id: 'cjc1295nodac',
    name: 'CJC-1295 NO dac',
    category: 'Tissue Repair & Healing',
    description: 'A GHRH analog for GH stimulation without a drug affinity complex.',
    mechanism: 'Binds GHRH receptors to pulse GH release.',
    halfLife: '30 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Increases GH/IGF-1 for growth and recovery',
      'Improves sleep and metabolism',
    ],
    sideEffects: [
      'Injection site reactions, water retention',
    ],
    contraindications: [
      'Active malignancy, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 0.4mL BAC water',
        frequency: 'Dose 100-300mcg (5-15 units) 1-2x daily subcutaneously',
        subcutaneous: '100-300mcg (5-15 units) 1-2x daily subcutaneously',
      },
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 100-300mcg (2-6 units) 1-2x daily',
        subcutaneous: '100-300mcg (2-6 units) 1-2x daily',
      },
    ],
    stacking: [
      'Ipamorelin: GH synergy',
      'Tesamorelin: Fat loss',
    ],
    icon: '🩹',
  },
  {
    id: 'igf1lr3',
    name: 'IGF-1 LR3',
    category: 'Tissue Repair & Healing',
    description: 'A long-acting insulin-like growth factor for muscle growth and repair.',
    mechanism: 'Binds IGF-1 receptors to promote protein synthesis and cell growth.',
    halfLife: '20-30 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Enhances muscle hypertrophy and recovery',
      'Improves tissue repair',
    ],
    sideEffects: [
      'Hypoglycemia, joint pain',
    ],
    contraindications: [
      'Active cancer, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '1MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 20-100mcg daily subcutaneous, post-workout',
        subcutaneous: '20-100mcg daily subcutaneous, post-workout',
      },
    ],
    stacking: [
      'CJC-1295: GH synergy',
      'BPC-157: Repair',
    ],
    icon: '🩹',
  },
  {
    id: 'igf1des',
    name: 'IGF-1 DES',
    category: 'Tissue Repair & Healing',
    description: 'A short-acting variant of IGF-1 for localized muscle growth.',
    mechanism: 'Targets muscle cells directly for anabolic effects.',
    halfLife: '20 minutes',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Localized muscle growth and repair',
      'Enhanced recovery',
    ],
    sideEffects: [
      'Hypoglycemia, injection site reactions',
    ],
    contraindications: [
      'Active cancer, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '1MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 50-150mcg per muscle group post-workout',
        subcutaneous: '50-150mcg per muscle group post-workout',
      },
    ],
    stacking: [
      'IGF-1 LR3: Systemic support',
      'Ipamorelin: GH boost',
    ],
    icon: '🩹',
  },
  {
    id: 'hexarelin',
    name: 'Hexarelin Acetate',
    category: 'Tissue Repair & Healing',
    description: 'A hexapeptide growth hormone secretagogue.',
    mechanism: 'Stimulates GH release via ghrelin receptors.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Increases GH for growth and recovery',
      'Improves strength and metabolism',
    ],
    sideEffects: [
      'Water retention, tingling',
    ],
    contraindications: [
      'Active malignancy, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '2MG',
        reconstitution: 'Mix with 0.4mL BAC water',
        frequency: 'Dose 100-300mcg (5-15 units) 1-2x daily subcutaneously',
        subcutaneous: '100-300mcg (5-15 units) 1-2x daily subcutaneously',
      },
    ],
    stacking: [
      'CJC-1295: GH synergy',
      'BPC-157: Recovery',
    ],
    icon: '🩹',
  },
  {
    id: 'ahkcu',
    name: 'AHK-Cu',
    category: 'Anti-Aging & Longevity',
    description: 'A copper-binding peptide for hair growth and skin repair.',
    mechanism: 'Promotes collagen and hair follicle activity via copper.',
    halfLife: '2-4 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Stimulates hair growth, skin repair',
      'Anti-aging effects',
    ],
    sideEffects: [
      'Copper sensitivity',
    ],
    contraindications: [
      'Copper allergy',
    ],
    dosing: [
      {
        vialSize: '50MG',
        reconstitution: 'Mix with 5mL BAC water',
        frequency: 'Dose 1-2mg daily subcutaneous or topical',
        subcutaneous: '1-2mg daily subcutaneous or topical',
      },
    ],
    stacking: [
      'GHK-Cu: Skin synergy',
      'BPC-157: Repair',
    ],
    icon: '✨',
  },
  {
    id: 'ghrp6',
    name: 'GHRP-6 Acetate',
    category: 'Tissue Repair & Healing',
    description: 'A growth hormone-releasing peptide with appetite stimulation.',
    mechanism: 'Activates ghrelin receptors for GH release.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Increases GH, appetite, and muscle mass',
      'Improves recovery',
    ],
    sideEffects: [
      'Hunger, water retention',
    ],
    contraindications: [
      'Active malignancy, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG',
        reconstitution: 'Mix with 1mL BAC water',
        frequency: 'Dose 100-300mcg (2-6 units) 1-2x daily subcutaneously',
        subcutaneous: '100-300mcg (2-6 units) 1-2x daily subcutaneously',
      },
    ],
    stacking: [
      'CJC-1295: GH boost',
      'Ipamorelin: Synergy',
    ],
    icon: '🩹',
  },
  {
    id: 'cagrisema',
    name: 'Cagrilintide + Semaglutide',
    category: 'Weight Loss & Metabolic',
    description: 'A combined GLP-1/amylin analog for weight loss.',
    mechanism: 'Semaglutide: Suppresses appetite via GLP-1. Cagrilintide: Enhances satiety via amylin.',
    halfLife: '7 days',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Enhanced weight loss (up to 15-20% in trials)',
      'Improved glycemic control',
    ],
    sideEffects: [
      'Nausea, GI upset',
    ],
    contraindications: [
      'Pregnancy, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '5MG/5MG',
        reconstitution: 'Mix with 2mL BAC water',
        frequency: 'Dose 1-2mg weekly subcutaneous, titrate over 4 weeks',
        subcutaneous: '1-2mg weekly subcutaneous, titrate over 4 weeks',
      },
    ],
    stacking: [
      'AOD-9604: Fat loss',
      'BPC-157: GI support',
    ],
    icon: '💊',
  },
  {
    id: 'pnc2710',
    name: 'PNC 27-10',
    category: 'Other',
    description: 'A variant of PNC 27 for cancer cell targeting.',
    mechanism: 'Binds HDM-2 for selective cancer cell necrosis.',
    halfLife: '2-3 hours',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Enhanced tumor cell killing',
    ],
    sideEffects: [
      'Unknown long-term',
    ],
    contraindications: [
      'Not for non-cancer research',
    ],
    dosing: [
      {
        vialSize: '20MG',
        reconstitution: 'Mix with 4mL BAC water',
        frequency: 'Dose 1-5mg daily IV in research',
        subcutaneous: '1-5mg daily IV in research',
      },
    ],
    stacking: [
      'Thymosin Alpha-1: Immune',
    ],
    icon: '🔬',
  },
  {
    id: 'botulinum',
    name: 'Botulinum Toxin (XT100)',
    category: 'Anti-Aging & Longevity',
    description: 'A neurotoxin peptide for muscle relaxation and cosmetic use.',
    mechanism: 'Blocks acetylcholine release to relax muscles.',
    halfLife: '3-6 months',
    storage: 'Store in refrigerator (2-8°C)',
    benefits: [
      'Reduces wrinkles, muscle spasms',
    ],
    sideEffects: [
      'Bruising, temporary weakness',
    ],
    contraindications: [
      'Neuromuscular disorders, hypersensitivity',
    ],
    dosing: [
      {
        vialSize: '100U',
        reconstitution: 'Reconstitute per vial (typically 2-4mL saline)',
        frequency: 'Dose 2-5U per site, every 3-6 months',
        subcutaneous: '2-5U per site, every 3-6 months',
      },
    ],
    stacking: [
      'Snap-8: Cosmetic synergy',
    ],
    icon: '✨',
  },
];

// Re-export categories from the dedicated categories file
export { categories } from './categories';

export function getPeptideById(id: string): Peptide | undefined {
  return peptides.find(peptide => peptide.id === id);
}

export function getPeptidesByCategory(category: string): Peptide[] {
  if (category === 'all') {
    return peptides;
  }
  return peptides.filter(peptide => peptide.category === category);
}
