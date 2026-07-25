/**
 * Bridges auth User accounts ↔ CRM Visitor records for the Visitor Portal.
 */
const { Op } = require('sequelize');
const { Visitor } = require('../models');

const splitName = (fullName = '') => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first_name: 'Visitor', last_name: null };
  if (parts.length === 1) return { first_name: parts[0], last_name: null };
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  };
};

/**
 * Find or create a CRM Visitor linked to this user account.
 * Never throws for missing optional fields — portal always needs a profile row.
 */
const ensureVisitorForUser = async (user) => {
  if (!user?.id) return null;

  let visitor = await Visitor.findOne({
    where: { user_account_id: user.id },
  });
  if (visitor) return visitor;

  if (user.email) {
    visitor = await Visitor.findOne({
      where: {
        email: { [Op.iLike]: String(user.email).trim() },
        user_account_id: null,
      },
    });
    if (visitor) {
      await visitor.update({ user_account_id: user.id });
      return visitor;
    }
  }

  const { first_name, last_name } = splitName(user.name);
  visitor = await Visitor.create({
    first_name,
    last_name,
    email: user.email || null,
    phone: user.phone || null,
    gender: user.gender || null,
    date_of_birth: user.date_of_birth || null,
    nationality: user.nationality || null,
    national_id: user.national_id || null,
    visitor_type: 'individual',
    preferred_language: 'en',
    marketing_opt_in: true,
    user_account_id: user.id,
    registered_by: null,
    notes: 'Auto-linked from visitor portal account',
  });

  return visitor;
};

module.exports = { ensureVisitorForUser, splitName };
