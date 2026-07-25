'use strict';

const { v4: uuidv4 } = require('uuid');

// Fixed tier UUIDs so re-seeds / references stay stable across environments.
const TIER_IDS = {
  bronze: 'a1000000-0000-4000-8000-000000000001',
  silver: 'a1000000-0000-4000-8000-000000000002',
  gold: 'a1000000-0000-4000-8000-000000000003',
  student: 'a1000000-0000-4000-8000-000000000004',
  corporate: 'a1000000-0000-4000-8000-000000000005',
};

const SEED_MARKER = 'SEED-M8';

const FEEDBACK_COMMENTS = [
  'The Battle of Adwa exhibit was breathtaking and deeply moving.',
  'Staff were very helpful and knowledgeable about the artifacts.',
  'The facility could use better signage for the restrooms.',
  'Ticket purchase online was smooth and quick.',
  'Overall a wonderful experience, will definitely come back.',
  'The guided tour felt rushed, would like more time per gallery.',
  'Loved the Amharic descriptions alongside English ones.',
  'Gift shop prices are a bit high for students.',
  'Conservation lab display was fascinating to watch.',
  'Parking was difficult to find during the weekend.',
  'The QR code artifact info was a great touch of technology.',
  'Air conditioning was not working well in Gallery B.',
  'My children enjoyed the ceremonial artifacts section the most.',
  'Would appreciate more seating areas near the main hall.',
  'Excellent curation and historical accuracy throughout.',
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + (n % 8), 30, 0, 0);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d;
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return toDateOnly(d);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [existingTiers] = await queryInterface.sequelize.query(
      `SELECT id FROM membership_tiers WHERE id = :id LIMIT 1`,
      { replacements: { id: TIER_IDS.bronze } }
    );
    const tiersExist = Boolean(existingTiers?.length);

    const [userRows] = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('admin@adwa.museum', 'curator@adwa.museum', 'conservation@adwa.museum')`
    );
    const userIdByEmail = Object.fromEntries((userRows || []).map((u) => [u.email, u.id]));
    const adminId = userIdByEmail['admin@adwa.museum'] || null;
    const curatorId = userIdByEmail['curator@adwa.museum'] || null;
    const conservationId = userIdByEmail['conservation@adwa.museum'] || null;

    // ─── 1. Membership tiers ────────────────────────────────────
    const tierRows = [
      {
        id: TIER_IDS.bronze,
        name: 'Bronze',
        slug: 'bronze',
        description: 'Entry-level annual membership with free single admission.',
        price_etb: 500,
        duration_months: 12,
        benefits: ['1 free visit per month', '5% gift shop discount'],
        max_guests: 0,
        discount_percent: 5,
        is_active: true,
        display_order: 1,
      },
      {
        id: TIER_IDS.silver,
        name: 'Silver',
        slug: 'silver',
        description: 'Mid-tier membership with guest privileges.',
        price_etb: 1200,
        duration_months: 12,
        benefits: ['Unlimited free visits', '1 guest pass per visit', '10% gift shop discount'],
        max_guests: 1,
        discount_percent: 10,
        is_active: true,
        display_order: 2,
      },
      {
        id: TIER_IDS.gold,
        name: 'Gold',
        slug: 'gold',
        description: 'Premium membership with priority access and event invites.',
        price_etb: 2500,
        duration_months: 12,
        benefits: [
          'Unlimited free visits',
          '2 guest passes per visit',
          '15% gift shop discount',
          'Priority exhibition previews',
        ],
        max_guests: 2,
        discount_percent: 15,
        is_active: true,
        display_order: 3,
      },
      {
        id: TIER_IDS.student,
        name: 'Student',
        slug: 'student',
        description: 'Discounted membership for verified students.',
        price_etb: 300,
        duration_months: 12,
        benefits: ['Unlimited free visits', '5% gift shop discount'],
        max_guests: 0,
        discount_percent: 5,
        is_active: true,
        display_order: 0,
      },
      {
        id: TIER_IDS.corporate,
        name: 'Corporate',
        slug: 'corporate',
        description: 'Organization-wide membership for staff and clients.',
        price_etb: 5000,
        duration_months: 12,
        benefits: [
          'Unlimited free visits for up to 5 staff',
          '20% gift shop discount',
          'Complimentary annual gala invitation',
        ],
        max_guests: 5,
        discount_percent: 20,
        is_active: true,
        display_order: 4,
      },
    ];

    let visitorIds = [];

    if (!tiersExist) {
    await queryInterface.bulkInsert(
      'membership_tiers',
      // Raw bulkInsert has no attribute/type metadata, so JSONB columns must
      // be given a pre-serialized JSON string rather than a JS array/object
      // (a JS array would otherwise render as an incompatible Postgres ARRAY literal).
      tierRows.map((t) => ({
        ...t,
        benefits: JSON.stringify(t.benefits),
        created_at: now,
        updated_at: now,
      }))
    );

    // ─── 2. Visitors ────────────────────────────────────────────
    const visitorDefs = [
      { first_name: 'Abebe', last_name: 'Kebede', visitor_type: 'individual' },
      { first_name: 'Tigist', last_name: 'Alemu', visitor_type: 'member' },
      { first_name: 'Dawit', last_name: 'Bekele', visitor_type: 'member' },
      { first_name: 'Selamawit', last_name: 'Girma', visitor_type: 'vip' },
      { first_name: 'Yohannes', last_name: 'Tesfaye', visitor_type: 'individual' },
      { first_name: 'Meron', last_name: 'Haile', visitor_type: 'member' },
      { first_name: 'Solomon', last_name: 'Wolde', visitor_type: 'researcher' },
      { first_name: 'Hanna', last_name: 'Mekonnen', visitor_type: 'student' },
      { first_name: 'Bereket', last_name: 'Assefa', visitor_type: 'individual' },
      { first_name: 'Rahel', last_name: 'Tadesse', visitor_type: 'member' },
      { first_name: 'Getachew', last_name: 'Molla', visitor_type: 'group' },
      { first_name: 'Eden', last_name: 'Fikru', visitor_type: 'member' },
    ];

    const visitorRows = visitorDefs.map((v, idx) => ({
      id: uuidv4(),
      first_name: v.first_name,
      last_name: v.last_name,
      email: `${v.first_name.toLowerCase()}.${v.last_name.toLowerCase()}@example.com`,
      phone: `+25191${String(2000000 + idx).slice(-7)}`,
      gender: idx % 2 === 0 ? 'male' : 'female',
      date_of_birth: `19${80 + (idx % 15)}-0${(idx % 9) + 1}-1${idx % 9}`,
      nationality: 'Ethiopian',
      national_id: null,
      address: 'Addis Ababa, Ethiopia',
      visitor_type: v.visitor_type,
      photo_url: null,
      preferred_language: 'en',
      marketing_opt_in: true,
      is_blacklisted: false,
      total_visits: idx + 1,
      total_spent: (idx + 1) * 50,
      last_visit_at: daysAgo(idx),
      notes: SEED_MARKER,
      registered_by: curatorId,
      user_account_id: null,
      created_at: daysAgo(30 - idx),
      updated_at: now,
      deleted_at: null,
    }));

    await queryInterface.bulkInsert('visitors', visitorRows);
    const visitorIdByName = Object.fromEntries(
      visitorDefs.map((v, idx) => [`${v.first_name} ${v.last_name}`, visitorRows[idx].id])
    );
    visitorIds = visitorRows.map((v) => v.id);

    // ─── 3. Memberships ─────────────────────────────────────────
    const membershipDefs = [
      { visitor: 'Tigist Alemu', tier: TIER_IDS.gold, status: 'active', startDaysAgo: 60 },
      { visitor: 'Dawit Bekele', tier: TIER_IDS.silver, status: 'active', startDaysAgo: 300 },
      { visitor: 'Meron Haile', tier: TIER_IDS.bronze, status: 'active', startDaysAgo: 20 },
      { visitor: 'Rahel Tadesse', tier: TIER_IDS.gold, status: 'active', startDaysAgo: 340 },
      { visitor: 'Eden Fikru', tier: TIER_IDS.student, status: 'active', startDaysAgo: 90 },
      { visitor: 'Selamawit Girma', tier: TIER_IDS.corporate, status: 'expired', startDaysAgo: 400 },
      { visitor: 'Abebe Kebede', tier: TIER_IDS.bronze, status: 'cancelled', startDaysAgo: 100 },
    ];

    const membershipRows = membershipDefs.map((m, idx) => {
      const startDate = toDateOnly(daysAgo(m.startDaysAgo));
      const endDate = addMonths(startDate, 12);
      const year = new Date().getFullYear();
      return {
        id: uuidv4(),
        membership_number: `ADWA-${year}-${String(10000 + idx)}`,
        visitor_id: visitorIdByName[m.visitor],
        tier_id: m.tier,
        status: m.status,
        start_date: startDate,
        end_date: endDate,
        price_paid: 500,
        payment_method: 'telebirr',
        payment_reference: `DEMO-MBR-${idx}`,
        auto_renew: idx % 2 === 0,
        qr_code: `MBR-SEED${String(idx).padStart(2, '0')}${uuidv4().slice(0, 4).toUpperCase()}`,
        card_issued: true,
        renewal_reminder_sent_at: null,
        cancelled_at: m.status === 'cancelled' ? daysAgo(5) : null,
        cancellation_reason: m.status === 'cancelled' ? 'Visitor requested cancellation' : null,
        created_by: curatorId,
        created_at: daysAgo(m.startDaysAgo),
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert('memberships', membershipRows);

    // ─── 4. Group bookings ──────────────────────────────────────
    const year = new Date().getFullYear();
    const groupBookingDefs = [
      {
        group_name: 'Adwa Preparatory School',
        group_type: 'school',
        visitor_count: 25,
        status: 'confirmed',
        payment_status: 'completed',
        visit_date: toDateOnly(now),
        visit_time: '09:30',
      },
      {
        group_name: 'Blue Nile Tours',
        group_type: 'tourist',
        visitor_count: 8,
        status: 'pending',
        payment_status: 'pending',
        visit_date: toDateOnly(daysFromNow(10)),
        visit_time: '11:00',
      },
      {
        group_name: 'Ethio Telecom Staff Outing',
        group_type: 'corporate',
        visitor_count: 35,
        status: 'confirmed',
        payment_status: 'completed',
        visit_date: toDateOnly(daysFromNow(20)),
        visit_time: '14:00',
      },
      {
        group_name: 'Gondar University History Club',
        group_type: 'school',
        visitor_count: 15,
        status: 'completed',
        payment_status: 'completed',
        visit_date: toDateOnly(daysAgo(15)),
        visit_time: '10:00',
      },
    ];

    const groupBookingRows = groupBookingDefs.map((g, idx) => {
      let pricePerPerson;
      if (g.visitor_count >= 30) pricePerPerson = 75;
      else if (g.visitor_count >= 10) pricePerPerson = 100;
      else pricePerPerson = 150;
      const guideRequired = idx % 2 === 0;
      const totalAmount = pricePerPerson * g.visitor_count + (guideRequired ? 500 : 0);

      return {
        id: uuidv4(),
        booking_reference: `GRP-${year}-${String(20000 + idx)}`,
        group_name: g.group_name,
        group_type: g.group_type,
        contact_name: `${g.group_name} Coordinator`,
        contact_email: `coordinator${idx}@example.com`,
        contact_phone: `+25192${String(3000000 + idx).slice(-7)}`,
        visitor_count: g.visitor_count,
        visit_date: g.visit_date,
        visit_time: g.visit_time,
        guide_required: guideRequired,
        special_requirements: null,
        price_per_person: pricePerPerson,
        total_amount: totalAmount,
        status: g.status,
        payment_status: g.payment_status,
        payment_reference: g.payment_status === 'completed' ? `DEMO-GRP-${idx}` : null,
        invoice_number: g.status === 'completed' ? `INV-${year}-${String(30000 + idx)}` : null,
        assigned_staff_id: conservationId,
        created_by: curatorId,
        confirmed_at: g.status !== 'pending' ? daysAgo(2) : null,
        completed_at: g.status === 'completed' ? daysAgo(15) : null,
        cancelled_at: null,
        cancellation_reason: null,
        notes: SEED_MARKER,
        created_at: daysAgo(5 + idx),
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert('group_bookings', groupBookingRows);
    const completedBooking = groupBookingRows[3];

    // ─── 5. Visit logs ──────────────────────────────────────────
    const entryMethods = [
      'qr_ticket',
      'membership_card',
      'group_booking',
      'cash_counter',
      'comp',
      'staff_assisted',
    ];
    const staffIds = [curatorId, conservationId, adminId];

    const visitLogRows = [];
    for (let i = 0; i < 29; i += 1) {
      const method = entryMethods[i % entryMethods.length];
      const visitorId = method === 'group_booking' ? null : visitorIds[i % visitorIds.length];
      visitLogRows.push({
        id: uuidv4(),
        visitor_id: visitorId,
        ticket_id: null,
        group_booking_id: method === 'group_booking' ? completedBooking.id : null,
        staff_id: staffIds[i % staffIds.length],
        entry_method: method,
        visitor_count: method === 'group_booking' ? completedBooking.visitor_count : 1,
        entry_time: daysAgo(i % 30),
        exit_time: null,
        purpose: method === 'group_booking' ? 'school' : 'leisure',
        notes: SEED_MARKER,
        created_at: daysAgo(i % 30),
        updated_at: now,
      });
    }
    // One extra entry explicitly tied to the completed booking (30th row).
    visitLogRows.push({
      id: uuidv4(),
      visitor_id: null,
      ticket_id: null,
      group_booking_id: completedBooking.id,
      staff_id: conservationId,
      entry_method: 'group_booking',
      visitor_count: completedBooking.visitor_count,
      entry_time: daysAgo(15),
      exit_time: null,
      purpose: 'school',
      notes: SEED_MARKER,
      created_at: daysAgo(15),
      updated_at: now,
    });

    await queryInterface.bulkInsert('visit_logs', visitLogRows);
    } else {
      console.log('[seed-visitors-members] Core demo rows already present — checking feedback backfill.');
      const [existingVisitors] = await queryInterface.sequelize.query(
        `SELECT id FROM visitors WHERE notes = :marker ORDER BY created_at ASC`,
        { replacements: { marker: SEED_MARKER } }
      );
      visitorIds = (existingVisitors || []).map((v) => v.id);
    }

    // ─── 6. Visitor feedback (also backfills if earlier seed stopped early) ─
    const [fbCountRows] = await queryInterface.sequelize.query(
      `SELECT COUNT(*)::int AS c FROM visitor_feedback`
    );
    if ((fbCountRows?.[0]?.c || 0) > 0) {
      console.log('[seed-visitors-members] Feedback already present — done.');
      return;
    }
    if (!visitorIds.length) {
      const [anyVisitors] = await queryInterface.sequelize.query(
        `SELECT id FROM visitors ORDER BY created_at ASC LIMIT 12`
      );
      visitorIds = (anyVisitors || []).map((v) => v.id);
    }

    const categories = ['exhibition', 'staff', 'facility', 'ticketing', 'overall'];
    const sentiments = ['positive', 'neutral', 'negative'];

    const feedbackRows = FEEDBACK_COMMENTS.map((comment, idx) => {
      const rating = 3 + (idx % 3); // 3,4,5 mix, some lower below
      const finalRating = idx % 5 === 0 ? 2 : rating;
      return {
        id: uuidv4(),
        visitor_id:
          visitorIds.length && idx % 3 === 0 ? visitorIds[idx % visitorIds.length] : null,
        visit_log_id: null,
        visitor_name: idx % 3 === 0 ? null : `Guest Visitor ${idx + 1}`,
        visitor_email: idx % 3 === 0 ? null : `guest${idx + 1}@example.com`,
        rating: finalRating,
        category: categories[idx % categories.length],
        comment,
        sentiment: sentiments[idx % sentiments.length],
        sentiment_score: idx % 3 === 0 ? 0.6 : idx % 3 === 1 ? 0.0 : -0.4,
        ai_summary: null,
        // Omit ai_tags — an explicit empty array has no inferrable Postgres
        // type in a raw bulkInsert; the column's own DEFAULT '{}' applies.
        status: idx % 4 === 0 ? 'published' : 'new',
        is_public: idx % 4 === 0,
        response_text: null,
        responded_by: null,
        responded_at: null,
        created_at: daysAgo(idx),
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert('visitor_feedback', feedbackRows);
  },

  async down(queryInterface) {
    // Scope deletes to rows tagged/prefixed by this seeder only — never a
    // blanket wipe, so unrelated data created after seeding is untouched.
    await queryInterface.sequelize.query(
      `DELETE FROM visitor_feedback WHERE comment IN (:comments)`,
      { replacements: { comments: FEEDBACK_COMMENTS } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM visit_logs WHERE notes = :marker`,
      { replacements: { marker: SEED_MARKER } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM memberships WHERE payment_reference LIKE 'DEMO-MBR-%'`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM group_bookings WHERE notes = :marker`,
      { replacements: { marker: SEED_MARKER } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM visitors WHERE notes = :marker`,
      { replacements: { marker: SEED_MARKER } }
    );
    await queryInterface.bulkDelete('membership_tiers', {
      id: Object.values(TIER_IDS),
    });
  },
};
