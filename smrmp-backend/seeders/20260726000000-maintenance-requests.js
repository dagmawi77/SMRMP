'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*)::int AS count FROM maintenance_requests`
    );
    if (existing[0]?.count > 0) return;

    const now = new Date();

    const [maintenanceUsers] = await queryInterface.sequelize.query(
      `SELECT id, name FROM users WHERE role = 'maintenance' ORDER BY created_at ASC`
    );

    const assigneeFor = (index, fallbackLabel) => {
      if (!maintenanceUsers.length) {
        return { assigned_to: fallbackLabel, assigned_user_id: null };
      }
      const user = maintenanceUsers[index % maintenanceUsers.length];
      const roleSuffix = fallbackLabel.match(/\(([^)]+)\)/)?.[1] || 'Maintenance';
      return {
        assigned_to: `${user.name} (${roleSuffix})`,
        assigned_user_id: user.id,
      };
    };

    const rows = [
      {
        id: uuidv4(),
        request_code: 'MNT-2026-001',
        title: 'Climate Control Humidity Fluctuation in Main Vault',
        category: 'Equipment Failure',
        priority: 'Critical',
        status: 'In Progress',
        reported_by: 'Selamawit Tesfaye (Conservation)',
        report_date: new Date('2026-07-25T08:30:00'),
        building: 'Central Conservation Vault',
        floor: 'Basement 1',
        room: 'Vault Room B-04',
        hall: 'Vault Wing',
        artifact_id: 'ART-FCY7WO1C',
        artifact_name: 'Ethiopian Battle Shield (Gasha)',
        equipment_id: 'EQP-HVAC-02',
        equipment_name: 'Precision HVAC Humidifier Unit #2',
        description:
          'Relative humidity levels spiked from 48% to 68% in Vault B-04 due to sensor condensation buildup. Immediate calibration required to prevent leather artifact deterioration.',
        ...assigneeFor(0, 'Solomon Worku (IT Technician)'),
        department: 'IT Technician',
        estimated_completion: '2026-07-26',
        is_emergency: true,
        attachments: JSON.stringify([
          { id: 'att-1', name: 'humidity_sensor_log.png', type: 'image', url: 'https://images.pexels.com/photos/27849813/pexels-photo-27849813.png?auto=compress&cs=tinysrgb&w=600&q=80' },
        ]),
        timeline: JSON.stringify([
          { date: '2026-07-25 08:30', action: 'Request Submitted', user: 'Selamawit Tesfaye', note: 'Automated alert triggered from humidity monitoring sensor.' },
          { date: '2026-07-25 09:00', action: 'Reviewed & Approved', user: 'Maintenance Officer', note: 'High urgency approved for immediate dispatch.' },
          { date: '2026-07-25 10:15', action: 'Work In Progress', user: 'Solomon Worku', note: 'Technician on-site testing replacement sensor probe.' },
        ]),
        comments: JSON.stringify([]),
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        request_code: 'MNT-2026-002',
        title: 'Flickering LED Spotlight on Emperor Menelik II Portrait',
        category: 'Facility Issue',
        priority: 'Medium',
        status: 'Assigned',
        reported_by: 'Tigist Bekele (Curator)',
        report_date: new Date('2026-07-24T14:20:00'),
        building: 'Main Memorial Building',
        floor: '1st Floor',
        room: 'Main Hall - Bay 3',
        hall: 'Victory Hall',
        artifact_id: 'ART-TSF4LD8W',
        artifact_name: 'Emperor Menelik II Portrait Painting',
        equipment_id: 'EQP-LGT-104',
        equipment_name: 'Museum Grade Spot Focus LED 4000K',
        description:
          'Overhead spotlight #14 flickering intermittently causing glare and poor visual experience for gallery visitors.',
        ...assigneeFor(1, 'Kebede Alemu (Electrical Technician)'),
        department: 'Electrical Technician',
        estimated_completion: '2026-07-26',
        is_emergency: false,
        attachments: JSON.stringify([]),
        timeline: JSON.stringify([
          { date: '2026-07-24 14:20', action: 'Request Submitted', user: 'Tigist Bekele', note: 'Reported during daily morning walkthrough.' },
        ]),
        comments: JSON.stringify([]),
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        request_code: 'MNT-2026-003',
        title: 'Cracked Glass Panel on Display Case #12',
        category: 'Artifact Damage',
        priority: 'High',
        status: 'Pending Review',
        reported_by: 'Security Team Patrol',
        report_date: new Date('2026-07-25T07:15:00'),
        building: 'Adwa Victory Gallery Wing',
        floor: 'Ground Floor',
        room: 'Gallery A',
        hall: 'Heroic Gallery',
        artifact_id: 'ART-P5T4MMLD',
        artifact_name: 'Adwa Victory Commemorative Medal',
        equipment_id: 'EQP-DISP-012',
        equipment_name: 'Reinforced UV Glare Glass Case #12',
        description:
          'Hairline stress crack observed on upper right corner of protective glass enclosure. No physical contact with inner coin artifact.',
        assigned_to: 'Unassigned',
        department: 'Building Maintenance',
        estimated_completion: '2026-07-27',
        is_emergency: false,
        attachments: JSON.stringify([]),
        timeline: JSON.stringify([
          { date: '2026-07-25 07:15', action: 'Request Submitted', user: 'Security Team Patrol', note: 'Noted during 07:00 security inspection.' },
        ]),
        comments: JSON.stringify([]),
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        request_code: 'MNT-2026-004',
        title: 'Main Entrance Automatic Glass Door Sensor Malfunction',
        category: 'Facility Issue',
        priority: 'High',
        status: 'In Progress',
        reported_by: 'Visitor Services Desk',
        report_date: new Date('2026-07-23T11:00:00'),
        building: 'Visitor Center & Ticketing Plaza',
        floor: 'Ground Floor',
        room: 'Main Lobby',
        hall: 'Entrance Plaza',
        artifact_id: null,
        artifact_name: null,
        equipment_id: 'EQP-DOOR-01',
        equipment_name: 'Dorma Sliding Door Motion Sensor',
        description:
          'Automatic entrance door remaining stuck open, causing air draft and dust entry into lobby.',
        ...assigneeFor(2, 'Girma Tadesse (Building Maintenance)'),
        department: 'Building Maintenance',
        estimated_completion: '2026-07-25',
        is_emergency: false,
        attachments: JSON.stringify([]),
        timeline: JSON.stringify([
          { date: '2026-07-23 11:00', action: 'Request Submitted', user: 'Visitor Services', note: 'Door failing to close automatically.' },
        ]),
        comments: JSON.stringify([]),
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        request_code: 'MNT-2026-005',
        title: 'Water Leakage in Restroom B2 Ceiling',
        category: 'Facility Issue',
        priority: 'Critical',
        status: 'Completed',
        reported_by: 'Aster Desta (Cleaning Lead)',
        report_date: new Date('2026-07-22T15:45:00'),
        building: 'Administration Block',
        floor: 'Basement 2',
        room: 'Restroom B2-Male',
        hall: 'Service Corridor',
        artifact_id: null,
        artifact_name: null,
        equipment_id: 'EQP-PLMB-88',
        equipment_name: 'Drainage Pipe Joint B2',
        description:
          'Dripping water from overhead wastewater pipe near light fixture. Risk of short circuit.',
        assigned_to: 'Girma Tadesse (Building Maintenance)',
        department: 'Building Maintenance',
        estimated_completion: '2026-07-23',
        is_emergency: true,
        attachments: JSON.stringify([]),
        timeline: JSON.stringify([
          { date: '2026-07-22 15:45', action: 'Request Submitted', user: 'Aster Desta', note: 'Emergency water drip.' },
          { date: '2026-07-24 10:00', action: 'Verified', user: 'Maintenance Officer', note: 'No leaks observed after 24 hours pressure test.' },
        ]),
        comments: JSON.stringify([]),
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        request_code: 'MNT-2026-006',
        title: 'Interactive Touchscreen Kiosk #4 OS Freeze',
        category: 'Equipment Failure',
        priority: 'Low',
        status: 'Closed',
        reported_by: 'IT Helpdesk',
        report_date: new Date('2026-07-20T09:15:00'),
        building: 'Main Memorial Building',
        floor: '2nd Floor',
        room: 'Interactive Zone',
        hall: 'Learning Center',
        artifact_id: null,
        artifact_name: null,
        equipment_id: 'EQP-SCRN-04',
        equipment_name: '4K Touch Kiosk Display System',
        description:
          'Touch interface unresponsive after firmware push. Requires manual reboot and driver update.',
        assigned_to: 'Solomon Worku (IT Technician)',
        department: 'IT Technician',
        estimated_completion: '2026-07-21',
        is_emergency: false,
        attachments: JSON.stringify([]),
        timeline: JSON.stringify([
          { date: '2026-07-20 09:15', action: 'Submitted', user: 'IT Helpdesk', note: 'Kiosk touchscreen unresponsive.' },
          { date: '2026-07-21 14:00', action: 'Closed', user: 'Maintenance Officer', note: 'System updated and verified operational.' },
        ]),
        comments: JSON.stringify([]),
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('maintenance_requests', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('maintenance_requests', null, {});
  },
};
