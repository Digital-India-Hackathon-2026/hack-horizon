const { getDb, prepareRun, prepareAll } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌾 Seeding AgriQueue database...\n');

  await getDb();

  // Clear existing data
  await prepareRun('SET FOREIGN_KEY_CHECKS = 0;');
  const tables = ['audit_logs', 'notifications', 'tokens', 'bookings', 'market_prices', 'schemes', 'procurement_centers', 'farmers'];
  for (const t of tables) { try { await prepareRun(`TRUNCATE TABLE ${t}`); } catch(e) {} }
  await prepareRun('SET FOREIGN_KEY_CHECKS = 1;');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ─── Farmers ───
  const farmers = [
    ['Rajesh Kumar', '9876543210', bcrypt.hashSync('123456789012', 8), 'FRM001', 'Narsapur', 'Medak', 'Telangana', 2.5, '["Rice","Cotton"]', 'hi'],
    ['Lakshmi Devi', '9876543211', bcrypt.hashSync('234567890123', 8), 'FRM002', 'Warangal', 'Warangal', 'Telangana', 1.2, '["Maize","Turmeric"]', 'te'],
    ['Venkat Reddy', '9876543212', bcrypt.hashSync('345678901234', 8), 'FRM003', 'Karimnagar', 'Karimnagar', 'Telangana', 3.0, '["Rice","Sugarcane"]', 'te'],
    ['Anita Sharma', '9876543213', bcrypt.hashSync('456789012345', 8), 'FRM004', 'Nizamabad', 'Nizamabad', 'Telangana', 0.8, '["Soybean","Wheat"]', 'hi'],
    ['Mohammed Ismail', '9876543214', bcrypt.hashSync('567890123456', 8), 'FRM005', 'Adilabad', 'Adilabad', 'Telangana', 1.5, '["Cotton","Jowar"]', 'en'],
    ['Sita Ram', '9876543215', bcrypt.hashSync('678901234567', 8), 'FRM006', 'Khammam', 'Khammam', 'Telangana', 4.0, '["Rice","Chilli"]', 'te'],
    ['Priya Patel', '9876543216', bcrypt.hashSync('789012345678', 8), 'FRM007', 'Suryapet', 'Suryapet', 'Telangana', 0.5, '["Groundnut","Maize"]', 'en'],
    ['Ramu Naik', '9876543217', bcrypt.hashSync('890123456789', 8), 'FRM008', 'Nalgonda', 'Nalgonda', 'Telangana', 2.0, '["Rice","Cotton"]', 'te'],
    ['Devendra Singh', '9876543218', bcrypt.hashSync('901234567890', 8), 'FRM009', 'Mancherial', 'Mancherial', 'Telangana', 1.8, '["Wheat","Jowar"]', 'hi'],
    ['Padma Bai', '9876543219', bcrypt.hashSync('012345678901', 8), 'FRM010', 'Siddipet', 'Siddipet', 'Telangana', 0.6, '["Turmeric","Chilli"]', 'te'],
  ];
  for (const f of farmers) {
    await prepareRun('INSERT INTO farmers (name, mobile, aadhaar_hash, farmer_id, village, district, state, land_size, crop_types, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', f);
  }
  console.log(`✅ Inserted ${farmers.length} farmers`);

  // ─── Procurement Centers ───
  const centers = [
    ['Guntur Mandi Center', 'Main Market Yard, Guntur', 'Guntur', 'Andhra Pradesh', 17.7023, 78.4532, 34, '08:00-16:00', '["Turmeric","Groundnut","Wheat","Maize"]', 6, 8],
    ['Kurnool Mandi Center', 'Main Market Yard, Kurnool', 'Kurnool', 'Andhra Pradesh', 14.163, 80.1467, 49, '08:00-16:00', '["Turmeric","Wheat","Sugarcane","Cotton","Groundnut"]', 6, 8],
    ['Anantapur Mandi Center', 'Main Market Yard, Anantapur', 'Anantapur', 'Andhra Pradesh', 14.3698, 78.0972, 27, '08:00-16:00', '["Sugarcane","Maize","Cotton","Mustard","Groundnut"]', 4, 7],
    ['Kadapa Mandi Center', 'Main Market Yard, Kadapa', 'Kadapa', 'Andhra Pradesh', 16.0815, 80.2632, 48, '08:00-16:00', '["Cotton","Turmeric","Jowar","Soybean","Rice"]', 5, 9],
    ['Nandyal Mandi Center', 'Main Market Yard, Nandyal', 'Nandyal', 'Andhra Pradesh', 15.6787, 77.9482, 20, '08:00-16:00', '["Rice","Cotton","Wheat","Jowar","Soybean"]', 5, 6],
    ['Ongole Mandi Center', 'Main Market Yard, Ongole', 'Ongole', 'Andhra Pradesh', 14.4328, 78.3368, 38, '08:00-16:00', '["Wheat","Rice","Turmeric"]', 6, 9],
    ['Tirupati Mandi Center', 'Main Market Yard, Tirupati', 'Tirupati', 'Andhra Pradesh', 17.3665, 80.8803, 24, '08:00-16:00', '["Sugarcane","Cotton","Jowar","Soybean"]', 4, 9],
    ['Eluru Mandi Center', 'Main Market Yard, Eluru', 'Eluru', 'Andhra Pradesh', 16.6404, 79.3786, 49, '08:00-16:00', '["Sugarcane","Rice","Wheat"]', 4, 6],
    ['Kakinada Mandi Center', 'Main Market Yard, Kakinada', 'Kakinada', 'Andhra Pradesh', 16.3227, 79.1583, 48, '08:00-16:00', '["Rice","Wheat","Groundnut"]', 2, 8],
    ['Rajahmundry Mandi Center', 'Main Market Yard, Rajahmundry', 'Rajahmundry', 'Andhra Pradesh', 15.3869, 78.1223, 28, '08:00-16:00', '["Rice","Groundnut","Jowar","Soybean"]', 3, 9],
    ['Adilabad Mandi Center', 'Main Market Yard, Adilabad', 'Adilabad', 'Telangana', 17.5513, 79.4791, 35, '08:00-16:00', '["Rice","Soybean","Turmeric"]', 3, 8],
    ['Nizamabad Mandi Center', 'Main Market Yard, Nizamabad', 'Nizamabad', 'Telangana', 17.5266, 78.0621, 47, '08:00-16:00', '["Rice","Sugarcane","Soybean","Mustard","Wheat"]', 3, 6],
    ['Karimnagar Mandi Center', 'Main Market Yard, Karimnagar', 'Karimnagar', 'Telangana', 19.79, 78.959, 23, '08:00-16:00', '["Soybean","Cotton","Mustard","Sugarcane"]', 5, 7],
    ['Warangal Mandi Center', 'Main Market Yard, Warangal', 'Warangal', 'Telangana', 18.3133, 80.0442, 28, '08:00-16:00', '["Cotton","Jowar","Rice","Mustard","Sugarcane"]', 2, 7],
    ['Khammam Mandi Center', 'Main Market Yard, Khammam', 'Khammam', 'Telangana', 16.713, 78.6282, 26, '08:00-16:00', '["Turmeric","Rice","Wheat"]', 3, 8],
    ['Mahabubnagar Mandi Center', 'Main Market Yard, Mahabubnagar', 'Mahabubnagar', 'Telangana', 18.4195, 77.6465, 38, '08:00-16:00', '["Turmeric","Rice","Wheat","Sugarcane"]', 4, 9],
    ['Siddipet Mandi Center', 'Main Market Yard, Siddipet', 'Siddipet', 'Telangana', 17.2884, 77.7095, 23, '08:00-16:00', '["Sugarcane","Groundnut","Rice","Mustard","Cotton"]', 5, 6],
    ['Suryapet Mandi Center', 'Main Market Yard, Suryapet', 'Suryapet', 'Telangana', 17.8301, 78.3166, 29, '08:00-16:00', '["Mustard","Maize","Sugarcane","Wheat","Soybean"]', 2, 8],
    ['Jagtial Mandi Center', 'Main Market Yard, Jagtial', 'Jagtial', 'Telangana', 18.4197, 80.3679, 22, '08:00-16:00', '["Turmeric","Mustard","Wheat","Groundnut"]', 3, 5],
    ['Nalgonda Mandi Center', 'Main Market Yard, Nalgonda', 'Nalgonda', 'Telangana', 18.3984, 79.7272, 46, '08:00-16:00', '["Mustard","Soybean","Sugarcane","Jowar","Groundnut"]', 2, 7],
    ['Lasalgaon Mandi Center', 'Main Market Yard, Lasalgaon', 'Lasalgaon', 'Maharashtra', 20.3031, 76.5205, 20, '08:00-16:00', '["Maize","Turmeric","Wheat"]', 6, 6],
    ['Pune Mandi Center', 'Main Market Yard, Pune', 'Pune', 'Maharashtra', 21.5771, 77.2473, 37, '08:00-16:00', '["Groundnut","Soybean","Turmeric","Sugarcane"]', 3, 5],
    ['Nashik Mandi Center', 'Main Market Yard, Nashik', 'Nashik', 'Maharashtra', 19.3273, 74.2847, 43, '08:00-16:00', '["Rice","Turmeric","Wheat","Sugarcane"]', 3, 9],
    ['Nagpur Mandi Center', 'Main Market Yard, Nagpur', 'Nagpur', 'Maharashtra', 17.8326, 75.9319, 20, '08:00-16:00', '["Jowar","Sugarcane","Groundnut","Mustard"]', 2, 6],
    ['Amravati Mandi Center', 'Main Market Yard, Amravati', 'Amravati', 'Maharashtra', 19.7604, 75.5466, 43, '08:00-16:00', '["Rice","Turmeric","Wheat","Maize","Cotton"]', 4, 8],
    ['Akola Mandi Center', 'Main Market Yard, Akola', 'Akola', 'Maharashtra', 19.822, 75.8132, 48, '08:00-16:00', '["Groundnut","Rice","Soybean","Turmeric"]', 5, 7],
    ['Jalgaon Mandi Center', 'Main Market Yard, Jalgaon', 'Jalgaon', 'Maharashtra', 21.4305, 75.4104, 21, '08:00-16:00', '["Groundnut","Rice","Cotton","Turmeric","Wheat"]', 5, 8],
    ['Solapur Mandi Center', 'Main Market Yard, Solapur', 'Solapur', 'Maharashtra', 17.8763, 76.7827, 25, '08:00-16:00', '["Wheat","Maize","Groundnut","Sugarcane","Jowar"]', 3, 8],
    ['Ahmednagar Mandi Center', 'Main Market Yard, Ahmednagar', 'Ahmednagar', 'Maharashtra', 19.1266, 76.2251, 23, '08:00-16:00', '["Turmeric","Maize","Mustard","Sugarcane","Wheat"]', 6, 9],
    ['Latur Mandi Center', 'Main Market Yard, Latur', 'Latur', 'Maharashtra', 20.6558, 77.2373, 47, '08:00-16:00', '["Maize","Wheat","Cotton","Groundnut"]', 2, 9],
    ['Hubballi Mandi Center', 'Main Market Yard, Hubballi', 'Hubballi', 'Karnataka', 16.802, 76.0142, 49, '08:00-16:00', '["Sugarcane","Mustard","Rice","Wheat"]', 6, 8],
    ['Mysuru Mandi Center', 'Main Market Yard, Mysuru', 'Mysuru', 'Karnataka', 16.4126, 73.9501, 36, '08:00-16:00', '["Mustard","Maize","Soybean"]', 4, 7],
    ['Belagavi Mandi Center', 'Main Market Yard, Belagavi', 'Belagavi', 'Karnataka', 17.2152, 76.5411, 26, '08:00-16:00', '["Rice","Soybean","Cotton"]', 5, 6],
    ['Ballari Mandi Center', 'Main Market Yard, Ballari', 'Ballari', 'Karnataka', 15.3366, 75.6376, 49, '08:00-16:00', '["Rice","Wheat","Maize","Soybean"]', 5, 9],
    ['Davanagere Mandi Center', 'Main Market Yard, Davanagere', 'Davanagere', 'Karnataka', 16.3088, 76.7972, 22, '08:00-16:00', '["Mustard","Sugarcane","Rice","Wheat","Jowar"]', 4, 5],
    ['Shivamogga Mandi Center', 'Main Market Yard, Shivamogga', 'Shivamogga', 'Karnataka', 14.5426, 76.205, 28, '08:00-16:00', '["Maize","Cotton","Jowar"]', 5, 9],
    ['Tumakuru Mandi Center', 'Main Market Yard, Tumakuru', 'Tumakuru', 'Karnataka', 13.6983, 74.0584, 39, '08:00-16:00', '["Rice","Mustard","Soybean","Jowar"]', 5, 6],
    ['Raichur Mandi Center', 'Main Market Yard, Raichur', 'Raichur', 'Karnataka', 15.5754, 75.2031, 20, '08:00-16:00', '["Jowar","Soybean","Cotton","Maize"]', 2, 7],
    ['Vijayapura Mandi Center', 'Main Market Yard, Vijayapura', 'Vijayapura', 'Karnataka', 14.4487, 75.4028, 39, '08:00-16:00', '["Maize","Jowar","Mustard"]', 3, 6],
    ['Kalaburagi Mandi Center', 'Main Market Yard, Kalaburagi', 'Kalaburagi', 'Karnataka', 16.1093, 77.0882, 40, '08:00-16:00', '["Cotton","Maize","Wheat"]', 5, 6],
    ['Indore Mandi Center', 'Main Market Yard, Indore', 'Indore', 'Madhya Pradesh', 22.2811, 76.8838, 44, '08:00-16:00', '["Rice","Wheat","Sugarcane","Groundnut","Soybean"]', 6, 9],
    ['Ujjain Mandi Center', 'Main Market Yard, Ujjain', 'Ujjain', 'Madhya Pradesh', 23.4705, 77.4789, 20, '08:00-16:00', '["Jowar","Rice","Wheat"]', 4, 7],
    ['Mandsaur Mandi Center', 'Main Market Yard, Mandsaur', 'Mandsaur', 'Madhya Pradesh', 22.2745, 77.3558, 23, '08:00-16:00', '["Groundnut","Sugarcane","Turmeric","Rice","Jowar"]', 5, 9],
    ['Neemuch Mandi Center', 'Main Market Yard, Neemuch', 'Neemuch', 'Madhya Pradesh', 24.1221, 76.1674, 30, '08:00-16:00', '["Cotton","Turmeric","Rice","Sugarcane","Jowar"]', 5, 5],
    ['Dewas Mandi Center', 'Main Market Yard, Dewas', 'Dewas', 'Madhya Pradesh', 22.5667, 76.9595, 37, '08:00-16:00', '["Cotton","Soybean","Rice"]', 2, 8],
    ['Ratlam Mandi Center', 'Main Market Yard, Ratlam', 'Ratlam', 'Madhya Pradesh', 23.5746, 79.2715, 39, '08:00-16:00', '["Rice","Wheat","Mustard","Maize","Jowar"]', 2, 5],
    ['Sehore Mandi Center', 'Main Market Yard, Sehore', 'Sehore', 'Madhya Pradesh', 22.0941, 79.5979, 46, '08:00-16:00', '["Cotton","Maize","Jowar","Sugarcane","Mustard"]', 4, 6],
    ['Bhopal Mandi Center', 'Main Market Yard, Bhopal', 'Bhopal', 'Madhya Pradesh', 22.3912, 78.4384, 35, '08:00-16:00', '["Groundnut","Soybean","Mustard"]', 2, 8],
    ['Hoshangabad Mandi Center', 'Main Market Yard, Hoshangabad', 'Hoshangabad', 'Madhya Pradesh', 23.8291, 75.9378, 31, '08:00-16:00', '["Cotton","Wheat","Soybean","Rice"]', 5, 9],
    ['Vidisha Mandi Center', 'Main Market Yard, Vidisha', 'Vidisha', 'Madhya Pradesh', 24.5762, 76.9396, 21, '08:00-16:00', '["Groundnut","Cotton","Jowar","Sugarcane","Mustard"]', 5, 8],
    ['Agra Mandi Center', 'Main Market Yard, Agra', 'Agra', 'Uttar Pradesh', 27.9332, 82.8943, 43, '08:00-16:00', '["Jowar","Rice","Sugarcane"]', 2, 8],
    ['Lucknow Mandi Center', 'Main Market Yard, Lucknow', 'Lucknow', 'Uttar Pradesh', 24.9271, 81.923, 31, '08:00-16:00', '["Sugarcane","Cotton","Groundnut","Turmeric"]', 4, 5],
    ['Kanpur Mandi Center', 'Main Market Yard, Kanpur', 'Kanpur', 'Uttar Pradesh', 26.9293, 80.8603, 27, '08:00-16:00', '["Jowar","Sugarcane","Rice"]', 6, 8],
    ['Bareilly Mandi Center', 'Main Market Yard, Bareilly', 'Bareilly', 'Uttar Pradesh', 25.3812, 80.158, 25, '08:00-16:00', '["Sugarcane","Rice","Turmeric","Mustard"]', 2, 7],
    ['Gorakhpur Mandi Center', 'Main Market Yard, Gorakhpur', 'Gorakhpur', 'Uttar Pradesh', 25.6406, 79.7994, 30, '08:00-16:00', '["Maize","Rice","Wheat","Groundnut"]', 3, 9],
    ['Varanasi Mandi Center', 'Main Market Yard, Varanasi', 'Varanasi', 'Uttar Pradesh', 26.0772, 82.5559, 22, '08:00-16:00', '["Groundnut","Mustard","Soybean"]', 2, 9],
    ['Prayagraj Mandi Center', 'Main Market Yard, Prayagraj', 'Prayagraj', 'Uttar Pradesh', 25.5744, 79.6552, 32, '08:00-16:00', '["Maize","Soybean","Jowar"]', 4, 6],
    ['Meerut Mandi Center', 'Main Market Yard, Meerut', 'Meerut', 'Uttar Pradesh', 25.3056, 82.5686, 33, '08:00-16:00', '["Maize","Wheat","Cotton"]', 6, 6],
    ['Shahjahanpur Mandi Center', 'Main Market Yard, Shahjahanpur', 'Shahjahanpur', 'Uttar Pradesh', 25.7003, 82.5315, 24, '08:00-16:00', '["Rice","Cotton","Soybean","Groundnut"]', 2, 7],
    ['Sitapur Mandi Center', 'Main Market Yard, Sitapur', 'Sitapur', 'Uttar Pradesh', 26.2277, 82.2895, 46, '08:00-16:00', '["Rice","Wheat","Sugarcane","Maize","Turmeric"]', 2, 6],
    ['Ludhiana Mandi Center', 'Main Market Yard, Ludhiana', 'Ludhiana', 'Punjab', 32.353, 73.9055, 22, '08:00-16:00', '["Wheat","Sugarcane","Turmeric"]', 6, 9],
    ['Amritsar Mandi Center', 'Main Market Yard, Amritsar', 'Amritsar', 'Punjab', 30.7324, 74.3398, 43, '08:00-16:00', '["Groundnut","Sugarcane","Cotton"]', 3, 6],
    ['Jalandhar Mandi Center', 'Main Market Yard, Jalandhar', 'Jalandhar', 'Punjab', 32.2666, 76.0483, 22, '08:00-16:00', '["Maize","Sugarcane","Mustard"]', 3, 7],
    ['Patiala Mandi Center', 'Main Market Yard, Patiala', 'Patiala', 'Punjab', 31.978, 74.7859, 34, '08:00-16:00', '["Cotton","Rice","Wheat","Soybean","Mustard"]', 2, 6],
    ['Bathinda Mandi Center', 'Main Market Yard, Bathinda', 'Bathinda', 'Punjab', 29.5218, 74.2676, 36, '08:00-16:00', '["Maize","Sugarcane","Wheat","Cotton"]', 5, 7],
    ['Moga Mandi Center', 'Main Market Yard, Moga', 'Moga', 'Punjab', 30.6682, 75.5919, 38, '08:00-16:00', '["Turmeric","Soybean","Sugarcane"]', 6, 5],
    ['Sangrur Mandi Center', 'Main Market Yard, Sangrur', 'Sangrur', 'Punjab', 33.0222, 75.4388, 24, '08:00-16:00', '["Rice","Sugarcane","Cotton","Groundnut","Soybean"]', 2, 9],
    ['Barnala Mandi Center', 'Main Market Yard, Barnala', 'Barnala', 'Punjab', 31.5007, 77.1197, 22, '08:00-16:00', '["Sugarcane","Rice","Turmeric","Cotton"]', 6, 6],
    ['Firozpur Mandi Center', 'Main Market Yard, Firozpur', 'Firozpur', 'Punjab', 32.7929, 76.6935, 23, '08:00-16:00', '["Wheat","Rice","Maize","Groundnut","Jowar"]', 2, 8],
    ['Abohar Mandi Center', 'Main Market Yard, Abohar', 'Abohar', 'Punjab', 29.1964, 74.0438, 44, '08:00-16:00', '["Mustard","Maize","Sugarcane","Wheat","Turmeric"]', 2, 5],
    ['Karnal Mandi Center', 'Main Market Yard, Karnal', 'Karnal', 'Haryana', 29.7084, 76.3364, 46, '08:00-16:00', '["Mustard","Rice","Cotton","Turmeric","Wheat"]', 5, 6],
    ['Kurukshetra Mandi Center', 'Main Market Yard, Kurukshetra', 'Kurukshetra', 'Haryana', 28.7039, 75.6512, 42, '08:00-16:00', '["Turmeric","Cotton","Groundnut","Maize"]', 5, 7],
    ['Ambala Mandi Center', 'Main Market Yard, Ambala', 'Ambala', 'Haryana', 27.2209, 74.4966, 28, '08:00-16:00', '["Rice","Wheat","Maize","Mustard"]', 4, 6],
    ['Hisar Mandi Center', 'Main Market Yard, Hisar', 'Hisar', 'Haryana', 30.256, 75.8248, 24, '08:00-16:00', '["Cotton","Wheat","Mustard"]', 4, 6],
    ['Sirsa Mandi Center', 'Main Market Yard, Sirsa', 'Sirsa', 'Haryana', 29.913, 76.1127, 44, '08:00-16:00', '["Sugarcane","Soybean","Jowar","Mustard","Maize"]', 2, 5],
    ['Rohtak Mandi Center', 'Main Market Yard, Rohtak', 'Rohtak', 'Haryana', 29.1253, 75.6978, 22, '08:00-16:00', '["Wheat","Rice","Cotton"]', 6, 7],
    ['Kaithal Mandi Center', 'Main Market Yard, Kaithal', 'Kaithal', 'Haryana', 30.2686, 74.4932, 38, '08:00-16:00', '["Wheat","Rice","Soybean"]', 2, 7],
    ['Fatehabad Mandi Center', 'Main Market Yard, Fatehabad', 'Fatehabad', 'Haryana', 30.9336, 74.3693, 33, '08:00-16:00', '["Maize","Soybean","Wheat","Cotton","Turmeric"]', 5, 6],
    ['Jind Mandi Center', 'Main Market Yard, Jind', 'Jind', 'Haryana', 28.4137, 75.3645, 31, '08:00-16:00', '["Turmeric","Soybean","Maize"]', 2, 9],
    ['Yamunanagar Mandi Center', 'Main Market Yard, Yamunanagar', 'Yamunanagar', 'Haryana', 28.4201, 74.0259, 24, '08:00-16:00', '["Soybean","Cotton","Maize","Sugarcane","Wheat"]', 4, 6],
    ['Kota Mandi Center', 'Main Market Yard, Kota', 'Kota', 'Rajasthan', 26.6572, 73.3436, 27, '08:00-16:00', '["Rice","Turmeric","Cotton"]', 6, 6],
    ['Jaipur Mandi Center', 'Main Market Yard, Jaipur', 'Jaipur', 'Rajasthan', 27.0759, 74.8889, 21, '08:00-16:00', '["Wheat","Jowar","Cotton"]', 4, 7],
    ['Sri Ganganagar Mandi Center', 'Main Market Yard, Sri Ganganagar', 'Sri Ganganagar', 'Rajasthan', 27.5658, 72.491, 23, '08:00-16:00', '["Turmeric","Maize","Groundnut","Cotton"]', 5, 8],
    ['Hanumangarh Mandi Center', 'Main Market Yard, Hanumangarh', 'Hanumangarh', 'Rajasthan', 26.915, 73.0583, 31, '08:00-16:00', '["Cotton","Groundnut","Turmeric"]', 4, 7],
    ['Alwar Mandi Center', 'Main Market Yard, Alwar', 'Alwar', 'Rajasthan', 28.5271, 76.0002, 43, '08:00-16:00', '["Cotton","Maize","Sugarcane","Mustard","Soybean"]', 3, 6],
    ['Bharatpur Mandi Center', 'Main Market Yard, Bharatpur', 'Bharatpur', 'Rajasthan', 26.2502, 75.7704, 47, '08:00-16:00', '["Soybean","Rice","Cotton","Sugarcane"]', 5, 9],
    ['Bikaner Mandi Center', 'Main Market Yard, Bikaner', 'Bikaner', 'Rajasthan', 26.0239, 72.6736, 39, '08:00-16:00', '["Mustard","Wheat","Jowar","Maize"]', 4, 5],
    ['Sikar Mandi Center', 'Main Market Yard, Sikar', 'Sikar', 'Rajasthan', 28.047, 75.8098, 45, '08:00-16:00', '["Rice","Mustard","Turmeric"]', 3, 6],
    ['Jodhpur Mandi Center', 'Main Market Yard, Jodhpur', 'Jodhpur', 'Rajasthan', 26.7743, 72.6178, 35, '08:00-16:00', '["Sugarcane","Cotton","Mustard","Groundnut"]', 6, 7],
    ['Udaipur Mandi Center', 'Main Market Yard, Udaipur', 'Udaipur', 'Rajasthan', 26.1861, 76.044, 27, '08:00-16:00', '["Maize","Sugarcane","Wheat"]', 5, 7],
    ['Unjha Mandi Center', 'Main Market Yard, Unjha', 'Unjha', 'Gujarat', 20.564, 70.924, 36, '08:00-16:00', '["Turmeric","Rice","Wheat","Sugarcane"]', 5, 7],
    ['Rajkot Mandi Center', 'Main Market Yard, Rajkot', 'Rajkot', 'Gujarat', 23.9119, 72.8698, 40, '08:00-16:00', '["Turmeric","Wheat","Mustard","Cotton","Jowar"]', 5, 8],
    ['Gondal Mandi Center', 'Main Market Yard, Gondal', 'Gondal', 'Gujarat', 22.1731, 72.1397, 29, '08:00-16:00', '["Rice","Wheat","Maize","Cotton"]', 6, 9],
    ['Junagadh Mandi Center', 'Main Market Yard, Junagadh', 'Junagadh', 'Gujarat', 22.431, 72.4719, 21, '08:00-16:00', '["Rice","Mustard","Jowar"]', 3, 6],
    ['Dahod Mandi Center', 'Main Market Yard, Dahod', 'Dahod', 'Gujarat', 22.7363, 69.1391, 39, '08:00-16:00', '["Cotton","Sugarcane","Wheat","Rice"]', 5, 9],
    ['Rajpipla Mandi Center', 'Main Market Yard, Rajpipla', 'Rajpipla', 'Gujarat', 20.3561, 70.2659, 41, '08:00-16:00', '["Cotton","Turmeric","Rice","Jowar"]', 5, 7],
    ['Himmatnagar Mandi Center', 'Main Market Yard, Himmatnagar', 'Himmatnagar', 'Gujarat', 22.0454, 69.2608, 30, '08:00-16:00', '["Cotton","Mustard","Turmeric","Soybean"]', 2, 8],
    ['Jamnagar Mandi Center', 'Main Market Yard, Jamnagar', 'Jamnagar', 'Gujarat', 23.0038, 72.297, 46, '08:00-16:00', '["Sugarcane","Jowar","Turmeric","Groundnut"]', 6, 8],
    ['Bhavnagar Mandi Center', 'Main Market Yard, Bhavnagar', 'Bhavnagar', 'Gujarat', 22.4943, 70.1106, 25, '08:00-16:00', '["Jowar","Rice","Turmeric"]', 4, 7],
    ['Mehsana Mandi Center', 'Main Market Yard, Mehsana', 'Mehsana', 'Gujarat', 20.9713, 73.0293, 30, '08:00-16:00', '["Jowar","Rice","Soybean"]', 4, 6],
    ['Gulabbagh Mandi Center', 'Main Market Yard, Gulabbagh', 'Gulabbagh', 'Bihar', 23.4046, 85.1849, 30, '08:00-16:00', '["Cotton","Turmeric","Groundnut"]', 3, 5],
    ['Muzaffarpur Mandi Center', 'Main Market Yard, Muzaffarpur', 'Muzaffarpur', 'Bihar', 24.7761, 85.0948, 33, '08:00-16:00', '["Rice","Sugarcane","Groundnut","Cotton"]', 5, 5],
    ['Begusarai Mandi Center', 'Main Market Yard, Begusarai', 'Begusarai', 'Bihar', 24.5154, 83.5104, 39, '08:00-16:00', '["Cotton","Sugarcane","Mustard","Jowar"]', 2, 8],
    ['Gaya Mandi Center', 'Main Market Yard, Gaya', 'Gaya', 'Bihar', 25.7303, 83.9754, 33, '08:00-16:00', '["Rice","Turmeric","Jowar"]', 3, 7],
    ['Katihar Mandi Center', 'Main Market Yard, Katihar', 'Katihar', 'Bihar', 25.9342, 85.525, 41, '08:00-16:00', '["Mustard","Turmeric","Wheat","Maize"]', 3, 5],
    ['Forbesganj Mandi Center', 'Main Market Yard, Forbesganj', 'Forbesganj', 'Bihar', 25.5553, 83.5719, 22, '08:00-16:00', '["Rice","Wheat","Mustard"]', 2, 8],
    ['Sitamarhi Mandi Center', 'Main Market Yard, Sitamarhi', 'Sitamarhi', 'Bihar', 26.4219, 84.0894, 49, '08:00-16:00', '["Rice","Wheat","Sugarcane","Soybean"]', 4, 7],
    ['Aurangabad Mandi Center', 'Main Market Yard, Aurangabad', 'Aurangabad', 'Bihar', 24.5399, 86.434, 24, '08:00-16:00', '["Cotton","Mustard","Maize"]', 4, 5],
    ['Arrah Mandi Center', 'Main Market Yard, Arrah', 'Arrah', 'Bihar', 23.0547, 84.2523, 44, '08:00-16:00', '["Mustard","Wheat","Cotton","Turmeric","Rice"]', 5, 9],
    ['Bhagalpur Mandi Center', 'Main Market Yard, Bhagalpur', 'Bhagalpur', 'Bihar', 26.9012, 83.5204, 36, '08:00-16:00', '["Jowar","Mustard","Maize","Rice","Wheat"]', 6, 7],
    ['Sambalpur Mandi Center', 'Main Market Yard, Sambalpur', 'Sambalpur', 'Odisha', 20.6563, 83.4184, 46, '08:00-16:00', '["Groundnut","Cotton","Rice","Wheat","Jowar"]', 5, 7],
    ['Bargarh Mandi Center', 'Main Market Yard, Bargarh', 'Bargarh', 'Odisha', 22.1558, 83.169, 21, '08:00-16:00', '["Cotton","Soybean","Rice"]', 2, 5],
    ['Balangir Mandi Center', 'Main Market Yard, Balangir', 'Balangir', 'Odisha', 19.9385, 85.7194, 29, '08:00-16:00', '["Maize","Wheat","Soybean","Cotton","Rice"]', 6, 9],
    ['Cuttack Mandi Center', 'Main Market Yard, Cuttack', 'Cuttack', 'Odisha', 21.1313, 84.4444, 48, '08:00-16:00', '["Rice","Wheat","Mustard","Maize"]', 2, 8],
    ['Bhawanipatna Mandi Center', 'Main Market Yard, Bhawanipatna', 'Bhawanipatna', 'Odisha', 22.7905, 83.3494, 28, '08:00-16:00', '["Turmeric","Jowar","Mustard","Rice","Sugarcane"]', 4, 7],
    ['Rayagada Mandi Center', 'Main Market Yard, Rayagada', 'Rayagada', 'Odisha', 19.1602, 86.0041, 44, '08:00-16:00', '["Rice","Wheat","Groundnut","Mustard","Turmeric"]', 5, 8],
    ['Jeypore Mandi Center', 'Main Market Yard, Jeypore', 'Jeypore', 'Odisha', 20.3168, 86.2333, 26, '08:00-16:00', '["Groundnut","Cotton","Soybean","Jowar"]', 6, 7],
    ['Berhampur Mandi Center', 'Main Market Yard, Berhampur', 'Berhampur', 'Odisha', 20.4866, 86.4201, 32, '08:00-16:00', '["Wheat","Mustard","Rice"]', 6, 9],
    ['Dhenkanal Mandi Center', 'Main Market Yard, Dhenkanal', 'Dhenkanal', 'Odisha', 20.9712, 85.1859, 39, '08:00-16:00', '["Rice","Sugarcane","Wheat","Mustard"]', 3, 5],
    ['Keonjhar Mandi Center', 'Main Market Yard, Keonjhar', 'Keonjhar', 'Odisha', 22.792, 84.0048, 35, '08:00-16:00', '["Rice","Jowar","Mustard","Wheat","Cotton"]', 3, 7],
    ['Salem Mandi Center', 'Main Market Yard, Salem', 'Salem', 'Tamil Nadu', 11.9331, 79.6999, 35, '08:00-16:00', '["Sugarcane","Wheat","Jowar","Mustard","Cotton"]', 2, 5],
    ['Dindigul Mandi Center', 'Main Market Yard, Dindigul', 'Dindigul', 'Tamil Nadu', 9.3812, 79.86, 43, '08:00-16:00', '["Wheat","Rice","Jowar"]', 4, 8],
    ['Erode Mandi Center', 'Main Market Yard, Erode', 'Erode', 'Tamil Nadu', 12.7972, 77.6695, 40, '08:00-16:00', '["Rice","Turmeric","Wheat","Maize"]', 6, 7],
    ['Coimbatore Mandi Center', 'Main Market Yard, Coimbatore', 'Coimbatore', 'Tamil Nadu', 9.6375, 78.2164, 49, '08:00-16:00', '["Rice","Cotton","Sugarcane","Mustard"]', 6, 9],
    ['Madurai Mandi Center', 'Main Market Yard, Madurai', 'Madurai', 'Tamil Nadu', 12.9133, 78.5113, 44, '08:00-16:00', '["Maize","Rice","Cotton"]', 4, 6],
    ['Tiruchirappalli Mandi Center', 'Main Market Yard, Tiruchirappalli', 'Tiruchirappalli', 'Tamil Nadu', 9.1822, 79.4107, 40, '08:00-16:00', '["Groundnut","Turmeric","Maize","Mustard"]', 5, 7],
    ['Villupuram Mandi Center', 'Main Market Yard, Villupuram', 'Villupuram', 'Tamil Nadu', 11.9798, 79.489, 31, '08:00-16:00', '["Maize","Wheat","Jowar","Cotton"]', 4, 9],
    ['Thanjavur Mandi Center', 'Main Market Yard, Thanjavur', 'Thanjavur', 'Tamil Nadu', 9.9071, 78.1468, 24, '08:00-16:00', '["Groundnut","Cotton","Wheat"]', 5, 7],
    ['Virudhunagar Mandi Center', 'Main Market Yard, Virudhunagar', 'Virudhunagar', 'Tamil Nadu', 11.7659, 76.759, 43, '08:00-16:00', '["Cotton","Maize","Wheat","Sugarcane"]', 2, 6],
    ['Tirunelveli Mandi Center', 'Main Market Yard, Tirunelveli', 'Tirunelveli', 'Tamil Nadu', 10.567, 76.8611, 44, '08:00-16:00', '["Soybean","Maize","Sugarcane"]', 4, 6],
    ['Raipur Mandi Center', 'Main Market Yard, Raipur', 'Raipur', 'Chhattisgarh', 22.0289, 82.3972, 42, '08:00-16:00', '["Maize","Sugarcane","Soybean"]', 3, 7],
    ['Dhamtari Mandi Center', 'Main Market Yard, Dhamtari', 'Dhamtari', 'Chhattisgarh', 22.025, 80.212, 25, '08:00-16:00', '["Soybean","Groundnut","Rice"]', 3, 5],
    ['Jagdalpur Mandi Center', 'Main Market Yard, Jagdalpur', 'Jagdalpur', 'Chhattisgarh', 19.572, 81.783, 39, '08:00-16:00', '["Rice","Turmeric","Sugarcane"]', 5, 7],
    ['Rajnandgaon Mandi Center', 'Main Market Yard, Rajnandgaon', 'Rajnandgaon', 'Chhattisgarh', 20.421, 80.1261, 28, '08:00-16:00', '["Sugarcane","Turmeric","Groundnut","Soybean"]', 4, 9],
    ['Durg Mandi Center', 'Main Market Yard, Durg', 'Durg', 'Chhattisgarh', 20.7992, 80.2839, 20, '08:00-16:00', '["Cotton","Rice","Jowar","Mustard"]', 3, 5],
    ['Bilaspur Mandi Center', 'Main Market Yard, Bilaspur', 'Bilaspur', 'Chhattisgarh', 19.8527, 83.1147, 22, '08:00-16:00', '["Maize","Turmeric","Sugarcane","Soybean","Wheat"]', 4, 9],
    ['Mahasamund Mandi Center', 'Main Market Yard, Mahasamund', 'Mahasamund', 'Chhattisgarh', 20.0094, 80.6589, 22, '08:00-16:00', '["Groundnut","Sugarcane","Mustard","Rice"]', 3, 6],
    ['Kanker Mandi Center', 'Main Market Yard, Kanker', 'Kanker', 'Chhattisgarh', 20.5775, 82.8296, 20, '08:00-16:00', '["Sugarcane","Turmeric","Mustard"]', 4, 8],
    ['Korba Mandi Center', 'Main Market Yard, Korba', 'Korba', 'Chhattisgarh', 19.6135, 80.4645, 37, '08:00-16:00', '["Sugarcane","Wheat","Turmeric"]', 2, 9],
    ['Saraipali Mandi Center', 'Main Market Yard, Saraipali', 'Saraipali', 'Chhattisgarh', 21.6212, 82.6209, 43, '08:00-16:00', '["Turmeric","Rice","Cotton","Sugarcane","Jowar"]', 3, 9],
    ['Ranchi Mandi Center', 'Main Market Yard, Ranchi', 'Ranchi', 'Jharkhand', 25.379, 85.0201, 29, '08:00-16:00', '["Soybean","Cotton","Mustard"]', 3, 9],
    ['Jamshedpur Mandi Center', 'Main Market Yard, Jamshedpur', 'Jamshedpur', 'Jharkhand', 21.7727, 84.9584, 24, '08:00-16:00', '["Sugarcane","Cotton","Jowar"]', 6, 5],
    ['Bokaro Mandi Center', 'Main Market Yard, Bokaro', 'Bokaro', 'Jharkhand', 23.726, 83.4586, 35, '08:00-16:00', '["Sugarcane","Soybean","Cotton","Turmeric"]', 2, 5],
    ['Dumka Mandi Center', 'Main Market Yard, Dumka', 'Dumka', 'Jharkhand', 25.0641, 84.7532, 22, '08:00-16:00', '["Groundnut","Rice","Turmeric","Mustard"]', 3, 8],
    ['Hazaribagh Mandi Center', 'Main Market Yard, Hazaribagh', 'Hazaribagh', 'Jharkhand', 24.3208, 84.3626, 41, '08:00-16:00', '["Soybean","Mustard","Maize","Cotton"]', 5, 9],
    ['Daltonganj Mandi Center', 'Main Market Yard, Daltonganj', 'Daltonganj', 'Jharkhand', 24.3444, 83.4765, 40, '08:00-16:00', '["Rice","Wheat","Mustard"]', 5, 8],
    ['Giridih Mandi Center', 'Main Market Yard, Giridih', 'Giridih', 'Jharkhand', 22.2416, 86.5143, 21, '08:00-16:00', '["Groundnut","Turmeric","Mustard"]', 2, 8],
    ['Chaibasa Mandi Center', 'Main Market Yard, Chaibasa', 'Chaibasa', 'Jharkhand', 24.9009, 83.4616, 45, '08:00-16:00', '["Cotton","Sugarcane","Turmeric"]', 3, 5],
    ['Gumla Mandi Center', 'Main Market Yard, Gumla', 'Gumla', 'Jharkhand', 24.5109, 85.5257, 25, '08:00-16:00', '["Soybean","Turmeric","Groundnut","Rice","Sugarcane"]', 2, 5],
    ['Lohardaga Mandi Center', 'Main Market Yard, Lohardaga', 'Lohardaga', 'Jharkhand', 22.6426, 84.8714, 38, '08:00-16:00', '["Sugarcane","Wheat","Mustard"]', 2, 9],
    ['Malda Mandi Center', 'Main Market Yard, Malda', 'Malda', 'West Bengal', 21.9379, 87.5274, 38, '08:00-16:00', '["Cotton","Groundnut","Maize"]', 4, 6],
    ['Bardhaman Mandi Center', 'Main Market Yard, Bardhaman', 'Bardhaman', 'West Bengal', 23.1234, 87.9853, 31, '08:00-16:00', '["Soybean","Cotton","Turmeric","Groundnut"]', 5, 7],
    ['Siliguri Mandi Center', 'Main Market Yard, Siliguri', 'Siliguri', 'West Bengal', 21.8661, 87.9421, 48, '08:00-16:00', '["Mustard","Cotton","Turmeric","Sugarcane","Groundnut"]', 5, 5],
    ['Kharagpur Mandi Center', 'Main Market Yard, Kharagpur', 'Kharagpur', 'West Bengal', 23.1397, 88.3524, 33, '08:00-16:00', '["Cotton","Groundnut","Maize","Rice"]', 2, 5],
    ['Bankura Mandi Center', 'Main Market Yard, Bankura', 'Bankura', 'West Bengal', 23.5542, 86.4687, 25, '08:00-16:00', '["Sugarcane","Wheat","Mustard","Rice","Jowar"]', 4, 9],
    ['Midnapore Mandi Center', 'Main Market Yard, Midnapore', 'Midnapore', 'West Bengal', 21.9496, 86.3438, 23, '08:00-16:00', '["Groundnut","Soybean","Wheat","Sugarcane","Rice"]', 4, 6],
    ['Cooch Behar Mandi Center', 'Main Market Yard, Cooch Behar', 'Cooch Behar', 'West Bengal', 22.9934, 87.5145, 27, '08:00-16:00', '["Groundnut","Maize","Wheat"]', 5, 7],
    ['Krishnanagar Mandi Center', 'Main Market Yard, Krishnanagar', 'Krishnanagar', 'West Bengal', 21.4287, 88.7169, 31, '08:00-16:00', '["Rice","Wheat","Cotton","Sugarcane","Mustard"]', 5, 6],
    ['Balurghat Mandi Center', 'Main Market Yard, Balurghat', 'Balurghat', 'West Bengal', 22.9278, 87.2413, 44, '08:00-16:00', '["Soybean","Sugarcane","Rice"]', 5, 8],
    ['Purulia Mandi Center', 'Main Market Yard, Purulia', 'Purulia', 'West Bengal', 24.1687, 87.8396, 44, '08:00-16:00', '["Jowar","Sugarcane","Soybean"]', 2, 5],
    ['Guwahati Mandi Center', 'Main Market Yard, Guwahati', 'Guwahati', 'Assam', 25.046, 93.5804, 49, '08:00-16:00', '["Maize","Wheat","Turmeric","Soybean"]', 5, 6],
    ['Jorhat Mandi Center', 'Main Market Yard, Jorhat', 'Jorhat', 'Assam', 27.2407, 93.8924, 28, '08:00-16:00', '["Mustard","Groundnut","Cotton","Turmeric"]', 2, 6],
    ['Nagaon Mandi Center', 'Main Market Yard, Nagaon', 'Nagaon', 'Assam', 26.3587, 91.0544, 20, '08:00-16:00', '["Rice","Cotton","Wheat","Mustard","Maize"]', 3, 5],
    ['Dibrugarh Mandi Center', 'Main Market Yard, Dibrugarh', 'Dibrugarh', 'Assam', 25.6099, 93.7462, 41, '08:00-16:00', '["Rice","Wheat","Mustard","Jowar"]', 3, 7],
    ['Silchar Mandi Center', 'Main Market Yard, Silchar', 'Silchar', 'Assam', 25.8957, 91.2161, 32, '08:00-16:00', '["Mustard","Wheat","Cotton"]', 4, 7],
    ['Tezpur Mandi Center', 'Main Market Yard, Tezpur', 'Tezpur', 'Assam', 28.1206, 91.4848, 26, '08:00-16:00', '["Maize","Sugarcane","Wheat","Soybean","Cotton"]', 5, 5],
    ['Bongaigaon Mandi Center', 'Main Market Yard, Bongaigaon', 'Bongaigaon', 'Assam', 25.7971, 91.8266, 30, '08:00-16:00', '["Groundnut","Maize","Mustard","Jowar"]', 5, 8],
    ['Barpeta Mandi Center', 'Main Market Yard, Barpeta', 'Barpeta', 'Assam', 26.5818, 93.301, 33, '08:00-16:00', '["Sugarcane","Turmeric","Mustard","Groundnut","Soybean"]', 6, 6],
    ['Kharupetia Mandi Center', 'Main Market Yard, Kharupetia', 'Kharupetia', 'Assam', 25.705, 93.3571, 47, '08:00-16:00', '["Maize","Turmeric","Soybean","Rice","Jowar"]', 6, 7],
    ['Gauripur Mandi Center', 'Main Market Yard, Gauripur', 'Gauripur', 'Assam', 24.7847, 92.376, 31, '08:00-16:00', '["Mustard","Rice","Jowar"]', 6, 7],
    ['Warangal Mandi Center', 'Near Bus Stand, Hanamkonda', 'Warangal', 'Telangana', 17.9689, 79.5941, 25, '08:00-17:00', '["Rice","Maize","Cotton","Turmeric"]', 3, 7.5],
    ['Karimnagar Procurement Hub', 'Market Yard, Karimnagar Town', 'Karimnagar', 'Telangana', 18.4386, 79.1288, 20, '07:00-16:00', '["Rice","Sugarcane","Cotton","Soybean"]', 2, 8.0],
    ['Nizamabad Krishi Center', 'Agriculture Market Committee, Nizamabad', 'Nizamabad', 'Telangana', 18.6725, 78.0941, 15, '08:00-15:00', '["Soybean","Wheat","Rice","Turmeric"]', 2, 9.0],
    ['Medak District Center', 'Sangareddy Road, Medak', 'Medak', 'Telangana', 17.7689, 78.2641, 18, '08:00-16:00', '["Rice","Cotton","Maize","Jowar"]', 2, 8.5],
    ['Khammam Agri Market', 'Wyra Road, Khammam', 'Khammam', 'Telangana', 17.2473, 80.1514, 22, '07:00-17:00', '["Rice","Chilli","Cotton","Groundnut"]', 3, 7.0],
    ['Pune Agri Market', 'Shivaji Nagar, Pune', 'Pune', 'Maharashtra', 18.5204, 73.8567, 30, '07:00-16:00', '["Wheat","Soybean","Onion"]', 4, 8.0],
    ['Ludhiana Grain Market', 'Gill Road, Ludhiana', 'Ludhiana', 'Punjab', 30.9010, 75.8573, 40, '06:00-18:00', '["Wheat","Rice","Maize"]', 5, 6.0],
    ['Bengaluru APMC', 'Yeshwanthpur, Bengaluru', 'Bengaluru Urban', 'Karnataka', 13.0285, 77.5409, 35, '08:00-17:00', '["Ragi","Groundnut","Turmeric"]', 4, 7.0],
    ['Chennai Koyambedu Market', 'Koyambedu, Chennai', 'Chennai', 'Tamil Nadu', 13.0674, 80.1917, 50, '05:00-15:00', '["Rice","Sugarcane","Groundnut"]', 6, 5.5],
    ['Bhubaneswar Krishi Mandi', 'Unit 1, Bhubaneswar', 'Khurda', 'Odisha', 20.2961, 85.8245, 25, '07:00-16:00', '["Rice","Mustard","Jute"]', 3, 6.5],
  ];
  for (const c of centers) {
    await prepareRun('INSERT INTO procurement_centers (name, address, district, state, location_lat, location_lng, capacity_per_slot, operating_hours, crops_accepted, active_counters, avg_processing_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', c);
  }
  console.log(`✅ Inserted ${centers.length} procurement centers`);

  // ─── Bookings + Tokens ───
  const bookings = [
    [1, 1, today, '09:00', 'Rice', 15.0, 'queued', 1],
    [2, 1, today, '09:00', 'Maize', 8.0, 'queued', 2],
    [3, 2, today, '10:00', 'Rice', 20.0, 'in_progress', 1],
    [4, 3, today, '08:00', 'Soybean', 5.0, 'completed', 1],
    [5, 4, today, '11:00', 'Cotton', 12.0, 'booked', 3],
    [6, 5, today, '09:00', 'Rice', 18.0, 'queued', 1],
    [7, 1, today, '10:00', 'Groundnut', 6.0, 'booked', 3],
    [8, 2, today, '10:00', 'Cotton', 10.0, 'queued', 2],
    [9, 4, today, '11:00', 'Wheat', 7.0, 'booked', 4],
    [10, 5, today, '10:00', 'Chilli', 4.0, 'booked', 2],
    [1, 1, tomorrow, '08:00', 'Rice', 15.0, 'booked', 1],
    [2, 1, tomorrow, '08:00', 'Turmeric', 5.0, 'booked', 2],
    [6, 5, tomorrow, '09:00', 'Chilli', 10.0, 'booked', 1],
  ];

  for (let idx = 0; idx < bookings.length; idx++) {
    const b = bookings[idx];
    const result = await prepareRun(
      'INSERT INTO bookings (farmer_id, center_id, slot_date, slot_time, crop_type, estimated_quantity, status, queue_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', b
    );
    const tokenCode = `AQ-${String(idx + 1).padStart(4, '0')}-DEMO`;
    const qrData = JSON.stringify({ token: tokenCode, booking: result.lastInsertRowid, date: b[2], time: b[3] });
    const tokenStatus = b[6] === 'completed' ? 'used' : (b[6] === 'cancelled' ? 'cancelled' : 'active');
    const tokenResult = await prepareRun('INSERT INTO tokens (booking_id, token_code, qr_data, status) VALUES (?, ?, ?, ?)', [result.lastInsertRowid, tokenCode, qrData, tokenStatus]);
    await prepareRun('UPDATE bookings SET token_id = ? WHERE id = ?', [tokenResult.lastInsertRowid, result.lastInsertRowid]);
  }
  console.log(`✅ Inserted ${bookings.length} bookings with tokens`);

  // ─── Market Prices ───
  const prices = [
    ['Rice (Paddy)', 'धान', 'వరి', 'Warangal', 'Telangana', 2203, 2183, today, 'up'],
    ['Rice (Paddy)', 'धान', 'వరి', 'Karimnagar', 'Telangana', 2195, 2183, today, 'stable'],
    ['Wheat', 'गेहूं', 'గోధుమ', 'Nizamabad', 'Telangana', 2275, 2275, today, 'stable'],
    ['Maize', 'मक्का', 'మొక్కజొన్న', 'Warangal', 'Telangana', 2090, 2090, today, 'up'],
    ['Cotton (Medium)', 'कपास (मध्यम)', 'పత్తి (మధ్యమ)', 'Adilabad', 'Telangana', 6620, 6620, today, 'down'],
    ['Cotton (Long)', 'कपास (लंबा)', 'పత్తి (పొడవు)', 'Adilabad', 'Telangana', 7020, 7020, today, 'stable'],
    ['Soybean', 'सोयाबीन', 'సోయాబీన్', 'Nizamabad', 'Telangana', 4600, 4600, today, 'up'],
    ['Groundnut', 'मूंगफली', 'వేరుశెనగ', 'Khammam', 'Telangana', 6377, 6377, today, 'stable'],
    ['Turmeric', 'हल्दी', 'పసుపు', 'Nizamabad', 'Telangana', 9200, null, today, 'up'],
    ['Chilli (Dry)', 'मिर्ची (सूखी)', 'మిర్చి (ఎండు)', 'Khammam', 'Telangana', 18500, null, today, 'up'],
    ['Jowar (Sorghum)', 'ज्वार', 'జొన్న', 'Medak', 'Telangana', 3180, 3180, today, 'stable'],
    ['Sugarcane', 'गन्ना', 'చెరకు', 'Karimnagar', 'Telangana', 315, 315, today, 'stable'],
    ['Red Gram (Tur)', 'अरहर', 'కందులు', 'Warangal', 'Telangana', 7000, 7000, today, 'down'],
    ['Green Gram (Moong)', 'मूंग', 'పెసలు', 'Karimnagar', 'Telangana', 8558, 8558, today, 'up'],
    ['Black Gram (Urad)', 'उड़द', 'మినుములు', 'Nizamabad', 'Telangana', 6950, 6950, today, 'stable'],
  ];
  for (const p of prices) {
    await prepareRun('INSERT INTO market_prices (crop_name, crop_name_hi, crop_name_te, mandi_name, state, price_per_quintal, msp, date_recorded, trend) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', p);
  }
  console.log(`✅ Inserted ${prices.length} market prices`);

  // ─── Government Schemes ───
  const schemes = [
    ['PM-KISAN', 'पीएम-किसान', 'పీఎం-కిసాన్', 'Direct income support of ₹6,000 per year in three equal installments to all land-holding farmer families.', 'सभी भूमिधारक किसान परिवारों को तीन समान किस्तों में प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता।', 'అన్ని భూమి కలిగిన రైతు కుటుంబాలకు మూడు సమాన వాయిదాలలో సంవత్సరానికి ₹6,000 ప్రత్యక్ష ఆదాయ మద్దతు.', 'All land-holding farmer families with cultivable land.', 'कृषि योग्य भूमि वाले सभी भूमिधारक किसान परिवार।', 'సాగు భూమి ఉన్న అన్ని భూమి కలిగిన రైతు కుటుంబాలు.', '["Aadhaar Card","Land Records / Pattadar Passbook","Bank Account Details","Mobile Number"]', 'https://pmkisan.gov.in', 'cash'],
    ['PM Fasal Bima Yojana (PMFBY)', 'प्रधानमंत्री फसल बीमा योजना', 'ప్రధానమంత్రి ఫసల్ బీమా యోజన', 'Crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities, pests, and diseases.', 'प्राकृतिक आपदाओं, कीटों और रोगों के कारण फसल हानि से पीड़ित किसानों को वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना।', 'ప్రకృతి వైపరీత్యాలు, తెగుళ్లు మరియు వ్యాధుల వల్ల పంట నష్టానికి గురైన రైతులకు ఆర్థిక మద్దతు అందించే పంట బీమా పథకం.', 'All farmers growing notified crops in notified areas.', 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान।', 'నోటిఫై చేయబడిన ప్రాంతాలలో నోటిఫై చేయబడిన పంటలు పండించే అన్ని రైతులు.', '["Aadhaar Card","Land Records","Bank Account","Sowing Certificate","Previous Season Crop Details"]', 'https://pmfby.gov.in', 'shield'],
    ['Kisan Credit Card (KCC)', 'किसान क्रेडिट कार्ड', 'కిసాన్ క్రెడిట్ కార్డ్', 'Provides farmers with affordable credit for agricultural needs including crop production and post-harvest expenses.', 'किसानों को फसल उत्पादन और कटाई के बाद के खर्चों सहित कृषि आवश्यकताओं के लिए किफायती ऋण प्रदान करता है।', 'రైతులకు పంట ఉత్పత్తి మరియు కోత అనంతర ఖర్చులతో సహా వ్యవసాయ అవసరాలకు సరసమైన రుణం అందిస్తుంది.', 'All farmers — individual/joint borrowers who are owner-cultivators.', 'सभी किसान — व्यक्तिगत/संयुक्त उधारकर्ता जो मालिक-किसान हैं।', 'వ్యక్తిగత/సంయుక్త రుణగ్రహీతలు అయిన అన్ని రైతులు-యజమాని-సాగుదారులు.', '["Aadhaar Card","Land Records","Passport Photo","Application Form","Identity Proof"]', 'https://www.pmkisan.gov.in/KCC', 'credit-card'],
    ['Soil Health Card Scheme', 'मृदा स्वास्थ्य कार्ड योजना', 'నేల ఆరోగ్య కార్డ్ పథకం', 'Provides soil health cards carrying information on nutrient status and fertilizer recommendations.', 'पोषक तत्वों की स्थिति और उर्वरक सिफारिशों की जानकारी वाले मृदा स्वास्थ्य कार्ड प्रदान करता है।', 'పోషక స్థితి మరియు ఎరువుల సిఫారసులపై సమాచారాన్ని కలిగి ఉన్న నేల ఆరోగ్య కార్డులను అందిస్తుంది.', 'All farmers across the country.', 'देश भर के सभी किसान।', 'దేశవ్యాప్తంగా అన్ని రైతులు.', '["Aadhaar Card","Land Details","Contact Information"]', 'https://soilhealth.dac.gov.in', 'leaf'],
    ['e-NAM (National Agriculture Market)', 'ई-नाम (राष्ट्रीय कृषि बाजार)', 'ఈ-నామ్ (జాతీయ వ్యవసాయ మార్కెట్)', 'Pan-India electronic trading portal linking APMC mandis to create a unified national market for agricultural commodities.', 'कृषि वस्तुओं के लिए एकीकृत राष्ट्रीय बाजार बनाने के लिए APMC मंडियों को जोड़ने वाला अखिल भारतीय इलेक्ट्रॉनिक व्यापार पोर्टल।', 'వ్యవసాయ వస్తువులకు ఏకీకృత జాతీయ మార్కెట్‌ను సృష్టించడానికి APMC మండీలను అనుసంధానం చేసే ఎలక్ట్రానిక్ ట్రేడింగ్ పోర్టల్.', 'Farmers, traders, and buyers registered with APMC mandis.', 'APMC मंडियों में पंजीकृत किसान, व्यापारी और खरीदार।', 'APMC మండీలలో నమోదైన రైతులు, వ్యాపారులు మరియు కొనుగోలుదారులు.', '["Aadhaar Card","Bank Account","Mobile Number","APMC Registration"]', 'https://enam.gov.in', 'globe'],
    ['Rythu Bandhu (Telangana)', 'रायतु बंधु (तेलंगाना)', 'రైతు బంధు (తెలంగాణ)', 'Telangana state scheme providing ₹10,000 per acre per year to land-owning farmers for investment in agriculture.', 'कृषि में निवेश के लिए भूमिधारक किसानों को प्रति एकड़ प्रति वर्ष ₹10,000 प्रदान करने वाली तेलंगाना राज्य योजना।', 'వ్యవసాయంలో పెట్టుబడి కోసం భూమి కలిగిన రైతులకు ఎకరానికి సంవత్సరానికి ₹10,000 అందించే తెలంగాణ రాష్ట్ర పథకం.', 'All land-owning farmers in Telangana state.', 'तेलंगाना राज्य में सभी भूमिधारक किसान।', 'తెలంగాణ రాష్ట్రంలోని అన్ని భూమి కలిగిన రైతులు.', '["Aadhaar Card","Land Records (Pattadar Passbook)","Bank Account","Ration Card"]', 'https://treasury.telangana.gov.in/rythu-bandhu', 'award'],
  ];
  for (const s of schemes) {
    await prepareRun('INSERT INTO schemes (title, title_hi, title_te, description, description_hi, description_te, eligibility, eligibility_hi, eligibility_te, required_documents, link, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', s);
  }
  console.log(`✅ Inserted ${schemes.length} government schemes`);

  // ─── Notifications ───
  const notifications = [
    [1, 'booking_confirmed', 'Booking Confirmed', 'Your slot at Warangal Mandi Center on ' + today + ' at 09:00 is confirmed.', 0],
    [1, 'queue_update', 'Queue Update', 'You are now #1 in the queue at Warangal Mandi Center.', 0],
    [2, 'booking_confirmed', 'Booking Confirmed', 'Your slot at Warangal Mandi Center on ' + today + ' at 09:00 is confirmed.', 1],
    [3, 'turn_arrived', 'Your Turn!', 'Your token has been scanned at Karimnagar Procurement Hub. You are being served.', 0],
    [4, 'booking_completed', 'Procurement Complete', 'Your soybean procurement at Nizamabad Krishi Center has been completed.', 1],
  ];
  for (const n of notifications) {
    await prepareRun('INSERT INTO notifications (farmer_id, type, title, message, is_read) VALUES (?, ?, ?, ?, ?)', n);
  }
  console.log(`✅ Inserted ${notifications.length} notifications`);

  console.log('\n🌾 Database seeded successfully!\n');
  console.log('Demo login: Mobile: 9876543210, OTP: 123456\n');
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
