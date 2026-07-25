/**
 * Module 8 — Group / school booking management with tiered pricing.
 */
const { Op, fn, col } = require('sequelize');
const { GroupBooking, VisitLog, User } = require('../models');
const {
  generateBookingReference,
  generateInvoiceNumber,
} = require('../utils/referenceGenerator');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { writeAuditLog } = require('../middleware/auditLogger');

const toCount = (value) => Number(value) || 0;

/** Tiered per-person pricing + flat guide surcharge. */
const calculatePricing = (visitorCount, guideRequired) => {
  let pricePerPerson;
  if (visitorCount >= 30) {
    pricePerPerson = 75;
  } else if (visitorCount >= 10) {
    pricePerPerson = 100;
  } else {
    pricePerPerson = 150;
  }
  const totalAmount = pricePerPerson * visitorCount + (guideRequired ? 500 : 0);
  return { pricePerPerson, totalAmount };
};

const minVisitDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateOnly = (value) => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const BOOKING_INCLUDE = [
  { model: User, as: 'assignedStaff', attributes: ['id', 'name'] },
  { model: User, as: 'createdBy', attributes: ['id', 'name'] },
];

/** POST /api/group-bookings — public submission */
const createGroupBooking = async (req, res) => {
  try {
    // Accept PRD field aliases (organiser_*, organisation_*, expected_count, preferred_time)
    const group_name =
      req.body.group_name || req.body.organisation_name || req.body.organization_name;
    const contact_name = req.body.contact_name || req.body.organiser_name || req.body.organizer_name;
    const contact_phone = req.body.contact_phone || req.body.organiser_phone || req.body.organizer_phone;
    const contact_email = req.body.contact_email || req.body.organiser_email || req.body.organizer_email;
    const visitor_count = req.body.visitor_count || req.body.expected_count;
    const visit_date = req.body.visit_date;
    const group_type = req.body.group_type || req.body.organisation_type || req.body.organization_type;
    const visit_time = req.body.visit_time || req.body.preferred_time;

    if (!group_name || !contact_name || !contact_phone || !visitor_count || !visit_date) {
      return sendError(
        res,
        400,
        'group_name, contact_name, contact_phone, visitor_count, and visit_date are required'
      );
    }

    const count = parseInt(visitor_count, 10);
    if (!Number.isFinite(count) || count < 2) {
      return sendError(res, 400, 'visitor_count must be at least 2 for a group booking');
    }

    const requestedDate = new Date(formatDateOnly(visit_date));
    if (Number.isNaN(requestedDate.getTime()) || requestedDate < minVisitDate()) {
      return sendError(res, 400, 'visit_date must be at least 3 days from today');
    }

    const guideRequired = Boolean(req.body.guide_required);
    const { pricePerPerson, totalAmount } = calculatePricing(count, guideRequired);

    const payment_status = req.body.payment_status || 'pending';
    const payment_reference = req.body.payment_reference || null;
    const initialStatus =
      req.body.status || (payment_status === 'completed' ? 'confirmed' : 'pending');

    const booking = await GroupBooking.create({
      booking_reference: generateBookingReference(),
      group_name: String(group_name).trim(),
      group_type: group_type || 'other',
      contact_name: String(contact_name).trim(),
      contact_email: contact_email || null,
      contact_phone: String(contact_phone).trim(),
      visitor_count: count,
      visit_date: formatDateOnly(visit_date),
      visit_time: visit_time || null,
      guide_required: guideRequired,
      special_requirements: req.body.special_requirements || null,
      price_per_person: pricePerPerson,
      total_amount: totalAmount,
      status: initialStatus,
      payment_status,
      payment_reference,
      confirmed_at: payment_status === 'completed' ? new Date() : null,
      created_by: req.user?.id || null,
    });

    return sendSuccess(res, 201, 'Group booking request submitted successfully', {
      booking,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to create group booking', error.message);
  }
};

/** GET /api/group-bookings */
const listGroupBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, group_type, visit_date, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (group_type) where.group_type = group_type;
    if (visit_date) where.visit_date = formatDateOnly(visit_date);
    if (search) {
      where[Op.or] = [
        { group_name: { [Op.iLike]: `%${search}%` } },
        { contact_name: { [Op.iLike]: `%${search}%` } },
        { booking_reference: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const paging = paginate(page, limit);
    const { count, rows } = await GroupBooking.findAndCountAll({
      where,
      include: BOOKING_INCLUDE,
      order: [['visit_date', 'ASC']],
      ...paging,
    });

    return sendSuccess(res, 200, 'Group bookings retrieved', {
      bookings: rows,
      pagination: {
        total: count,
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve group bookings', error.message);
  }
};

/** GET /api/group-bookings/today */
const getTodaysBookings = async (req, res) => {
  try {
    const today = formatDateOnly(new Date());
    const bookings = await GroupBooking.findAll({
      where: { visit_date: today, status: { [Op.ne]: 'cancelled' } },
      include: BOOKING_INCLUDE,
      order: [['visit_time', 'ASC']],
    });
    return sendSuccess(res, 200, "Today's group bookings retrieved", { bookings });
  } catch (error) {
    return sendError(res, 500, "Failed to retrieve today's group bookings", error.message);
  }
};

/** GET /api/group-bookings/calendar?start=&end= */
const getBookingCalendar = async (req, res) => {
  try {
    const { start, end } = req.query;
    const where = { status: { [Op.ne]: 'cancelled' } };
    if (start && end) {
      where.visit_date = { [Op.between]: [formatDateOnly(start), formatDateOnly(end)] };
    }

    const rows = await GroupBooking.findAll({
      attributes: [
        'visit_date',
        [fn('COUNT', col('id')), 'bookings'],
        [fn('SUM', col('visitor_count')), 'visitors'],
      ],
      where,
      group: ['visit_date'],
      order: [['visit_date', 'ASC']],
      raw: true,
    });

    return sendSuccess(res, 200, 'Booking calendar retrieved', {
      calendar: rows.map((row) => ({
        visit_date: row.visit_date,
        bookings: toCount(row.bookings),
        visitors: toCount(row.visitors),
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve booking calendar', error.message);
  }
};

/** GET /api/group-bookings/:id */
const getGroupBookingById = async (req, res) => {
  try {
    const booking = await GroupBooking.findByPk(req.params.id, { include: BOOKING_INCLUDE });
    if (!booking) {
      return sendError(res, 404, 'Group booking not found');
    }
    return sendSuccess(res, 200, 'Group booking retrieved', { booking });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve group booking', error.message);
  }
};

/** PUT /api/group-bookings/:id */
const updateGroupBooking = async (req, res) => {
  try {
    const booking = await GroupBooking.findByPk(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Group booking not found');
    }

    const oldValues = booking.get({ plain: true });
    const fields = [
      'group_name',
      'group_type',
      'contact_name',
      'contact_email',
      'contact_phone',
      'visitor_count',
      'visit_date',
      'visit_time',
      'guide_required',
      'special_requirements',
      'assigned_staff_id',
      'payment_status',
      'payment_reference',
      'notes',
    ];
    const payload = {};
    for (const field of fields) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }
    if (payload.visit_date) payload.visit_date = formatDateOnly(payload.visit_date);

    if (payload.visitor_count !== undefined || payload.guide_required !== undefined) {
      const count = payload.visitor_count !== undefined ? Number(payload.visitor_count) : booking.visitor_count;
      const guide = payload.guide_required !== undefined ? Boolean(payload.guide_required) : booking.guide_required;
      const { pricePerPerson, totalAmount } = calculatePricing(count, guide);
      payload.price_per_person = pricePerPerson;
      payload.total_amount = totalAmount;
    }

    await booking.update(payload);

    await writeAuditLog({
      userId: req.user?.id,
      action: 'UPDATE',
      tableName: 'group_bookings',
      recordId: booking.id,
      oldValues,
      newValues: payload,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Group booking updated successfully', { booking });
  } catch (error) {
    return sendError(res, 500, 'Failed to update group booking', error.message);
  }
};

/** POST /api/group-bookings/:id/confirm */
const confirmBooking = async (req, res) => {
  try {
    const booking = await GroupBooking.findByPk(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Group booking not found');
    }
    if (booking.status === 'cancelled') {
      return sendError(res, 400, 'Cannot confirm a cancelled booking');
    }

    await booking.update({
      status: 'confirmed',
      confirmed_at: new Date(),
      assigned_staff_id: req.body.assigned_staff_id || booking.assigned_staff_id,
      payment_status: req.body.payment_status || booking.payment_status,
      payment_reference: req.body.payment_reference || booking.payment_reference,
    });

    return sendSuccess(res, 200, 'Group booking confirmed successfully', { booking });
  } catch (error) {
    return sendError(res, 500, 'Failed to confirm group booking', error.message);
  }
};

/** POST /api/group-bookings/:id/cancel */
const cancelBooking = async (req, res) => {
  try {
    const booking = await GroupBooking.findByPk(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Group booking not found');
    }

    await booking.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: req.body.reason || null,
    });

    return sendSuccess(res, 200, 'Group booking cancelled successfully', { booking });
  } catch (error) {
    return sendError(res, 500, 'Failed to cancel group booking', error.message);
  }
};

/** POST /api/group-bookings/:id/complete */
const completeBooking = async (req, res) => {
  try {
    const booking = await GroupBooking.findByPk(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Group booking not found');
    }
    if (booking.status === 'cancelled') {
      return sendError(res, 400, 'Cannot complete a cancelled booking');
    }

    await booking.update({ status: 'completed', completed_at: new Date() });

    const visitLog = await VisitLog.create({
      group_booking_id: booking.id,
      staff_id: req.user?.id || null,
      entry_method: 'group_booking',
      visitor_count: booking.visitor_count,
      purpose: booking.group_type,
    });

    return sendSuccess(res, 200, 'Group booking completed successfully', {
      booking,
      visit_log: visitLog,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to complete group booking', error.message);
  }
};

/** GET /api/group-bookings/:id/invoice */
const generateInvoice = async (req, res) => {
  try {
    const booking = await GroupBooking.findByPk(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Group booking not found');
    }

    let invoiceNumber = booking.invoice_number;
    if (!invoiceNumber) {
      invoiceNumber = generateInvoiceNumber();
      await booking.update({ invoice_number: invoiceNumber });
    }

    return sendSuccess(res, 200, 'Invoice generated', {
      invoice: {
        invoice_number: invoiceNumber,
        booking_reference: booking.booking_reference,
        group_name: booking.group_name,
        contact_name: booking.contact_name,
        contact_email: booking.contact_email,
        visit_date: booking.visit_date,
        visitor_count: booking.visitor_count,
        price_per_person: Number(booking.price_per_person),
        guide_required: booking.guide_required,
        guide_fee: booking.guide_required ? 500 : 0,
        total_amount: Number(booking.total_amount),
        payment_status: booking.payment_status,
        issued_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to generate invoice', error.message);
  }
};

module.exports = {
  createGroupBooking,
  listGroupBookings,
  getGroupBookingById,
  updateGroupBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getTodaysBookings,
  getBookingCalendar,
  generateInvoice,
  calculatePricing,
};
