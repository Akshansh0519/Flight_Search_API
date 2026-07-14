'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Seed Airplanes if missing
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO Airplanes (id, modelNumber, capacity, createdAt, updatedAt) VALUES
      (1, 'Airbus A320neo', 180, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}'),
      (2, 'Boeing 737 MAX 8', 189, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}'),
      (3, 'Boeing 787-9 Dreamliner', 290, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}'),
      (4, 'Airbus A321LR', 220, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}'),
      (5, 'ATR 72-600', 72, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}')
    `);

    // 2. Seed Major Indian State Capitals & Critical Hubs (25+ Cities)
    const citiesData = [
      { name: 'New Delhi', code: 'DEL' },
      { name: 'Mumbai', code: 'BOM' },
      { name: 'Bengaluru', code: 'BLR' },
      { name: 'Hyderabad', code: 'HYD' },
      { name: 'Kolkata', code: 'CCU' },
      { name: 'Chennai', code: 'MAA' },
      { name: 'Ahmedabad', code: 'AMD' },
      { name: 'Pune', code: 'PNQ' },
      { name: 'Jaipur', code: 'JAI' },
      { name: 'Lucknow', code: 'LKO' },
      { name: 'Goa', code: 'GOI' },
      { name: 'Kochi', code: 'COK' },
      { name: 'Guwahati', code: 'GAU' },
      { name: 'Amritsar', code: 'ATQ' },
      { name: 'Srinagar', code: 'SXR' },
      { name: 'Patna', code: 'PAT' },
      { name: 'Bhubaneswar', code: 'BBI' },
      { name: 'Chandigarh', code: 'IXC' },
      { name: 'Indore', code: 'IDR' },
      { name: 'Thiruvananthapuram', code: 'TRV' },
      { name: 'Varanasi', code: 'VNS' },
      { name: 'Nagpur', code: 'NAG' },
      { name: 'Coimbatore', code: 'CJB' },
      { name: 'Visakhapatnam', code: 'VTZ' },
      { name: 'Vadodara', code: 'BDQ' }
    ];

    for (const c of citiesData) {
      await queryInterface.sequelize.query(`
        INSERT IGNORE INTO Cities (name, code, createdAt, updatedAt)
        VALUES ('${c.name}', '${c.code}', '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}')
      `);
    }

    // Get City IDs mapping
    const [citiesRows] = await queryInterface.sequelize.query(`SELECT id, code FROM Cities`);
    const cityMap = {};
    citiesRows.forEach(r => { cityMap[r.code] = r.id; });

    // 3. Seed Indian Airports (mapped accurately to their cityId)
    const airportsData = [
      { name: 'Indira Gandhi International Airport', code: 'DEL', address: 'Palam, New Delhi, Delhi 110037', cityCode: 'DEL' },
      { name: 'Chhatrapati Shivaji Maharaj International Airport', code: 'BOM', address: 'Sahar, Andheri East, Mumbai, Maharashtra 400099', cityCode: 'BOM' },
      { name: 'Kempegowda International Airport', code: 'BLR', address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300', cityCode: 'BLR' },
      { name: 'Rajiv Gandhi International Airport', code: 'HYD', address: 'Shamshabad, Hyderabad, Telangana 500409', cityCode: 'HYD' },
      { name: 'Netaji Subhash Chandra Bose International Airport', code: 'CCU', address: 'Jessore Rd, Dum Dum, Kolkata, West Bengal 700052', cityCode: 'CCU' },
      { name: 'Chennai International Airport', code: 'MAA', address: 'GST Rd, Meenambakkam, Chennai, Tamil Nadu 600027', cityCode: 'MAA' },
      { name: 'Sardar Vallabhbhai Patel International Airport', code: 'AMD', address: 'Hansol, Ahmedabad, Gujarat 380003', cityCode: 'AMD' },
      { name: 'Pune Airport', code: 'PNQ', address: 'New Airport Rd, Lohegaon, Pune, Maharashtra 411032', cityCode: 'PNQ' },
      { name: 'Jaipur International Airport', code: 'JAI', address: 'Airport Rd, Sanganer, Jaipur, Rajasthan 302029', cityCode: 'JAI' },
      { name: 'Chaudhary Charan Singh International Airport', code: 'LKO', address: 'Amausi, Lucknow, Uttar Pradesh 226009', cityCode: 'LKO' },
      { name: 'Manohar International Airport (Mopa / Dabolim)', code: 'GOI', address: 'Dabolim, Goa 403801', cityCode: 'GOI' },
      { name: 'Cochin International Airport', code: 'COK', address: 'Airport Rd, Nedumbassery, Kochi, Kerala 683111', cityCode: 'COK' },
      { name: 'Lokpriya Gopinath Bordoloi International Airport', code: 'GAU', address: 'Borjhar, Guwahati, Assam 781015', cityCode: 'GAU' },
      { name: 'Sri Guru Ram Dass Jee International Airport', code: 'ATQ', address: 'Ajnala Rd, Rajasansi, Amritsar, Punjab 143101', cityCode: 'ATQ' },
      { name: 'Sheikh ul-Alam International Airport', code: 'SXR', address: 'Humhama, Badgam, Srinagar, Jammu and Kashmir 190007', cityCode: 'SXR' },
      { name: 'Jay Prakash Narayan Airport', code: 'PAT', address: 'Shaheed Pir Ali Khan Marg, Patna, Bihar 800014', cityCode: 'PAT' },
      { name: 'Biju Patnaik Airport', code: 'BBI', address: 'Airport Rd, Bhubaneswar, Odisha 751020', cityCode: 'BBI' },
      { name: 'Shaheed Bhagat Singh International Airport', code: 'IXC', address: 'New Civil Air Terminal, Mohali, Chandigarh 140306', cityCode: 'IXC' },
      { name: 'Devi Ahilyabai Holkar Airport', code: 'IDR', address: 'Depalpur Rd, Indore, Madhya Pradesh 452005', cityCode: 'IDR' },
      { name: 'Thiruvananthapuram International Airport', code: 'TRV', address: 'Airport Rd, Chacka, Thiruvananthapuram, Kerala 695008', cityCode: 'TRV' },
      { name: 'Lal Bahadur Shastri International Airport', code: 'VNS', address: 'Babatpur, Varanasi, Uttar Pradesh 221006', cityCode: 'VNS' },
      { name: 'Dr. Babasaheb Ambedkar International Airport', code: 'NAG', address: 'Sonegaon, Nagpur, Maharashtra 440005', cityCode: 'NAG' },
      { name: 'Coimbatore International Airport', code: 'CJB', address: 'Avinashi Rd, Civil Aerodrome Post, Coimbatore, Tamil Nadu 641014', cityCode: 'CJB' },
      { name: 'Visakhapatnam Airport', code: 'VTZ', address: 'NH 16, Opposite NAD Kotha Road, Visakhapatnam, AP 530009', cityCode: 'VTZ' },
      { name: 'Civil Airport Harni', code: 'BDQ', address: 'Harni Rd, Vadodara, Gujarat 390022', cityCode: 'BDQ' }
    ];

    for (const a of airportsData) {
      const cityId = cityMap[a.cityCode] || 1;
      await queryInterface.sequelize.query(`
        INSERT IGNORE INTO Airports (name, code, address, cityId, createdAt, updatedAt)
        VALUES ('${a.name}', '${a.code}', '${a.address}', ${cityId}, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}')
      `);
    }

    // 4. Seed 160+ Realistic Domestic Indian Flights
    const routes = [
      ['DEL', 'BOM'], ['BOM', 'DEL'], ['DEL', 'BLR'], ['BLR', 'DEL'],
      ['DEL', 'HYD'], ['HYD', 'DEL'], ['DEL', 'CCU'], ['CCU', 'DEL'],
      ['DEL', 'MAA'], ['MAA', 'DEL'], ['DEL', 'GOI'], ['GOI', 'DEL'],
      ['DEL', 'SXR'], ['SXR', 'DEL'], ['DEL', 'PAT'], ['PAT', 'DEL'],
      ['DEL', 'LKO'], ['LKO', 'DEL'], ['DEL', 'JAI'], ['JAI', 'DEL'],
      ['DEL', 'ATQ'], ['ATQ', 'DEL'], ['DEL', 'GAU'], ['GAU', 'DEL'],
      ['BOM', 'BLR'], ['BLR', 'BOM'], ['BOM', 'GOI'], ['GOI', 'BOM'],
      ['BOM', 'HYD'], ['HYD', 'BOM'], ['BOM', 'MAA'], ['MAA', 'BOM'],
      ['BOM', 'CCU'], ['CCU', 'BOM'], ['BOM', 'AMD'], ['AMD', 'BOM'],
      ['BOM', 'JAI'], ['JAI', 'BOM'], ['BOM', 'PNQ'], ['PNQ', 'BOM'],
      ['BLR', 'HYD'], ['HYD', 'BLR'], ['BLR', 'MAA'], ['MAA', 'BLR'],
      ['BLR', 'GOI'], ['GOI', 'BLR'], ['BLR', 'CCU'], ['CCU', 'BLR'],
      ['BLR', 'COK'], ['COK', 'BLR'], ['HYD', 'MAA'], ['MAA', 'HYD'],
      ['HYD', 'CCU'], ['CCU', 'HYD'], ['HYD', 'GOI'], ['GOI', 'HYD'],
      ['HYD', 'VTZ'], ['VTZ', 'HYD'], ['HYD', 'BBI'], ['BBI', 'HYD'],
      ['CCU', 'GAU'], ['GAU', 'CCU'], ['CCU', 'MAA'], ['MAA', 'CCU'],
      ['CCU', 'PAT'], ['PAT', 'CCU'], ['CCU', 'BBI'], ['BBI', 'CCU'],
      ['MAA', 'COK'], ['COK', 'MAA'], ['MAA', 'TRV'], ['TRV', 'MAA'],
      ['MAA', 'CJB'], ['CJB', 'MAA'], ['AMD', 'DEL'], ['DEL', 'AMD'],
      ['PNQ', 'DEL'], ['DEL', 'PNQ'], ['PNQ', 'BLR'], ['BLR', 'PNQ'],
      ['IXC', 'DEL'], ['DEL', 'IXC'], ['IDR', 'DEL'], ['DEL', 'IDR'],
      ['VNS', 'DEL'], ['DEL', 'VNS'], ['NAG', 'BOM'], ['BOM', 'NAG'],
      ['BDQ', 'BOM'], ['BOM', 'BDQ'], ['TRV', 'DEL'], ['DEL', 'TRV']
    ];

    const gates = ['T3-A12', 'T3-B04', 'T2-G14', 'T2-C08', 'T1-A02', 'T1-D15', 'G-05', 'G-18', 'T2-E09', 'T3-C21'];
    const planes = [
      { id: 1, seats: 180 },
      { id: 2, seats: 189 },
      { id: 3, seats: 290 },
      { id: 4, seats: 220 },
      { id: 5, seats: 72 }
    ];

    let flightCounter = 101;
    for (const [dep, arr] of routes) {
      // Create 2 flights per route across next 15 days
      for (let dayOffset = 1; dayOffset <= 2; dayOffset++) {
        const depTime = new Date();
        depTime.setDate(depTime.getDate() + dayOffset * 3);
        depTime.setHours(6 + (flightCounter % 14), (flightCounter * 15) % 60, 0, 0);

        const arrTime = new Date(depTime);
        arrTime.setHours(arrTime.getHours() + 2, arrTime.getMinutes() + 15);

        const plane = planes[flightCounter % planes.length];
        const price = 3499 + ((flightCounter * 317) % 8500);
        const gate = gates[flightCounter % gates.length];
        const flightNum = `SE-${flightCounter}`;

        await queryInterface.sequelize.query(`
          INSERT IGNORE INTO Flights (flightNumber, aeroplaneId, departureAirportId, arrivalAirportId, arrivalTime, departureTime, price, boardngGate, totalSeats, createdAt, updatedAt)
          VALUES ('${flightNum}', ${plane.id}, '${dep}', '${arr}', '${arrTime.toISOString().slice(0, 19).replace('T', ' ')}', '${depTime.toISOString().slice(0, 19).replace('T', ' ')}', ${price}, '${gate}', ${plane.seats}, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}')
        `);

        flightCounter++;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DELETE FROM Flights WHERE flightNumber LIKE 'SE-%'`);
  }
};
