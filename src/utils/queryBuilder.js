module.exports = {
  buildDateFilter: (query, column, startDate, endDate) => {
    if (startDate && endDate) {
      query.whereBetween(column, [startDate, endDate]);
    }
    return query;
  },

  buildTextFilter: (query, column, value) => {
    if (value) {
      query.where(column, 'ilike', `%${value}%`);
    }
    return query;
  }
};