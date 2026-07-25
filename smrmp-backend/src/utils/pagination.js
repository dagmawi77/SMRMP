const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  return {
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };
};

module.exports = { paginate };
