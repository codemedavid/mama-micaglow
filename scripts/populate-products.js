const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mamamicalglow',
  max: 1,
});

// Products data
const products = [
  // Bacteriostatic Water
  { name: 'Bacteriostatic Water (Benzyl Alcohol 0.9%)', description: '3 ml/vial, 10 vials/kits', category: 'Bacteriostatic Water', price_per_vial: 172.50, price_per_box: 1725.00, vials_per_box: 10, specifications: { concentration: '0.9%', volume_per_vial: '3ml', vials_per_kit: 10 } },
  { name: 'Bacteriostatic Water (Benzyl Alcohol 0.9%)', description: '10 ml/vial, 10 vials/kits', category: 'Bacteriostatic Water', price_per_vial: 201.25, price_per_box: 2012.50, vials_per_box: 10, specifications: { concentration: '0.9%', volume_per_vial: '10ml', vials_per_kit: 10 } },

  // Semaglutide
  { name: 'Semaglutide', description: '2 mg/vial, 10 vials/kit', category: 'Semaglutide', price_per_vial: 465.75, price_per_box: 4657.50, vials_per_box: 10, specifications: { concentration: '2mg', vials_per_kit: 10 } },
  { name: 'Semaglutide', description: '5 mg/vial, 10 vials/kit', category: 'Semaglutide', price_per_vial: 477.25, price_per_box: 4772.50, vials_per_box: 10, specifications: { concentration: '5mg', vials_per_kit: 10 } },
  { name: 'Semaglutide', description: '10 mg/vial, 10 vials/kit', category: 'Semaglutide', price_per_vial: 523.25, price_per_box: 5232.50, vials_per_box: 10, specifications: { concentration: '10mg', vials_per_kit: 10 } },
  { name: 'Semaglutide', description: '15 mg/vial, 10 vials/kit', category: 'Semaglutide', price_per_vial: 603.75, price_per_box: 6037.50, vials_per_box: 10, specifications: { concentration: '15mg', vials_per_kit: 10 } },
  { name: 'Semaglutide', description: '20 mg/vial, 10 vials/kit', category: 'Semaglutide', price_per_vial: 707.25, price_per_box: 7072.50, vials_per_box: 10, specifications: { concentration: '20mg', vials_per_kit: 10 } },

  // Tirzepatide
  { name: 'Tirzepatide', description: '5 mg/vial, 10 vials/kits', category: 'Tirzepatide', price_per_vial: 488.75, price_per_box: 4887.50, vials_per_box: 10, specifications: { concentration: '5mg', vials_per_kit: 10 } },
  { name: 'Tirzepatide', description: '10 mg/vial, 10 vials/kits', category: 'Tirzepatide', price_per_vial: 575.00, price_per_box: 5750.00, vials_per_box: 10, specifications: { concentration: '10mg', vials_per_kit: 10 } },
  { name: 'Tirzepatide', description: '15 mg/vial, 10 vials/kits', category: 'Tirzepatide', price_per_vial: 730.25, price_per_box: 7302.50, vials_per_box: 10, specifications: { concentration: '15mg', vials_per_kit: 10 } },
  { name: 'Tirzepatide', description: '20 mg/vial, 10 vials/kits', category: 'Tirzepatide', price_per_vial: 805.00, price_per_box: 8050.00, vials_per_box: 10, specifications: { concentration: '20mg', vials_per_kit: 10 } },
  { name: 'Tirzepatide', description: '30 mg/vial, 10 vials/kits', category: 'Tirzepatide', price_per_vial: 937.25, price_per_box: 9372.50, vials_per_box: 10, specifications: { concentration: '30mg', vials_per_kit: 10 } },
  { name: 'Tirzepatide', description: '40 mg/vial, 10 vials/kits', category: 'Tirzepatide', price_per_vial: 1035.00, price_per_box: 10350.00, vials_per_box: 10, specifications: { concentration: '40mg', vials_per_kit: 10 } },

  // Retatrutide
  { name: 'Retatrutide', description: '5 mg/vial, 10 vials/kits', category: 'Retatrutide', price_per_vial: 575.00, price_per_box: 5750.00, vials_per_box: 10, specifications: { concentration: '5mg', vials_per_kit: 10 } },
  { name: 'Retatrutide', description: '10 mg/vial, 10 vials/kits', category: 'Retatrutide', price_per_vial: 862.50, price_per_box: 8625.00, vials_per_box: 10, specifications: { concentration: '10mg', vials_per_kit: 10 } },
  { name: 'Retatrutide', description: '15 mg/vial, 10 vials/kits', category: 'Retatrutide', price_per_vial: 1035.00, price_per_box: 10350.00, vials_per_box: 10, specifications: { concentration: '15mg', vials_per_kit: 10 } },
  { name: 'Retatrutide', description: '20 mg/vial, 10 vials/kits', category: 'Retatrutide', price_per_vial: 1150.00, price_per_box: 11500.00, vials_per_box: 10, specifications: { concentration: '20mg', vials_per_kit: 10 } },

  // MOTS-c
  { name: 'MOTS-c', description: '10 mg/vial, 10 vials/kits', category: 'MOTS-c', price_per_vial: 1380.00, price_per_box: 13800.00, vials_per_box: 10, specifications: { concentration: '10mg', vials_per_kit: 10 } },

  // Ipamorelin
  { name: 'Ipamorelin', description: '5 mg/vial, 10 vials/kits', category: 'Ipamorelin', price_per_vial: 345.00, price_per_box: 3450.00, vials_per_box: 10, specifications: { concentration: '5mg', vials_per_kit: 10 } },

  // BCP-157
  { name: 'BCP-157', description: '5 mg/vial, 10 vials/kits', category: 'BCP-157', price_per_vial: 345.00, price_per_box: 3450.00, vials_per_box: 10, specifications: { concentration: '5mg', vials_per_kit: 10 } },
  { name: 'BCP-157', description: '10 mg/vial, 10 vials/kits', category: 'BCP-157', price_per_vial: 500.25, price_per_box: 5002.50, vials_per_box: 10, specifications: { concentration: '10mg', vials_per_kit: 10 } },

  // TB-500
  { name: 'TB-500', description: '5 mg/vial, 10 vials/kits', category: 'TB-500', price_per_vial: 534.75, price_per_box: 5347.50, vials_per_box: 10, specifications: { concentration: '5mg', vials_per_kit: 10 } },
  { name: 'TB-500', description: '10 mg/vial, 10 vials/kits', category: 'TB-500', price_per_vial: 862.50, price_per_box: 8625.00, vials_per_box: 10, specifications: { concentration: '10mg', vials_per_kit: 10 } },

  // HCG
  { name: 'HCG', description: '5000 iu, 10 vials/kits', category: 'HCG', price_per_vial: 632.50, price_per_box: 6325.00, vials_per_box: 10, specifications: { concentration: '5000iu', vials_per_kit: 10 } },
  { name: 'HCG', description: '10000 iu, 10 vials/kits', category: 'HCG', price_per_vial: 862.50, price_per_box: 8625.00, vials_per_box: 10, specifications: { concentration: '10000iu', vials_per_kit: 10 } },

  // NAD+
  { name: 'NAD+', description: '100 mg/vial, 10 vials/kits', category: 'NAD+', price_per_vial: 373.75, price_per_box: 3737.50, vials_per_box: 10, specifications: { concentration: '100mg', vials_per_kit: 10 } },
  { name: 'NAD+', description: '500 mg/vial, 10 vials/kits', category: 'NAD+', price_per_vial: 603.75, price_per_box: 6037.50, vials_per_box: 10, specifications: { concentration: '500mg', vials_per_kit: 10 } },

  // HGH
  { name: 'HGH 191AA (Somatropin)', description: '10 iu, 10 vials', category: 'HGH', price_per_vial: 460.00, price_per_box: 4600.00, vials_per_box: 10, specifications: { concentration: '10iu', vials_per_kit: 10 } },
  { name: 'HGH 191AA (Somatropin)', description: '15 iu, 10 vials', category: 'HGH', price_per_vial: 575.00, price_per_box: 5750.00, vials_per_box: 10, specifications: { concentration: '15iu', vials_per_kit: 10 } },
];

async function populateProducts() {
  try {
    console.log('Starting to populate products...');

    // First, ensure we have a default admin user
    const adminUserResult = await pool.query(`
      INSERT INTO users (id, clerk_id, email, first_name, last_name, role, is_active, created_at, updated_at)
      VALUES (1, 'admin_default', 'admin@example.com', 'Admin', 'User', 'admin', true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `);

    console.log('Admin user ensured:', adminUserResult.rows[0]?.id || 'already exists');

    // Clear existing products
    await pool.query('DELETE FROM products');
    console.log('Cleared existing products');

    // Insert products
    for (const product of products) {
      await pool.query(`
        INSERT INTO products (
          name, description, category, price_per_vial, price_per_box, 
          vials_per_box, is_active, specifications, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        product.name,
        product.description,
        product.category,
        product.price_per_vial,
        product.price_per_box,
        product.vials_per_box,
        true,
        JSON.stringify(product.specifications),
        1, // created_by admin user
      ]);
    }

    console.log(`Successfully inserted ${products.length} products`);

    // Verify insertion
    const countResult = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`Total products in database: ${countResult.rows[0].count}`);
  } catch (error) {
    console.error('Error populating products:', error);
  } finally {
    await pool.end();
  }
}

populateProducts();
